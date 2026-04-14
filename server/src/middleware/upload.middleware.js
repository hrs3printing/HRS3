import multer from "multer";
import path from "path";
import fs from "fs";
import os from "os";

const uploadDir = path.join(os.tmpdir(), "hrs3-uploads");
fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination(req, file, cb) {
    cb(null, uploadDir);
  },
  filename(req, file, cb) {
    cb(
      null,
      `${file.fieldname}-${Date.now()}${path.extname(file.originalname)}`,
    );
  },
});

function checkFileType(file, cb) {
  const filetypes = /jpg|jpeg|png|webp/;
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = /^image\/(jpeg|jpg|png|webp)$/.test(file.mimetype);

  if (extname && mimetype) {
    return cb(null, true);
  } else {
    cb(new Error("Images only (jpg, jpeg, png, webp)"));
  }
}

const upload = multer({
  storage,
  limits: {
    fileSize: Number(process.env.UPLOAD_MAX_FILE_SIZE_BYTES || 5 * 1024 * 1024),
    files: Number(process.env.UPLOAD_MAX_FILES || 10),
  },
  fileFilter: function (req, file, cb) {
    checkFileType(file, cb);
  },
});

export default upload;
