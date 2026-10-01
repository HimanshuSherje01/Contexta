import multer from "multer";

const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  // Check MIME type
  const isPdfMime = file.mimetype === "application/pdf";
  // Check extension
  const isPdfExt = file.originalname.toLowerCase().endsWith(".pdf");

  if (isPdfMime && isPdfExt) {
    cb(null, true);
  } else {
    const error = new Error("Only PDF files (.pdf) are allowed");
    error.status = 400;
    cb(error, false);
  }
};

const upload = multer({
  storage,
  limits: {
    fileSize: 15 * 1024 * 1024, // 15 MB
  },
  fileFilter,
});

export const uploadPdf = (req, res, next) => {
  upload.single("file")(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      if (err.code === "LIMIT_FILE_SIZE") {
        return res
          .status(400)
          .json({ message: "File is too large. Maximum allowed size is 15MB." });
      }
      return res.status(400).json({ message: `Upload error: ${err.message}` });
    }
    if (err) {
      return res.status(err.status || 400).json({ message: err.message });
    }
    next();
  });
};
