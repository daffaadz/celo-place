import WalletButton from "@/components/shared/WalletButton";

export default function Hero() {
  return (
    <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden flex flex-col items-center justify-center min-h-[80vh]">
      <div className="container mx-auto px-4 relative z-10 text-center flex flex-col items-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-celo-green/10 border border-celo-green/20 text-celo-green text-sm font-medium mb-6">
          <span className="w-2 h-2 rounded-full bg-celo-green animate-pulse" />
          Live on Celo Sepolia
        </div>
        <div className="mb-8 flex flex-col items-center justify-center gap-6">
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-white/90">
            Welcome to
          </h1>
          <img src="/logo.png" alt="CeloPlace" className="h-20 md:h-28 w-auto drop-shadow-2xl" />
        </div>
        <p className="text-lg md:text-xl text-text-secondary max-w-2xl mb-10">
          A decentralized, collaborative digital canvas on the Celo blockchain. 
          Connect your wallet, leave your mark, and be part of web3 history.
        </p>
        <WalletButton variant="hero" />
      </div>
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[600px] bg-celo-yellow/10 blur-[150px] rounded-full pointer-events-none -z-10" />
    </section>
  );
}
