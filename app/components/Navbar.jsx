import Link from "next/link";
import { Moon, Sun } from "lucide-react";

export default function Navbar() {
  return (
    <nav className="sticky top-0 z-50 bg-gradient-to-r from-[#1C2594] to-[#5BCAF3] p-4 shadow-md">
      <div className="flex items-center justify-between px-8">
        
        {/* Left: Name / Logo */}
        <div className="text-lg font-bold text-white">
          <Link href="/">Milan Breuren</Link>
        </div>

        {/* Right: Language + Dark Mode */}
        <div className="flex items-center gap-6 text-white">
          
          {/* Language toggle (display only for now) */}
          <button className="text-xl font-bold hover:opacity-80">
            ENG
          </button>

          {/* Dark mode toggle (UI only) */}
          <button
            aria-label="Toggle dark mode"
            className="rounded-full p-2 hover:bg-white/20 transition"
          >
            <Moon size={24} />
          </button>

        </div>
      </div>
    </nav>
  );
}
