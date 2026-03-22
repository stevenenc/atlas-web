import "./globals.css";
import type { Metadata } from "next";

import { fraunces, ibmPlexMono, inter } from "@/app/fonts";
import { atlasThemeStyles } from "@/features/atlascope/config/theme";

export const metadata: Metadata = {
  title: "AtlaScope",
  description: "Map-first hazard monitoring UI prototype",
  icons: {
    icon: "/icon.svg",
    shortcut: "/icon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${fraunces.variable} ${ibmPlexMono.variable}`}
    >
      <head>
        <style dangerouslySetInnerHTML={{ __html: atlasThemeStyles }} />
      </head>
      <body className="bg-background font-sans text-foreground antialiased">
        {children}
      </body>
    </html>
  );
}
