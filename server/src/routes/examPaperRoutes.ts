import { Router } from 'express';
import {
  createExamPaper,
  deleteExamPaper,
  getExamPaperById,
  getExamPapers,
  handleShuffleSets,
  updateExamPaper,
} from '../controllers/examPaperController';

const router = Router();

router.post('/shuffle-sets', handleShuffleSets);
router.post('/', createExamPaper);
router.get('/', getExamPapers);
router.get('/:id', getExamPaperById);
router.put('/:id', updateExamPaper);
router.delete('/:id', deleteExamPaper);

export default router;
