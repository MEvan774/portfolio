// app/components/Navbar.tsx - NEOBRUTALIST VERSION WITH ANGLED BLACK SECTION
"use client";

import { Moon, Sun, Menu, X } from "lucide-react";
import { useTheme } from "../hooks/UseTheme";
import { useLanguage } from "../hooks/UseLanguage";
import TransitionLink from "./TransitionLink";
import { useState } from "react";
import Link from "next/link";

export default function Navbar() {
  const { isDark, toggle } = useTheme();
  const { t, toggleLanguage } = useLanguage();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const menuItems = [
    { label: "HOME", href: "#home" },
    { label: "SKILLS", href: "#skills" },
    { label: "PROJECTS", href: "#projects" },
    { label: "CONTACT", href: "#contact" },
  ];

  const handleMenuClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    e.preventDefault();
    const targetId = href.replace("#", "");
    const element = document.getElementById(targetId);
    
    if (element) {
      element.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
      setIsMobileMenuOpen(false);
    }
  };

  return (
    <>
      <nav className="w-full border-b-4 border-black relative top-0 z-50 sticky">
        <div className="flex items-stretch h-16">
          {/* Left section - Turquoise with name */}
          <div className="flex-1 bg-[#00AFC7] flex items-center px-6">
            <div className="font-black text-black text-xl sm:text-2xl uppercase transition hover:text-white">
              <TransitionLink 
                href="/"
                dotColor={[0, 0, 0]}
                spacing={35}
                dotSize={1.2}
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
                clipPath: 'polygon(-1% -1%, 65% 100%, -1% 100%)'
              }}
            />
            
            {/* Content */}
            <div className="relative z-10 flex items-center gap-4 ml-6">
              {/* Desktop buttons - hidden on mobile */}
              <button
                onClick={toggleLanguage}
                className="hidden lg:block text-xl font-bold text-white hover:text-[#00AFC7] transition"
              >
                {t("navbar.language")}
              </button>

              {/* Hamburger button - only visible on mobile/tablet */}
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="lg:hidden text-white hover:text-[#00AFC7] transition"
                aria-label="Toggle menu"
              >
                {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Mobile Menu Sidebar */}
      <aside
        className={`fixed top-16 right-0 h-[calc(100%-4rem)] w-64 bg-[#E9EDFF] dark:bg-gray-900 border-l-4 border-black dark:border-[#00AFC7] z-40 lg:hidden transition-transform duration-300 ${
          isMobileMenuOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex flex-col h-full pt-8 pb-8 px-6">
          {/* Menu Items */}
          <nav className="flex-1 space-y-4">
            {menuItems.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                onClick={(e) => handleMenuClick(e, item.href)}
                className="block w-full text-left px-6 py-4 bg-white dark:bg-gray-800 border-3 border-black dark:border-[#00AFC7] shadow-[4px_4px_0_0_#000] hover:shadow-[6px_6px_0_0_#000] hover:translate-x-[-2px] hover:translate-y-[-2px] transition-all text-lg font-black text-black dark:text-white"
              >
                {item.label}
              </Link>
            ))}

            {/* Language Toggle Button */}
            <button
              onClick={toggleLanguage}
              className="block w-full text-left px-6 py-4 bg-white dark:bg-gray-800 border-3 border-black dark:border-[#00AFC7] shadow-[4px_4px_0_0_#000] hover:shadow-[6px_6px_0_0_#000] hover:translate-x-[-2px] hover:translate-y-[-2px] transition-all text-lg font-black text-black dark:text-white"
            >
              {t("navbar.language")}
            </button>
          </nav>

          {/* Footer */}
          <div className="mt-auto pt-6 border-t-3 border-black dark:border-[#00AFC7]">
            <p className="text-sm font-bold text-black dark:text-gray-300">
              © 2024 MILAN
            </p>
          </div>
        </div>
      </aside>
    </>
  );
}