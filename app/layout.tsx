import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Fashion Seller Pro',
  description: 'Business operating system for Ghanaian fashion sellers.',
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
