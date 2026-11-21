import { Request, Response } from 'express';
import { Question } from '../models/Question';

export async function createQuestion(req: Request, res: Response) {
  try {
    const data = req.body;
    if (Array.isArray(data)) {
      const saved = await Question.insertMany(data);
      return res.status(201).json({ success: true, count: saved.length, questions: saved });
    }

    const question = new Question(data);
    await question.save();
    return res.status(201).json({ success: true, question });
  } catch (err: any) {
    console.error('Error creating question:', err);
    return res.status(500).json({ success: false, error: err.message });
  }
}

export async function getQuestions(req: Request, res: Response) {
  try {
    const { subject, grade, chapter, typology, difficulty, search } = req.query;

    const filter: Record<string, any> = {};
    if (subject) filter.subject = new RegExp(String(subject), 'i');
    if (grade) filter.grade = String(grade);
    if (chapter) filter.chapter = new RegExp(String(chapter), 'i');
    if (typology) filter.typology = String(typology);
    if (difficulty) filter.difficulty = String(difficulty);
    if (search) {
      filter.$or = [
        { stemOrPassage: new RegExp(String(search), 'i') },
        { explanation: new RegExp(String(search), 'i') },
        { tags: new RegExp(String(search), 'i') },
      ];
    }

    const questions = await Question.find(filter).sort({ createdAt: -1 }).limit(100);
    return res.status(200).json({ success: true, count: questions.length, questions });
  } catch (err: any) {
    console.error('Error fetching questions:', err);
    return res.status(500).json({ success: false, error: err.message });
  }
}

export async function getQuestionById(req: Request, res: Response) {
  try {
    const question = await Question.findById(req.params.id);
    if (!question) {
      return res.status(404).json({ success: false, error: 'Question not found.' });
    }
    return res.status(200).json({ success: true, question });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
}

export async function updateQuestion(req: Request, res: Response) {
  try {
    const question = await Question.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!question) {
      return res.status(404).json({ success: false, error: 'Question not found.' });
    }
    return res.status(200).json({ success: true, question });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
}

export async function deleteQuestion(req: Request, res: Response) {
  try {
    const question = await Question.findByIdAndDelete(req.params.id);
    if (!question) {
      return res.status(404).json({ success: false, error: 'Question not found.' });
    }
    return res.status(200).json({ success: true, message: 'Question deleted successfully.' });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
}
