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
    let tags = tagstring.split(",");
    tags = tags.map((tag) => tag.trim().toLowerCase());
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
        db.insertImage(url, username, title, description, tags)
            .then((result) => {
                console.log(result.rows[0]);
                res.json({
                    entry: result.rows[0],
                    message: "Photo added!",
                });
            })
            .catch((err) => console.log(err));
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
    db.getImageById(req.params.id)
        .then((entry) => {
            res.json(entry.rows[0]);
        })
        .catch((err) => console.log(err));
});

app.post("/comments", (req, res) => {
    const { imageId, comment, username } = req.body;
    db.insertComment(imageId, comment, username).then((data) => {
        res.json(data.rows[0]);
    });
});

app.get("/comments/:imageId", (req, res) => {
    const imageId = req.params.imageId;
    db.getCommentsByImageId(imageId).then((data) => {
        res.json(data.rows);
    });
});

app.get("/more/:id", (req, res) => {
    const id = req.params.id;
    db.getImagesWithSmallerIdThan(id).then((data) => {
        res.json(data.rows);
    });
});

app.get("/tag/:tagsearch", (req, res) => {
    const tagsearch = req.params.tagsearch;
    db.getImageIdsByTag(tagsearch).then((data) => {
        res.json(data.rows);
    });
});

app.get("/validate/:requestedId", (req, res) => {
    const requestedId = req.params.requestedId;
    db.validateId(requestedId).then((data) => {
        res.json(data.rows[0].count);
    });
});

app.get("/neighbors/:imageId", (req, res) => {
    const imageId = req.params.imageId;
    const prevNext = [];
    db.getPreviousImage(imageId).then((entry) => {
        prevNext.push(entry.rows[0]);
        db.getNextImage(imageId).then((entry) => {
            prevNext.push(entry.rows[0]);
            console.log(prevNext);
            res.json(prevNext);
        });
    });
});

app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "index.html"));
});

https: app.listen(PORT, () => console.log(`I'm listening on port ${PORT}`));
