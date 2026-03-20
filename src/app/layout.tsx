import "./globals.css";
import type { Metadata } from "next";

import { atlasThemeStyles } from "@/features/atlascope/config/theme";

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
      <head>
        <style dangerouslySetInnerHTML={{ __html: atlasThemeStyles }} />
      </head>
      <body className="bg-background font-sans text-foreground antialiased">
        {children}
      </body>
    </html>
  );
}
