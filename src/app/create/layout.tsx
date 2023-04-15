export const metadata = {
  title: 'LaKit - Editor',
};

export default function EditorLayout({ children }: { children: React.ReactNode }) {
  return <div className="max-w-2xl mx-auto">{children}</div>;
}
