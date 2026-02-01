// app/components/Navbar.tsx - NEOBRUTALIST VERSION WITH ANGLED BLACK SECTION
"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "../hooks/UseTheme";
import { useLanguage } from "../hooks/UseLanguage";
import TransitionLink from "./TransitionLink";

export default function Navbar() {
  const { isDark, toggle } = useTheme();
  const { t, toggleLanguage } = useLanguage();

  return (
    <nav className="w-full border-b-4 border-black relative top-0 z-50 sticky">
      <div className="flex items-stretch h-16">
        {/* Left section - Turquoise with name */}
        <div className="flex-1 bg-[#00AFC7] flex items-center px-6">
          <div className="font-black text-black text-xl sm:text-2xl">
            <TransitionLink 
              href="/"
              dotColor={[0, 175, 199]}
            >
              MILAN BREUREN
            </TransitionLink>
          </div>
        </div>

        {/* Right section - Black with angled edge */}
        <div className="relative bg-black flex items-center px-6 gap-4">
          {/* Angled edge overlay - creates the 10 o'clock angle */}
          <div 
            className="absolute left-0 top-0 bottom-0 w-8 bg-[#00AFC7]"
            style={{
              clipPath: 'polygon(0% 0%, 65% 100%, 0% 100%)'
            }}
          />
          
          {/* Content */}
          <div className="relative z-10 flex items-center gap-4 ml-6">
            <button
              onClick={toggleLanguage}
              className="text-xl font-bold text-[#00AFC7] hover:text-white transition"
            >
              {t("navbar.language")}
            </button>

            <button
              onClick={toggle}
              className="text-[#00AFC7] hover:text-white transition size-xl"
              aria-label="Toggle theme"
            >
              {isDark ? <Sun size={20} /> : <Moon size={20} />}
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}