import Link from "next/link";
import { GithubLogo, DiscordLogo } from "@phosphor-icons/react/dist/ssr";

export default function Footer() {
  return (
    <footer className="relative border-t border-[var(--border-subtle)] bg-[var(--bg-surface)]">
      {/* Pixel divider */}
      <div className="w-full h-px" style={{ background: "linear-gradient(90deg, transparent, var(--accent-primary), var(--accent-secondary), transparent)" }} />

      <div className="max-w-6xl mx-auto px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-12">
          {/* Brand */}
          <div className="md:col-span-1">
            <div className="flex items-center gap-3 mb-4">
              <img src="/logo.png" alt="CeloPlace" className="w-8 h-8" />
              <span className="font-pixel text-sm text-white">CELOPLACE</span>
            </div>
            <p className="text-text-secondary text-sm leading-relaxed max-w-xs">
              A fully decentralized, collaborative pixel art canvas built on the Celo blockchain.
            </p>
          </div>

          {/* Navigation */}
          <div>
            <h4 className="font-pixel text-xs text-text-muted tracking-widest mb-5">NAVIGATE</h4>
            <div className="flex flex-col gap-3">
              <Link href="/" className="text-text-secondary text-sm hover:text-white transition-colors">Home</Link>
              <Link href="/play" className="text-text-secondary text-sm hover:text-[var(--accent-primary)] transition-colors">Play Now</Link>
              <a href="https://celoscan.io/address/0x1Ba28d59AD81615055881436152Bbe63B6a445Ef" target="_blank" rel="noopener noreferrer" className="text-text-secondary text-sm hover:text-[var(--accent-secondary)] transition-colors">
                Contract on CeloScan ↗
              </a>
            </div>
          </div>

          {/* Community */}
          <div>
            <h4 className="font-pixel text-xs text-text-muted tracking-widest mb-5">COMMUNITY</h4>
            <div className="flex flex-col gap-3">
              <a
                href="https://github.com/daffaadz/celo-place"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-text-secondary text-sm hover:text-white transition-colors group"
              >
                <GithubLogo weight="fill" className="w-4 h-4 group-hover:text-[var(--accent-primary)] transition-colors" />
                GitHub
              </a>
              <a
                href="#"
                className="flex items-center gap-2 text-text-secondary text-sm hover:text-white transition-colors group"
              >
                <DiscordLogo weight="fill" className="w-4 h-4 group-hover:text-[var(--accent-secondary)] transition-colors" />
                Discord
                <span className="text-[9px] font-pixel text-text-muted">(coming soon)</span>
              </a>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-8 border-t border-[var(--border-subtle)] flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-text-muted text-xs">
            © 2025 CeloPlace. All rights reserved.
          </p>
          <div className="flex items-center gap-2 text-text-muted text-xs font-mono">
            <span className="w-1.5 h-1.5 rounded-full bg-[var(--celo-green)] animate-pulse inline-block" />
            Built on Celo Mainnet
          </div>
        </div>
      </div>
    </footer>
  );
}
