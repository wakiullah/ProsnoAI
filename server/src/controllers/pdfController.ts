import { Request, Response } from 'express';
import zlib from 'zlib';
import { ExamPaperData } from 'proshno-shared';
import {
  generateAnswerKeyPdf,
  generateOmrSheetPdf,
  generateQuestionPaperPdf,
  renderHtmlToPdf,
} from '../services/pdfService';
import { generateQuestionPaperHtml } from './../services/pdfTemplates/questionPaperTemplate';
import { generateAnswerKeyHtml } from './../services/pdfTemplates/answerKeyTemplate';
import { generateOmrSheetHtml } from './../services/pdfTemplates/omrSheetTemplate';

function sendCompressedPdf(req: Request, res: Response, pdfBuffer: Buffer, filename: string) {
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `inline; filename="${encodeURIComponent(filename)}"`);
  res.setHeader('Vary', 'Accept-Encoding');

  const acceptEncoding = String(req.headers['accept-encoding'] || '');
  if (acceptEncoding.includes('gzip') && pdfBuffer.length > 1024) {
    const gzipped = zlib.gzipSync(pdfBuffer, { level: 6 });
    res.setHeader('Content-Encoding', 'gzip');
    res.setHeader('Content-Length', gzipped.length);
    return res.end(gzipped);
  }

  res.setHeader('Content-Length', pdfBuffer.length);
  return res.end(pdfBuffer);
}

export async function handleGenerateQuestionPaperPdf(req: Request, res: Response) {
  try {
    const { paper, setName, html } = req.body as {
      paper?: ExamPaperData;
      setName?: string;
      html?: string;
    };
    if (!paper && !html) {
      return res.status(400).json({ success: false, error: 'Missing exam paper payload.' });
    }

    let pdfBuffer: Buffer;
    if (html && html.trim().length > 0) {
      pdfBuffer = await renderHtmlToPdf(html, {
        format: paper?.layoutConfig?.paperSize || 'A4',
      });
    } else if (paper) {
      pdfBuffer = await generateQuestionPaperPdf(paper, setName);
    } else {
      return res.status(400).json({ success: false, error: 'Cannot render PDF without paper data or HTML.' });
    }

    const safeTitle = (paper?.headerConfig?.subject || 'Question_Paper').replace(/[^a-zA-Z0-9_\u0980-\u09FF]/g, '_');
    const filename = `${safeTitle}_${setName || 'Set_A'}.pdf`;

    return sendCompressedPdf(req, res, pdfBuffer, filename);
  } catch (err: any) {
    console.error('Error rendering Question Paper PDF:', err);
    return res.status(500).json({ success: false, error: err.message });
  }
}

export async function handleGenerateAnswerKeyPdf(req: Request, res: Response) {
  try {
    const { paper, setName } = req.body as { paper: ExamPaperData; setName?: string };
    if (!paper) {
      return res.status(400).json({ success: false, error: 'Missing exam paper payload.' });
    }

    const pdfBuffer = await generateAnswerKeyPdf(paper, setName);
    const filename = `Answer_Key_${setName || 'Set_A'}.pdf`;

    return sendCompressedPdf(req, res, pdfBuffer, filename);
  } catch (err: any) {
    console.error('Error rendering Answer Key PDF:', err);
    return res.status(500).json({ success: false, error: err.message });
  }
}

export async function handleGenerateOmrSheetPdf(req: Request, res: Response) {
  try {
    const { paper, totalMcqs } = req.body as { paper: ExamPaperData; totalMcqs?: number };
    if (!paper) {
      return res.status(400).json({ success: false, error: 'Missing exam paper payload.' });
    }

    const pdfBuffer = await generateOmrSheetPdf(paper, totalMcqs);
    const filename = `OMR_Sheet_${paper.headerConfig?.subject || 'Exam'}.pdf`;

    return sendCompressedPdf(req, res, pdfBuffer, filename);
  } catch (err: any) {
    console.error('Error rendering OMR Sheet PDF:', err);
    return res.status(500).json({ success: false, error: err.message });
  }
}

export async function handleGetPreviewHtml(req: Request, res: Response) {
  try {
    const { paper, type, setName } = req.body as {
      paper: ExamPaperData;
      type?: 'paper' | 'answer-key' | 'omr';
      setName?: string;
    };

    if (!paper) {
      return res.status(400).json({ success: false, error: 'Missing exam paper payload.' });
    }

    let html = '';
    if (type === 'answer-key') {
      html = generateAnswerKeyHtml(paper, setName);
    } else if (type === 'omr') {
      html = generateOmrSheetHtml(paper);
    } else {
      html = generateQuestionPaperHtml(paper, setName);
    }

    return res.status(200).json({ success: true, html });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
}
