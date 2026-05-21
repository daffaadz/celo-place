import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  title: "CeloPlace — Paint the World On-Chain",
  description: "A collaborative pixel art canvas on the Celo blockchain. Connect your wallet, claim pixels, earn rewards, and chat with painters worldwide.",
  openGraph: {
    title: "CeloPlace — Paint the World On-Chain",
    description: "A collaborative pixel art canvas on the Celo blockchain. Connect your wallet, claim pixels, earn rewards.",
    type: "website",
    url: "https://celo-place.vercel.app",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} font-body bg-base text-text-primary antialiased`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
