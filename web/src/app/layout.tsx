import type { Metadata } from "next";
import {
  Cormorant_Garamond,
  DM_Sans,
  IBM_Plex_Mono,
  IBM_Plex_Sans,
  Inter,
  JetBrains_Mono,
  Manrope,
  Oswald,
  Source_Sans_3,
  Source_Serif_4,
  Space_Grotesk,
} from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const ibmPlexSans = IBM_Plex_Sans({ subsets: ["latin"], weight: ["400", "500", "600", "700"], variable: "--font-ibm-plex-sans" });
const ibmPlexMono = IBM_Plex_Mono({ subsets: ["latin"], weight: ["400", "500", "600"], variable: "--font-ibm-plex-mono" });
const manrope = Manrope({ subsets: ["latin"], variable: "--font-manrope" });
const spaceGrotesk = Space_Grotesk({ subsets: ["latin"], variable: "--font-space-grotesk" });
const cormorantGaramond = Cormorant_Garamond({ subsets: ["latin"], weight: ["400", "500", "600", "700"], variable: "--font-cormorant-garamond" });
const dmSans = DM_Sans({ subsets: ["latin"], variable: "--font-dm-sans" });
const oswald = Oswald({ subsets: ["latin"], variable: "--font-oswald" });
const sourceSerif = Source_Serif_4({ subsets: ["latin"], variable: "--font-source-serif-4" });
const sourceSans = Source_Sans_3({ subsets: ["latin"], variable: "--font-source-sans-3" });
const jetBrainsMono = JetBrains_Mono({ subsets: ["latin"], variable: "--font-jetbrains-mono" });

export const metadata: Metadata = {
  title: "TradeOS",
  description: "TradeOS helps contractors manage projects, estimating, documents, and field operations in one workflow.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`h-full antialiased ${inter.variable} ${ibmPlexSans.variable} ${ibmPlexMono.variable} ${manrope.variable} ${spaceGrotesk.variable} ${cormorantGaramond.variable} ${dmSans.variable} ${oswald.variable} ${sourceSerif.variable} ${sourceSans.variable} ${jetBrainsMono.variable}`}
    >
      <body className="min-h-full flex flex-col">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
