import type { Metadata } from "next";
import { Manrope } from "next/font/google";

import "./globals.css";

const manrope = Manrope({
  subsets: ["latin", "cyrillic"],
  variable: "--font-sans"
});

export const metadata: Metadata = {
  title: "ICIA — Industrial Cellular Installer Association",
  description:
    "Платформа ICIA объединяет подрядчиков и инженеров сотовой связи по всей России. Управляйте проектами, контролируйте качество, развивайте команды."
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru" className="light" suppressHydrationWarning>
      <body className={manrope.variable}>{children}</body>
    </html>
  );
}
