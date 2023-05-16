import { Inter } from 'next/font/google';
import { LinkButton } from '@fxtrot/ui';
import { t } from 'shared';

const inter = Inter({
  fallback: ['-apple-system, BlinkMacSystemFont, Segoe UI, Roboto, Oxygen, Ubuntu, sans-serif'],
  weight: 'variable',
  subsets: ['cyrillic', 'latin'],
  variable: '--fxtrot-fontFamily-sans',
});

export default function Home() {
  return (
    <main className={`flex min-h-screen flex-col items-center justify-center p-24 ${inter.className}`}>
      <LinkButton href="/create" variant="primary">
        {t('Create')}
      </LinkButton>
    </main>
  );
}
