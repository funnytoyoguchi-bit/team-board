import type { Metadata } from "next";
import { Noto_Sans_JP } from "next/font/google";
import "./globals.css";

const noto = Noto_Sans_JP({ subsets: ["latin"], weight: ["400","500","700","900"] });

export const metadata: Metadata = {
  title: "TeamBoard",
  description: "Team Project Management",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja">
      <body className={noto.className}>{children}</body>
    </html>
  );
}