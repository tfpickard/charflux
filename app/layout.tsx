import type { Metadata, Viewport } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'ASCII Fluid Lab - Text-driven Particle Simulation',
  description: 'Transform text into mesmerizing fluid-like simulations driven by ASCII character values. Watch characters dance and interact in a 2D particle system.',
  keywords: ['ASCII', 'fluid simulation', 'particle system', 'canvas', 'visualization'],
  authors: [{ name: 'ASCII Fluid Lab' }],
  icons: {
    icon: '/favicon.svg',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
