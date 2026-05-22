import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "CeloPlace | Decentralized Real-Time Collaborative Canvas",
  description: "Join CeloPlace, a collaborative Web3 pixel art world map built on the Celo blockchain. Claim coordinates, complete daily missions, maintain streaks, and earn CELO rewards in a dynamic GameFi economy.",
  keywords: ["Celo", "Web3", "GameFi", "Collaborative Canvas", "Blockchain Game", "CeloPlace", "Pixel Art", "dApp"],
  openGraph: {
    title: "CeloPlace | Paint the World on Celo",
    description: "Claim your pixels on a global decentralized map. Complete missions, earn CELO, and leave your mark on the blockchain.",
    url: "https://celo-place.vercel.app",
    siteName: "CeloPlace",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "CeloPlace | Decentralized Canvas",
    description: "Leave your mark on the Celo blockchain! Claim pixels, complete missions, and earn rewards.",
  },
  other: {
    // Note: Please replace the string below with your full verification hash if it is cut off!
    "talentapp:project_verification": "7168fae0f1634122841d5258c5dcc72c72ef273c5ca0e42ba0ffbbcec6a82a8cfef2c76e020f81417754ed46ddba10badc54fc4d321cf7bc62d9eae372548781",
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-base text-primary antialiased`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
