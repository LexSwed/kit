import type { ReactNode } from "react";

export const metadata = {
  title: "Fxtrot Kit - Editor",
};

export default function EditorLayout({ children }: { children: ReactNode }) {
  return <div className="max-w-2xl mt-20 mx-auto">{children}</div>;
}
