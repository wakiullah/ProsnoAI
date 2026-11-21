import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
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
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

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
