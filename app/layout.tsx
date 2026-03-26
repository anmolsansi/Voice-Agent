import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'CheckIn Care',
  description: 'Patient intake experience for urgent care visits.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
