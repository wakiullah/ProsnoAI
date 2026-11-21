import mongoose, { Document, Schema } from 'mongoose';

export interface IUser extends Document {
  name: string;
  email: string;
  passwordHash?: string;
  institutionDefaults: {
    name: string;
    logoUrl?: string;
    address?: string;
    defaultInstructions?: string[];
    defaultTimeAllowed?: string;
    defaultPaperSize?: 'A4' | 'Legal';
  };
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true, index: true },
    passwordHash: { type: String },
    institutionDefaults: {
      name: { type: String, default: 'গণপ্রজাতন্ত্রী বাংলাদেশ শিক্ষা বোর্ড' },
      logoUrl: { type: String, default: '' },
      address: { type: String, default: 'ঢাকা, বাংলাদেশ' },
      defaultInstructions: {
        type: [String],
        default: [
          'সকল প্রশ্নের মান সমান।',
          'ডান পাশের সংখ্যা প্রশ্নের পূর্ণমান নির্দেশক।',
          'প্রয়োজনীয় ক্ষেত্রে স্পষ্ট চিত্র ও সূত্র উল্লেখ করতে হবে।'
        ],
      },
      defaultTimeAllowed: { type: String, default: '২ ঘণ্টা ৩০ মিনিট' },
      defaultPaperSize: { type: String, enum: ['A4', 'Legal'], default: 'A4' },
    },
  },
  {
    timestamps: true,
  }
);

export const User = mongoose.model<IUser>('User', UserSchema);
