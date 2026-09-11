import type { Metadata } from "next";
import { Inter, Source_Serif_4 } from "next/font/google";
import "./globals.css";
import { branding } from "@/lib/config/branding";

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
  display: "swap"
});

const sourceSerif = Source_Serif_4({
  variable: "--font-serif",
  subsets: ["latin"],
  display: "swap"
});

export const metadata: Metadata = {
  metadataBase: new URL(branding.siteUrl),
  title: `${branding.companyName} | Accès document`,
  description: "Accédez au document après validation de votre email.",
  icons: {
    icon: [{ url: branding.companyLogoUrl }],
    shortcut: [branding.companyLogoUrl],
    apple: [branding.companyLogoUrl]
  },
  openGraph: {
    title: `${branding.companyName} | Accès document`,
    description: "Accédez au document après validation de votre email.",
    type: "website"
  }
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr">
      <body className={`${inter.variable} ${sourceSerif.variable} bg-ink-50 text-ink-900 antialiased`} style={{ fontFeatureSettings: '"kern" 1, "liga" 1' }}>
        {children}
      </body>
    </html>
  );
}
