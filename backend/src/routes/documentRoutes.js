import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import { uploadPdf } from "../middleware/uploadMiddleware.js";
import { uploadLimiter } from "../middleware/rateLimiters.js";
import {
  uploadDocument,
  getDocuments,
  getDocumentById,
  deleteDocument,
} from "../controllers/documentController.js";

const router = express.Router();

router.use(protect);

router.post("/upload", uploadLimiter, uploadPdf, uploadDocument);
router.get("/", getDocuments);
router.get("/:id", getDocumentById);
router.delete("/:id", deleteDocument);

export default router;
