import type { Metadata } from "next";

import "./globals.css";

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
      <head>
        <title>ICIA - Industrial Cellular Installer Association</title>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Open+Sans:ital,wght@0,300..800;1,300..800&family=PT+Sans:ital,wght@0,400;0,700;1,400;1,700&family=Roboto:ital,wght@0,100..900;1,100..900&display=swap"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
