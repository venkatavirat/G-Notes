const multer = require("multer");
const path = require("node:path");

const invalidFileMessage =
  "Invalid file type. Only PDF (.pdf) and PowerPoint (.ppt, .pptx) files are permitted.";

const mimeTypesByExtension = new Map([
  [".pdf", "application/pdf"],
  [".ppt", "application/vnd.ms-powerpoint"],
  [".pptx", "application/vnd.openxmlformats-officedocument.presentationml.presentation"]
]);

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 15 * 1024 * 1024 },
  fileFilter(req, file, callback) {
    const extension = path.extname(file.originalname).toLowerCase();
    if (mimeTypesByExtension.get(extension) === file.mimetype) {
      return callback(null, true);
    }

    const error = new Error(invalidFileMessage);
    error.code = "INVALID_FILE_TYPE";
    return callback(error);
  }
});

module.exports = upload;
