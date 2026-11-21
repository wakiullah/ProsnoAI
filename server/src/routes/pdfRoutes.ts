import { Router } from 'express';
import {
  handleGenerateAnswerKeyPdf,
  handleGenerateOmrSheetPdf,
  handleGenerateQuestionPaperPdf,
  handleGetPreviewHtml,
} from '../controllers/pdfController';

const router = Router();

router.post('/question-paper', handleGenerateQuestionPaperPdf);
router.post('/answer-key', handleGenerateAnswerKeyPdf);
router.post('/omr-sheet', handleGenerateOmrSheetPdf);
router.post('/preview-html', handleGetPreviewHtml);

export default router;
