import type { Metadata } from "next";
import type { ReactNode } from "react";
import "./globals.css";

export const metadata: Metadata = {
  title: "Carthage-Clean",
  description: "Plateforme de gestion de la propreté urbaine",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="fr">
      <body className="min-h-screen bg-slate-50 font-sans text-slate-800 antialiased">
        {children}
      </body>
    </html>
  );
}
