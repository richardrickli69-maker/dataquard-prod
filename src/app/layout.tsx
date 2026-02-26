import ChatBot from '@/components/ChatBot/ChatBot';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Dataquard',
  description: 'Privacy Policy Generator',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="de">
      <body>
        {children}
        <ChatBot />
      </body>
    </html>
  );
}