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
    tags = tags.map((tag) => tag.trim());
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

// app.get("/dummy", (req, res) => {
//     console.log(req.body);
// }
//     const { title, description, username, tagstring } = req.body;
//     let filename = "";
//     fetch("https://picsum.photos/300")
//         .then((response) => response.buffer())
//         .then((buffer) => {
//             filename = uid.sync(24) + ".jpeg";
//             fs.writeFile(`./uploads/${filename}`, buffer);
//         });
//     const url = `https://s3.amazonaws.com/spicedling/${filename}`;
//     const size = fs.statSync(`./uploads/${filename}`).size;
//     console.log("insert dummy image");

//     const insertRemoteImage = s3
//         .putObject({
//             Bucket: "spicedling",
//             ACL: "public-read",
//             Key: filename,
//             Body: fs.createReadStream(`./uploads${filename}`),
//             ContentType: "image/jpeg",
//             ContentLength: size,
//         })
//         .promise();

//     insertRemoteImage.then(() => {
//         fs.unlinkSync(`./uploads/${filename}`);
//         db.insertImage(url, username, title, description, tagstring)
//             .then((result) => {
//                 res.json({
//                     currentImage: {
//                         username: username,
//                         title: title,
//                         description: description,
//                         tagstring: tagstring,
//                         file: url,
//                         id: result.rows[0].id,
//                         created_at: result.rows[0].created_at,
//                     },
//                     success: true,
//                     message:
//                         "Your photo has been added. Thank you for contributing.",
//                 });
//             })
//             .catch((err) => {
//                 console.log(err);
//             });
//     });

//     function fetchHipsterIpsum(num) {
//         const descriptions = [];
//         for (let i = 0; i < num; i++) {
//             descriptions.push(
//                 fetch(
//                     "http://hipsum.co/api/?" +
//                         new URLSearchParams({
//                             type: "hipster-centric",
//                             sentences: 3,
//                         })
//                 ).then((response) => response.json())
//             );
//         }
//         return Promise.all(descriptions);
//     }

//                     method: "POST",
//                     headers: {
//                         "Content-Type": "text/json",
//                     },
//                     body: JSON.stringify({
//                         title: titles[i],
//                         description: descriptions[i],
//                         username: username[i],
//                         tagstring,
//                     }),
//                 }).catch((err) => console.log(err));

//             Promise.all([fetchHipsterIpsum(num), fetchHipsterIpsum(num)]).then(
//                 function (data) {
//                     const titles = data[0].map((sentence) => {
//                         return sentence[0].split(" ").slice(0, 3).join(" ");
//                     });
//                     const descriptions = data[0].map((sentence) => {
//                         return sentence[0].split(" ").slice(1, 7).join(" ");
//                     });
//                     const tags = data[1].map((sentence) => {
//                         sentence = sentence[0].split(" ").slice(0, 4);
//                         return sentence;
//                     });
//                     const username = data[1].map((sentence) => {
//                         return sentence[0].split(" ")[5];
//                     });

//                 }
//             );

// });

app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "index.html"));
});

https: app.listen(PORT, () => console.log(`I'm listening on port ${PORT}`));
