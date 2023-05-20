import { Inter } from "next/font/google";
import Link from "next/link.js";

import { t } from "@fxtrot/lib";
import { LinkButton } from "@fxtrot/ui/button/index.ts";

const inter = Inter({
  fallback: [
    "-apple-system, BlinkMacSystemFont, Segoe UI, Roboto, Oxygen, Ubuntu, sans-serif",
  ],
  weight: "variable",
  subsets: ["cyrillic", "latin"],
  variable: "--fxtrot-fontFamily-sans",
});

export default function Home() {
  return (
    <main
      className={`flex min-h-screen flex-col items-center justify-center p-24 ${inter.className}`}
    >
      {/* @ts-expect-error https://github.com/vercel/next.js/issues/46078 */}
      <Link href="/create" passHref legacyBehavior>
        <LinkButton variant="primary">{t("Create")}</LinkButton>
      </Link>
    </main>
  );
}
