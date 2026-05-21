import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "CeloPlace — Paint the World",
  description: "A collaborative world map pixel painting game with permanent on-chain global chat, deployed on the Celo blockchain.",
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
