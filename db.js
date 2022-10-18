require("dotenv").config();
const spicedPg = require("spiced-pg");
const DATABASE_URL = process.env.DATABASE_URL;
const db = spicedPg(DATABASE_URL);

module.exports.insertImage = (url, username, title, description, tags) => {
    const sql = `INSERT INTO images (url, username, title, description, tags)
                VALUES ($1, $2, $3, $4, $5)
                RETURNING *;`;
    return db.query(sql, [url, username, title, description, tags]);
};

module.exports.getImages = () => {
    return db.query(
        `SELECT *, (SELECT id FROM images ORDER BY images.created_at ASC LIMIT 1) AS "lowest_id" FROM images ORDER BY created_at DESC LIMIT 4 ; `
    );
};

module.exports.validateId = (requestedId) => {
    sql = `SELECT COUNT (*) FROM images WHERE images.id = $1;`;
    return db.query(sql, [requestedId]);
};

module.exports.getImagesWithSmallerIdThan = (id) => {
    const sql = `SELECT *, (SELECT id FROM images ORDER BY created_at ASC LIMIT 1) AS "lowest_id" FROM images WHERE id < $1 ORDER BY created_at DESC LIMIT 4`;
    return db.query(sql, [id]);
};

module.exports.getImageById = (id) => {
    const sql = `SELECT * FROM images WHERE id=$1;`;
    return db.query(sql, [id]);
};

module.exports.deleteImageById = (id) => {
    const sql = `DELETE FROM images WHERE id=$1;`;
    return db.query(sql, [id]);
};

module.exports.insertComment = (imageId, comment, username) => {
    const sql = `INSERT INTO comments (image_id, comment, username) 
    VALUES ($1, $2, $3)
    RETURNING *;`;
    return db.query(sql, [imageId, comment, username]);
};

module.exports.getCommentsByImageId = (imageId) => {
    const sql = `SELECT * FROM comments WHERE image_id=$1 ORDER BY created_at DESC;`;
    return db.query(sql, [imageId]);
};

module.exports.getImageIdsByTag = (tag) => {
    const sql = `SELECT * FROM images WHERE $1 = ANY (tags) ORDER BY created_at DESC;`;
    return db.query(sql, [tag]);
};
