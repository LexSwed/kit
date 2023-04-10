import { AppContext } from './context';
import './globals.css';

export const metadata = {
  title: 'LaKit',
  description: 'Something something about education',
};

import { Inter } from 'next/font/google';

const inter = Inter({ weight: 'variable', subsets: ['cyrillic', 'latin', 'latin-ext'] });

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AppContext>{children}</AppContext>
      </body>
    </html>
  );
}
