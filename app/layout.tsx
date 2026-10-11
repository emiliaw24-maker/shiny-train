import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Agent Nauki",
  description: "Aplikacja edukacyjna z AI",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pl">
      <body>{children}</body>
    </html>
  );
}
