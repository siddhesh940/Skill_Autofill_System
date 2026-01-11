import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Skill Autofill System | AI Career Optimizer',
  description: 'Automatically analyze job descriptions, identify skill gaps, and get personalized learning roadmaps, resume improvements, and project recommendations.',
  keywords: ['career', 'skills', 'job search', 'resume', 'learning', 'portfolio'],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
          {children}
        </div>
      </body>
    </html>
  );
}
