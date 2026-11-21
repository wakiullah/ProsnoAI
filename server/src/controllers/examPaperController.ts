import { Request, Response } from 'express';
import { ExamPaper } from '../models/ExamPaper';

export async function createExamPaper(req: Request, res: Response) {
  try {
    const paper = new ExamPaper(req.body);
    await paper.save();
    return res.status(201).json({ success: true, paper });
  } catch (err: any) {
    console.error('Error creating exam paper:', err);
    return res.status(500).json({ success: false, error: err.message });
  }
}

export async function getExamPapers(req: Request, res: Response) {
  try {
    const papers = await ExamPaper.find().sort({ updatedAt: -1 }).limit(50);
    return res.status(200).json({ success: true, count: papers.length, papers });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
}

export async function getExamPaperById(req: Request, res: Response) {
  try {
    const paper = await ExamPaper.findById(req.params.id);
    if (!paper) {
      return res.status(404).json({ success: false, error: 'Exam paper not found.' });
    }
    return res.status(200).json({ success: true, paper });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
}

export async function updateExamPaper(req: Request, res: Response) {
  try {
    const paper = await ExamPaper.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!paper) {
      return res.status(404).json({ success: false, error: 'Exam paper not found.' });
    }
    return res.status(200).json({ success: true, paper });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
}

export async function deleteExamPaper(req: Request, res: Response) {
  try {
    const paper = await ExamPaper.findByIdAndDelete(req.params.id);
    if (!paper) {
      return res.status(404).json({ success: false, error: 'Exam paper not found.' });
    }
    return res.status(200).json({ success: true, message: 'Exam paper deleted successfully.' });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
}

export async function handleShuffleSets(req: Request, res: Response) {
  try {
    const { questions, setNames } = req.body;
    if (!questions || !Array.isArray(questions)) {
      return res.status(400).json({ success: false, error: 'Questions array is required.' });
    }

    const { generateExamSets } = await import('../services/shufflerService');
    const sets = generateExamSets(questions, setNames || ['Set A', 'Set B', 'Set C', 'Set D']);

    return res.status(200).json({ success: true, sets });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
}

