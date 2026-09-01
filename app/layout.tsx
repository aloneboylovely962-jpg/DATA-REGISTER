import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "DATA-REGISTER",
  description: "Business transactions, stock and profit management",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
