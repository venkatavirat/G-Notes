const { randomUUID } = require("node:crypto");
const path = require("node:path");
const cloudinary = require("../config/cloudinary");

function uploadNoteFile(buffer, originalName) {
  const extension = path.extname(originalName).toLowerCase();
  const publicId = `${randomUUID()}${extension}`;

  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { resource_type: "raw", folder: "g-notes", public_id: publicId },
      (error, result) => {
        if (error) {
          reject(error);
        } else if (!result?.secure_url) {
          reject(new Error("Cloudinary did not return a secure file URL."));
        } else {
          resolve(result);
        }
      }
    );
    stream.end(buffer);
  });
}

module.exports = uploadNoteFile;
