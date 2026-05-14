export default function HowItWorks() {
  const steps = [
    {
      step: "01",
      title: "Connect Wallet",
      description: "Connect your MetaMask and switch to the Celo Sepolia testnet to get started."
    },
    {
      step: "02",
      title: "Pick Your Color",
      description: "Select from our curated palette of colors to make your mark on the global canvas."
    },
    {
      step: "03",
      title: "Paint a Pixel",
      description: "Click anywhere on the map to paint. You get 3 pixels per day—use them wisely!"
    }
  ];

  return (
    <section className="py-24 border-t border-white/5 bg-bg-base relative">
      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">How It Works</h2>
          <p className="text-text-secondary max-w-2xl mx-auto">
            Ready to contribute? It only takes a few seconds.
          </p>
        </div>

        <div className="flex flex-col md:flex-row justify-center max-w-5xl mx-auto gap-8 md:gap-12 relative">
          <div className="absolute top-1/2 left-0 w-full h-[1px] bg-white/10 -translate-y-1/2 hidden md:block z-0" />
          
          {steps.map((s, i) => (
            <div key={i} className="flex-1 relative z-10 text-center">
              <div className="w-16 h-16 mx-auto rounded-full bg-bg-base border-4 border-black flex items-center justify-center mb-6 drop-shadow-xl shadow-celo-yellow/20 shadow-[0_0_20px_rgba(0,0,0,0.5)] bg-gradient-to-br from-celo-yellow/20 to-bg-surface">
                <span className="font-black text-celo-yellow text-xl">{s.step}</span>
              </div>
              <h3 className="text-xl font-bold text-white mb-2">{s.title}</h3>
              <p className="text-text-secondary text-sm leading-relaxed">{s.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
