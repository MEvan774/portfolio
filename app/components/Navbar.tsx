"use client";

import Link from "next/link";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "../hooks/UseTheme";
import { useTranslation } from "react-i18next";
import { useEffect, useRef } from "react";

export default function Navbar() {
  const { isDark, toggle } = useTheme();
  const { t, i18n } = useTranslation("global");
  const handleChangeLanguage = (lang: string) => {
    i18n.changeLanguage(lang);
  };

  const navRef = useRef<HTMLElement | null>(null);
  const shiftTargetRef = useRef(0); // desired shift
  const shiftCurrentRef = useRef(0); // current shift (animated)
  const lastScrollRef = useRef(0);
  const rafRef = useRef<number | null>(null);

  // tuning
  const LERP = 0.44; // smoothing (0..1) - lower = more lag
  const SHIFT_MULTIPLIER = 0.25; // how much scroll delta translates to nav movement
  const MAX_SHIFT = 24; // max px shift
  const DECAY = 2.92; // decay applied to target each frame (returns to 0)

useEffect(() => {
  lastScrollRef.current = window.scrollY;

  const onScroll = () => {
    const y = window.scrollY;
    const delta = y - lastScrollRef.current;
    lastScrollRef.current = y;

    shiftTargetRef.current = Math.max(
      -MAX_SHIFT,
      Math.min(MAX_SHIFT, shiftTargetRef.current + delta * SHIFT_MULTIPLIER)
    );

    if (rafRef.current === null) {
      rafRef.current = requestAnimationFrame(animate);
    }
  };

  const animate = () => {
    // smooth toward target
    shiftCurrentRef.current +=
      (shiftTargetRef.current - shiftCurrentRef.current) * LERP;

    // gently return target to zero
    shiftTargetRef.current *= DECAY;

    if (navRef.current) {
      navRef.current.style.transform = `translateY(${-shiftCurrentRef.current}px)`;
    }

    // stop when motion is visually negligible
    if (
      Math.abs(shiftTargetRef.current) > 0.05 ||
      Math.abs(shiftCurrentRef.current) > 0.05
    ) {
      rafRef.current = requestAnimationFrame(animate);
    } else {
      // settle cleanly at zero, NO transform removal
      shiftTargetRef.current = 0;
      shiftCurrentRef.current = 0;
      if (navRef.current) {
        navRef.current.style.transform = "translateY(0px)";
      }
      rafRef.current = null;
    }
  };

  window.addEventListener("scroll", onScroll, { passive: true });
  return () => {
    window.removeEventListener("scroll", onScroll);
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
  };
}, []);

  return (
    <nav
      ref={navRef}
      className="sticky top-5 z-50 bg-[#00AFC7] p-4 rounded-b-3xl border-4 border-black w-2/4 mx-auto shadow-[6px_6px_0_0_#000] will-change-transform"
    >
      <div className="flex items-center justify-between">
        <div className="font-black text-black text-2xl">
          <Link href="/">Milan Breuren</Link>
        </div>

        <div className="flex items-center gap-6 font-black text-black text-2xl">
          <button
            onClick={() =>
              handleChangeLanguage(i18n.language === "en" ? "nl" : "en")
            }
            className="text-xl font-bold hover:opacity-80"
          >
            {t("navbar.language")}
          </button>

          <button
            onClick={toggle}
            className="rounded-full p-2 hover:bg-white/20 transition"
            aria-label="Toggle theme"
          >
            {isDark ? <Sun size={24} /> : <Moon size={24} />}
          </button>
        </div>
      </div>
    </nav>
  );
}
