import Hero from "@/components/landing/Hero";
import Features from "@/components/landing/Features";
import HowItWorks from "@/components/landing/HowItWorks";
import Footer from "@/components/landing/Footer";

import FloatingLogos from "@/components/landing/FloatingLogos";

export default function Home() {
  return (
    <main className="min-h-screen bg-bg-base relative overflow-hidden">
      <FloatingLogos />
      <Hero />
      <Features />
      <HowItWorks />
      <Footer />
    </main>
  );
}
