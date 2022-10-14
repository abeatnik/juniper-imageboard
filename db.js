require("dotenv").config();
const spicedPg = require("spiced-pg");
const DATABASE_URL = process.env.DATABASE_URL;
const db = spicedPg(DATABASE_URL);

module.exports.insertImage = (url, username, title, description, tagstring) => {
    const sql = `INSERT INTO images (url, username, title, description, tagstring)
                VALUES ($1, $2, $3, $4, $5)
                RETURNING *;`;
    return db.query(sql, [url, username, title, description, tagstring]);
};

module.exports.getImages = () => {
    return db.query(`SELECT * FROM images ORDER BY created_at DESC LIMIT 12;`);
};

module.exports.getImagesOlderThan = (timestamp) => {
    const sql = `SELECT * FROM images ORDER BY created_at DESC WHERE created_at < $1 LIMIT 12`;
    return db.query(sql, [timestamp]);
};

module.exports.deleteImageById = (id) => {
    const sql = `DELETE FROM images WHERE id=$1;`;
    return db.query(sql, [id]);
};
