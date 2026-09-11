import type { Metadata } from 'next';
import './globals.css';
import Navigation from '../components/Navigation';

export const metadata: Metadata = {
  title: 'Fashion Seller Pro',
  description: 'Business operating system for Ghanaian fashion sellers.',
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className="bg-slate-50 text-slate-900">
        <div className="flex min-h-screen">
          <Navigation />
          <div className="min-w-0 flex-1">{children}</div>
        </div>
      </body>
    </html>
  );
}
