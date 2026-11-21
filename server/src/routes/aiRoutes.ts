import { Router } from 'express';
import multer from 'multer';
import { handleGenerateQuestions, handleUploadPdf, handleValidateKey } from '../controllers/aiController';

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 20 * 1024 * 1024 }, // 20 MB max
  fileFilter: (_req, file, cb) => {
    if (file.mimetype === 'application/pdf' || file.originalname.endsWith('.pdf')) {
      cb(null, true);
    } else {
      cb(new Error('Only PDF files are supported.'));
    }
  },
});

const router = Router();

router.post('/generate', handleGenerateQuestions);
router.post('/validate-key', handleValidateKey);
router.post('/upload-pdf', upload.single('file') as any, handleUploadPdf);

export default router;
