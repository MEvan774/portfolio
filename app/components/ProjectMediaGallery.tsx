"use client";

import { useState } from "react";
import Image from "next/image";

type MediaItem = {
  type: "image" | "video" | "unity";
  src: string;
  thumbnail?: string;
  title?: string;
};

export default function ProjectMediaGallery({
  items,
}: {
  items: MediaItem[];
}) {
  const [activeIndex, setActiveIndex] = useState(0);
  // The Unity build (and its microphone prompt) only loads after a click,
  // and is torn down again whenever the visitor switches to another tile.
  const [unityPlaying, setUnityPlaying] = useState(false);

  if (!items || items.length === 0) return null;

  const active = items[activeIndex];

  if (!active?.src) return null;

  function selectIndex(index: number) {
    setActiveIndex(index);
    setUnityPlaying(false);
  }

  return (
    <div className="flex flex-col gap-3 w-full">
      {/* MAIN VIEWER */}
      <div className="relative w-full sm:h-110 h-50 border-4 border-black dark:border-[#00AFC7] rounded-xl overflow-hidden bg-gray-900">
        {active.type === "image" && (
          <Image
            src={active.src}
            alt="Project screenshot"
            fill
            className="object-contain"
            sizes="(max-width: 640px) 100vw, (max-width: 1280px) 80vw, 1200px"
            priority
            quality={100}
          />
        )}

        {active.type === "video" && (
          <video
            key={active.src}
            src={active.src}
            autoPlay
            muted
            loop
            playsInline
            controls
            className="w-full h-full object-contain"
          />
        )}

        {active.type === "unity" &&
          (unityPlaying ? (
            <iframe
              key={active.src}
              src={active.src}
              title={active.title || "Playable demo"}
              allow="microphone; autoplay; fullscreen"
              className="w-full h-full bg-black"
            />
          ) : (
            <button
              type="button"
              onClick={() => setUnityPlaying(true)}
              aria-label={`Play ${active.title || "the playable demo"} — uses your microphone`}
              className="group absolute inset-0 flex flex-col items-center justify-center"
            >
              {active.thumbnail && (
                <Image
                  src={active.thumbnail}
                  alt={active.title || "Playable demo"}
                  fill
                  className="object-cover"
                  sizes="(max-width: 640px) 100vw, (max-width: 1280px) 80vw, 1200px"
                  priority
                />
              )}
              {/* Dim overlay */}
              <span className="absolute inset-0 bg-black/40 transition-colors group-hover:bg-black/25" />
              {/* Play button */}
              <span className="relative z-10 flex h-16 w-16 items-center justify-center rounded-full border-4 border-black bg-[#00AFC7] text-black shadow-[4px_4px_0_0_#000] transition-transform group-hover:scale-110">
                <span className="ml-1 text-2xl leading-none">▶</span>
              </span>
              {/* Label */}
              <span className="relative z-10 mt-4 rounded-full border-2 border-black dark:border-[#00AFC7] bg-black px-4 py-1.5 text-[11px] sm:text-xs font-black uppercase tracking-wider text-[#00AFC7]">
                Play demo · 🎤 uses microphone
              </span>
            </button>
          ))}
      </div>

      {/* THUMBNAIL RAIL */}
      <div className="flex items-center gap-3 h-24 overflow-x-auto pb-2">
        {items.map((item, index) => {
          if (!item?.src) return null;
          const isActive = index === activeIndex;
          const thumbSrc =
            item.type === "image" ? item.src : item.thumbnail || item.src;
          // Image tiles always have an image; video/unity tiles only when a
          // thumbnail was supplied (their src is a video/iframe URL, not an image).
          const showThumbImage =
            item.type === "image" || !!item.thumbnail;

          return (
            <button
              key={`${item.src}-${index}`}
              type="button"
              onClick={() => selectIndex(index)}
              style={{ width: 128, height: 80 }}
              className={`
                relative shrink-0
                border-4 border-black dark:border-[#00AFC7]
                rounded-lg overflow-hidden bg-gray-200
                transition-all duration-100
                ${isActive
                  ? "-translate-x-[1px] -translate-y-[1px] shadow-[4px_4px_0_0_#00AFC7]"
                  : "opacity-80 hover:opacity-100"
                }
              `}
            >
              {showThumbImage ? (
                <Image
                  src={thumbSrc}
                  alt={`Thumbnail ${index + 1}`}
                  fill
                  className="object-cover"
                  sizes="128px"
                  quality={90}
                />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center bg-gray-300">
                  <span className="font-black text-black text-2xl">▶</span>
                </div>
              )}

              {item.type === "video" && item.thumbnail && (
                <span className="absolute inset-0 flex items-center justify-center font-black text-white text-xl bg-black/40">
                  ▶
                </span>
              )}

              {item.type === "unity" && (
                <span className="absolute inset-0 flex items-center justify-center bg-black/40">
                  <span className="rounded border border-black bg-[#00AFC7] px-1.5 py-0.5 text-[9px] font-black uppercase tracking-wider text-black">
                    ▶ Play
                  </span>
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
