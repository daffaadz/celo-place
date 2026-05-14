import { Paintbrush, Zap, MessageSquare } from "lucide-react";

const features = [
  {
    icon: <Paintbrush className="w-6 h-6 text-celo-green" />,
    title: "Global Canvas",
    description: "Paint pixels on a massive collaborative canvas. Every pixel is permanently stored on the Celo blockchain.",
    bg: "bg-celo-green/10",
  },
  {
    icon: <Zap className="w-6 h-6 text-celo-yellow" />,
    title: "Fast & Cheap",
    description: "Built on Celo for ultra-fast transactions with fractions of a cent in gas fees per pixel.",
    bg: "bg-celo-yellow/10",
  },
  {
    icon: <MessageSquare className="w-6 h-6 text-gray-400" />,
    title: "On-Chain Chat",
    description: "Talk to other painters in real-time. Verify messages and even tip fellow artists directly on-chain.",
    bg: "bg-white/5",
  }
];

export default function Features() {
  return (
    <section className="py-24 border-t border-white/5 bg-bg-surface relative overflow-hidden">
      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Why CeloPlace?</h2>
          <p className="text-text-secondary max-w-2xl mx-auto">
            Experience the next generation of decentralized collaboration.
          </p>
        </div>
        
        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {features.map((f, i) => (
            <div key={i} className="p-8 rounded-3xl bg-black/40 border border-white/5 hover:bg-white/[0.02] transition-all hover:-translate-y-1 duration-300">
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-6 ${f.bg}`}>
                {f.icon}
              </div>
              <h3 className="text-xl font-bold mb-3 text-white">{f.title}</h3>
              <p className="text-text-secondary leading-relaxed">{f.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
