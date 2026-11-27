import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "FK Gračanica — Next.js Turbo Preview",
  description: "FK Gračanica — Next.js Turbo preview (koegzistira sa Vite buildom)",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="bs" className="dark">
      <body className="bg-background text-text antialiased">{children}</body>
    </html>
  );
}
