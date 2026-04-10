import type { Metadata } from "next";
import { Great_Vibes, Bebas_Neue, Alice, EB_Garamond, Inter } from "next/font/google";
import localFont from "next/font/local";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const greatVibes = Great_Vibes({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-great-vibes",
});

const bebasNeue = Bebas_Neue({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-bebas-neue",
});

const alice = Alice({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-alice",
});

const garamond = EB_Garamond({
  subsets: ["latin"],
  variable: "--font-garamond",
});

const bostonAngel = localFont({
  src: "../../public/fonts/Boston Angel Regular.ttf",
  variable: "--font-boston-angel",
});

const carolloPlays = localFont({
  src: "../../public/fonts/The-Ampersand-Forest-Carollo-Playscript-Regular.otf",
  variable: "--font-carollo-plays",
});

export const metadata: Metadata = {
  title: "Candle Label Generator",
  description: "Générateur d'étiquettes pour bougies artisanales",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="fr"
      className={`${inter.variable} ${greatVibes.variable} ${bebasNeue.variable} ${alice.variable} ${garamond.variable} ${bostonAngel.variable} ${carolloPlays.variable} h-full`}
    >
      <body className="h-full font-sans">{children}</body>
    </html>
  );
}
