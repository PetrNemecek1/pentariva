import type { Metadata } from "next";
import { EB_Garamond, Inter } from "next/font/google";
import "./globals.css";

const serif = EB_Garamond({
  subsets: ["latin", "latin-ext"],
  variable: "--font-eb-garamond",
  display: "swap",
});

const sans = Inter({
  subsets: ["latin", "latin-ext"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL ?? "https://pentariva.vercel.app",
  ),
  title: "PENTARIVA — Z hlubin kořenů. Pro celého člověka.",
  description:
    "PENTARIVA — bylinná péče vyrůstající z tradice, úcty k přírodě a pozornosti ke každému detailu.",
  openGraph: {
    title: "PENTARIVA — Z hlubin kořenů. Pro celého člověka.",
    description:
      "Bylinná péče inspirovaná tradicí a šitá na míru dnešnímu člověku.",
    type: "website",
    locale: "cs_CZ",
  },
  twitter: {
    card: "summary_large_image",
    title: "PENTARIVA — Z hlubin kořenů. Pro celého člověka.",
    description:
      "Bylinná péče inspirovaná tradicí a šitá na míru dnešnímu člověku.",
  },
  icons: {
    icon: "/favicon.ico",
  },
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
