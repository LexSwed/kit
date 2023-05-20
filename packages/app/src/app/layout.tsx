/* Layers definition for fxtrot-ui should go very first */
/* eslint-disable simple-import-sort/imports */
import "./globals.css";

import type { ReactNode } from "react";
import { Inter } from "next/font/google";

import { AppContext } from "./context.tsx";

export const metadata = {
  title: "LaKit",
  description: "Something something about education",
};

const inter = Inter({
  weight: "variable",
  subsets: ["cyrillic", "latin", "latin-ext"],
});

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AppContext>{children}</AppContext>
      </body>
    </html>
  );
}
