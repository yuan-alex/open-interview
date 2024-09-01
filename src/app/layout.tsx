import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Theme, ThemePanel } from "@radix-ui/themes";

import "@radix-ui/themes/styles.css";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Open Interview",
  description: "Open-source technical interviewing platform",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Theme appearance="dark" accentColor="lime" radius="full">
          {children}
          {process.env.NODE_ENV == "development" && <ThemePanel />}
        </Theme>
      </body>
    </html>
  );
}
