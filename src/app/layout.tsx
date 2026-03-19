import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "AtlaScope",
  description: "Map-first hazard monitoring UI prototype",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
