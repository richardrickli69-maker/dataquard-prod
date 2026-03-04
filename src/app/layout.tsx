import ChatBot from '@/components/ChatBot/ChatBot';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Dataquard – Website rechtssicher in 3 Minuten',
  description: 'Datenschutz-Generator für Schweizer KMUs – Datenschutzerklärung, Impressum & Compliance-Check. nDSG/DSGVO-konform.',
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