import type { Metadata, Viewport } from "next";
import { Cormorant_Garamond, Inter } from "next/font/google";
import "./globals.css";

const serif = Cormorant_Garamond({
  subsets: ["latin", "latin-ext"],
  variable: "--font-cormorant",
  display: "swap",
});

const sans = Inter({
  subsets: ["latin", "latin-ext"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL ?? "https://pentariva.com",
  ),
  title: {
    default: "PENTARIVA — Evropský ekosystém přirozené vitality",
    template: "%s | PENTARIVA",
  },
  description:
    "Spojujeme tradiční bylinné receptury, moderní vývoj, digitální technologie a evropskou partnerskou komunitu do jednoho živého ekosystému péče o člověka.",
  authors: [{ name: "PENTARIVA" }],
  applicationName: "PENTARIVA",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "PENTARIVA — Evropský ekosystém přirozené vitality",
    description:
      "Tradiční bylinné receptury, moderní vývoj a evropská komunita v jednom živém ekosystému.",
    type: "website",
    locale: "cs_CZ",
    siteName: "PENTARIVA",
    url: "/",
  },
  twitter: {
    card: "summary_large_image",
    title: "PENTARIVA — Evropský ekosystém přirozené vitality",
    description:
      "Tradiční bylinné receptury, moderní vývoj a evropská komunita v jednom živém ekosystému.",
  },
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/favicon-16x16.png", type: "image/png", sizes: "16x16" },
      { url: "/favicon-32x32.png", type: "image/png", sizes: "32x32" },
      { url: "/icon-512.png", type: "image/png", sizes: "512x512" },
    ],
    apple: "/apple-touch-icon.png",
  },
};

export const viewport: Viewport = {
  themeColor: "#1e2a1c",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="cs" className={`${serif.variable} ${sans.variable}`}>
      <body>{children}</body>
    </html>
  );
}
