import type { Metadata } from "next";
import { Playfair_Display, IBM_Plex_Mono, Oswald } from "next/font/google";
import "./globals.css";

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
  weight: ["400", "700"],
});

const ibmPlexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  variable: "--font-ibm-plex-mono",
  weight: ["400", "700"],
});

const oswald = Oswald({
  subsets: ["latin"],
  variable: "--font-oswald",
  weight: ["400", "500", "700"],
});

export const metadata: Metadata = {
  title: "Masters Pool 2026",
  description:
    "Live Masters Tournament pool tracker — best 4 of 8 golfers count",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${playfair.variable} ${ibmPlexMono.variable} ${oswald.variable} antialiased bg-[#0a120a] text-[#f0ece0]`}
      >
        {children}
      </body>
    </html>
  );
}
