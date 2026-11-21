import type { Metadata } from 'next';
import './globals.css';
import { Navbar } from '../components/common/Navbar';

export const metadata: Metadata = {
  title: 'ProshnoAI (প্রশ্ন এআই) - Multi-Language Bangladeshi Question Paper & PDF Generator',
  description:
    'Board-standard Question Paper Generator and PDF Builder for Bangladeshi Schools, Colleges, Madrasahs, and Admission Tests. Bengali, English, and Arabic mixed typography with zero font-breaking.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="bn">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Amiri:ital,wght@0,400;0,700;1,400;1,700&family=Noto+Naskh+Arabic:wght@400;500;600;700&family=Scheherazade+New:wght@400;700&family=Noto+Serif+Bengali:wght@400;500;600;700&family=Inter:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-screen flex flex-col bg-slate-50 text-slate-900 antialiased">
        <Navbar />
        <main className="flex-1">{children}</main>
      </body>
    </html>
  );
}
