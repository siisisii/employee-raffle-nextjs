import type { Metadata, Viewport } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'NEW YEAR PARTY',
  description: '2026',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'NEW YEAR PARTY',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="th">
      <body className="antialiased touch-manipulation">
        <div className="stars" />
        {children}
      </body>
    </html>
  );
}
