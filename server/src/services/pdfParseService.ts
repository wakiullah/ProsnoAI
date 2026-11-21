import pdf from 'pdf-parse';

/**
 * Extracts raw textual content from an uploaded PDF file buffer.
 *
 * Throws a user-friendly Bengali error when the PDF appears to be a scanned
 * image (i.e. pdf-parse finds < 20 characters of selectable text), so teachers
 * see a clear explanation instead of silent empty results.
 */
export async function extractTextFromPdf(fileBuffer: Buffer): Promise<string> {
  let data: Awaited<ReturnType<typeof pdf>>;

  try {
    data = await pdf(fileBuffer);
  } catch (err: any) {
    throw new Error(`PDF ফাইলটি পড়তে ব্যর্থ হয়েছে: ${err.message}`);
  }

  const rawText = data.text || '';

  // Scanned / image-only PDF: pdf-parse finds no selectable text
  if (rawText.trim().length < 20) {
    throw new Error(
      'এই PDF-টি স্ক্যান করা ইমেজ ফাইল — সরাসরি কোনো লেখা (টেক্সট লেয়ার) নেই। ' +
        'অনুগ্রহ করে এমন একটি PDF আপলোড করুন যেখানে সিলেক্টযোগ্য/কপিযোগ্য টেক্সট আছে, ' +
        'অথবা OCR সফটওয়্যার দিয়ে স্ক্যান থেকে টেক্সট বের করে আলাদা ফাইল হিসেবে দিন।'
    );
  }

  // Normalize whitespace: collapse excessive blank lines, normalise Windows line endings
  const cleanedText = rawText.replace(/\r\n/g, '\n').replace(/\n{3,}/g, '\n\n').trim();
  return cleanedText;
}
