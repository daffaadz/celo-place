import HeroSection from "@/components/landing/HeroSection";
import WhatIsSection from "@/components/landing/WhatIsSection";
import FeaturesShowcase from "@/components/landing/FeaturesShowcase";
import CTASection from "@/components/landing/CTASection";
import Footer from "@/components/landing/Footer";

export default function Home() {
  return (
    <main className="min-h-screen bg-[var(--bg-base)] relative overflow-x-hidden">
      <HeroSection />
      <WhatIsSection />
      <FeaturesShowcase />
      <CTASection />
      <Footer />
    </main>
  );
}
