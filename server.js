require("dotenv").config();
const fs = require("fs");
const path = require("path");
const db = require("./db");
const express = require("express");
const app = express();
const { PORT = 8080 } = process.env;
const { uploader } = require("./middleware");
const aws = require("aws-sdk");
const s3 = new aws.S3({
    accessKeyId: process.env.AWS_KEY,
    secretAccessKey: process.env.AWS_SECRET,
});

app.use(express.static(path.join(__dirname, "public")));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
app.use(express.json());

app.post("/image", uploader.single("file"), (req, res) => {
    const { title, description, username, tagstring } = req.body;
    const { filename, mimetype, size, path } = req.file;
    const url = `https://s3.amazonaws.com/spicedling/${filename}`;

    console.log("post request for image upload");

    const insertRemoteImage = s3
        .putObject({
            Bucket: "spicedling",
            ACL: "public-read",
            Key: filename,
            Body: fs.createReadStream(path),
            ContentType: mimetype,
            ContentLength: size,
        })
        .promise();

    insertRemoteImage.then(() => {
        fs.unlinkSync(path);
        db.insertImage(url, username, title, description, tagstring)
            .then((result) => {
                res.json({
                    currentImage: {
                        username: username,
                        title: title,
                        description: description,
                        tagstring: tagstring,
                        file: url,
                        id: result.rows[0].id,
                        created_at: result.rows[0].created_at,
                    },
                    success: true,
                    message:
                        "Your photo has been added. Thank you for contributing.",
                });
            })
            .catch((err) => {
                console.log(err);
            });
    });
});

app.get("/images", (req, res) => {
    db.getImages()
        .then((entry) => {
            res.json(entry.rows);
        })
        .catch((err) => console.log(err));
});

app.get("/image/:id", (req, res) => {
    console.log("getImagebyID :", req.params.id);
    db.getImageById(req.params.id)
        .then((entry) => {
            res.json(entry.rows[0]);
        })
        .catch((err) => console.log(err));
});

app.post("/dummy", (req, res) => {
    const { title, description, username, tagstring } = req.body;
    let filename = "";
    fetch("https://picsum.photos/300")
        .then((response) => response.buffer())
        .then((buffer) => {
            filename = uid.sync(24) + ".jpeg";
            fs.writeFile(`./uploads/${filename}`, buffer);
        });
    const url = `https://s3.amazonaws.com/spicedling/${filename}`;
    const size = fs.statSync(`./uploads/${filename}`).size;
    console.log("insert dummy image");

    const insertRemoteImage = s3
        .putObject({
            Bucket: "spicedling",
            ACL: "public-read",
            Key: filename,
            Body: fs.createReadStream(`./uploads${filename}`),
            ContentType: "image/jpeg",
            ContentLength: size,
        })
        .promise();

    insertRemoteImage.then(() => {
        fs.unlinkSync(`./uploads/${filename}`);
        db.insertImage(url, username, title, description, tagstring)
            .then((result) => {
                res.json({
                    currentImage: {
                        username: username,
                        title: title,
                        description: description,
                        tagstring: tagstring,
                        file: url,
                        id: result.rows[0].id,
                        created_at: result.rows[0].created_at,
                    },
                    success: true,
                    message:
                        "Your photo has been added. Thank you for contributing.",
                });
            })
            .catch((err) => {
                console.log(err);
            });
    });

    function fetchHipsterIpsum(num) {
        const descriptions = [];
        for (let i = 0; i < num; i++) {
            descriptions.push(
                fetch(
                    "http://hipsum.co/api/?" +
                        new URLSearchParams({
                            type: "hipster-centric",
                            sentences: 3,
                        })
                ).then((response) => response.json())
            );
        }
        return Promise.all(descriptions);
    }
});

app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "index.html"));
});

https: app.listen(PORT, () => console.log(`I'm listening on port ${PORT}`));
