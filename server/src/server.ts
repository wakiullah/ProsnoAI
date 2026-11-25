import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { connectDB } from './config/db';
import aiRoutes from './routes/aiRoutes';
import questionRoutes from './routes/questionRoutes';
import examPaperRoutes from './routes/examPaperRoutes';
import pdfRoutes from './routes/pdfRoutes';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({ origin: '*' }));
app.use(express.json({ limit: '15mb' }));
app.use(express.urlencoded({ extended: true, limit: '15mb' }));

// Serve local font files over loopback for fast, zero-Base64 Puppeteer PDF rendering
const fontDirCandidates = [
  path.resolve(__dirname, '../public/fonts'),
  path.resolve(__dirname, '../../public/fonts'),
  path.resolve(process.cwd(), 'public/fonts'),
  path.resolve(process.cwd(), 'server/public/fonts'),
];
const resolvedFontDir = fontDirCandidates.find((d) => fs.existsSync(d));
if (resolvedFontDir) {
  app.use('/fonts', express.static(resolvedFontDir, { maxAge: '7d' }));
}

// Root & Health Check (Required for Hugging Face Spaces & Render health probes)
app.get('/', (_req, res) => {
  res.status(200).json({
    status: 'online',
    service: 'ProshnoAI Backend (Hugging Face / Docker Ready)',
    health: '/health',
  });
});

app.get('/health', (_req, res) => {
  res.status(200).json({
    status: 'online',
    service: 'ProshnoAI Backend',
    timestamp: new Date().toISOString(),
  });
});

// API Routes
app.use('/api/ai', aiRoutes);
app.use('/api/questions', questionRoutes);
app.use('/api/exam-papers', examPaperRoutes);
app.use('/api/pdf', pdfRoutes);

// Start server after connecting to database
async function startServer() {
  await connectDB();
  app.listen(PORT, () => {
    console.log(`[ProshnoAI Server] Running on http://localhost:${PORT}`);
  });
}

startServer();

export default app;
