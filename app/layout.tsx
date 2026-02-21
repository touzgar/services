import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { LanguageProvider } from "@/lib/useLanguage";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://am-clean-services.vercel.app/"),
  title: "AM Clean Services - Solutions de Nettoyage Professionnelles en Tunisie",
  description: "Services de nettoyage professionnels à Cité El Khadhra, Tunisie. Solutions de nettoyage expertes, résidentiel et commercial.",
  keywords: ["am-clean-services", "am clean services", "nettoyage", "clean services", "entreprise de nettoyage", "Cité El Khadhra", "Tunisie", "ménage professionnel", "nettoyage commercial", "nettoyage résidentiel", "AM Clean"],
  authors: [{ name: "AM Clean Services" }],
  creator: "AM Clean Services",
  publisher: "AM Clean Services",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    title: "AM Clean Services - Solutions de Nettoyage Professionnelles",
    description: "Services de nettoyage professionnels à Cité El Khadhra, Tunisie. Solutions expertes pour votre maison et entreprise.",
    url: "https://am-clean-services.vercel.app/",
    siteName: "AM Clean Services",
    locale: "fr_FR",
    type: "website",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  twitter: {
    title: "AM Clean Services - Professionnels du Nettoyage",
    card: "summary_large_image",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <LanguageProvider>
          {children}
        </LanguageProvider>
      </body>
    </html>
  );
}
