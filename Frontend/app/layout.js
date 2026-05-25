import '@/styles/globals.css';
import { ToastProvider } from '@/components/Toast';

export const metadata = {
  title: 'DermAI — Skin Cancer Detection',
  description: 'AI-powered skin cancer detection using deep learning.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body>
        <ToastProvider>
          {children}
        </ToastProvider>
      </body>
    </html>
  );
}
