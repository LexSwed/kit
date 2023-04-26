import type { ReactNode } from 'react';

export const metadata = {
  title: 'LaKit - Editor',
};

export default function EditorLayout({ children }: { children: ReactNode }) {
  return <div className="max-w-2xl mt-40 mx-auto">{children}</div>;
}
