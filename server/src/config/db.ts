import mongoose from 'mongoose';

export async function connectDB(): Promise<void> {
  const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/proshno_ai';

  try {
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 5000,
    });
    console.log(`[Database] MongoDB connected successfully to ${uri.replace(/\/\/.*@/, '//<credentials>@')}`);
  } catch (err: any) {
    console.warn(`[Database Warning] MongoDB connection failed: ${err.message}. (Server running in memory/ephemeral mode if DB unavailable)`);
  }
}
