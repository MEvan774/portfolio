"use client";

import { useState } from "react";
import Image from "next/image";

type MediaItem = {
  type: "image" | "video";
  src: string;
  thumbnail?: string;
};

export default function ProjectMediaGallery({
  items,
}: {
  items: MediaItem[];
}) {
  const [activeIndex, setActiveIndex] = useState(0);

  if (!items || items.length === 0) return null;

  const active = items[activeIndex];

  if (!active?.src) return null;

  return (
    <div className="flex flex-col gap-3 w-full">
      {/* MAIN VIEWER */}
      <div className="relative w-full sm:h-110 h-50 border-4 border-black dark:border-[#00AFC7] rounded-xl overflow-hidden bg-gray-900">
        {active.type === "image" ? (
          <Image
            src={active.src}
            alt="Project screenshot"
            fill
            className="object-contain"
            sizes="(max-width: 640px) 100vw, (max-width: 1280px) 80vw, 1200px"
            priority
            quality={100}
          />
        ) : (
          <video
            src={active.src}
            controls
            className="w-full h-full object-contain"
          />
        )}
      </div>

      {/* THUMBNAIL RAIL */}
      <div className="flex items-center gap-3 h-24 overflow-x-auto pb-2">
        {items.map((item, index) => {
          if (!item?.src) return null;
          const isActive = index === activeIndex;
          const thumbSrc =
            item.type === "video" ? item.thumbnail || item.src : item.src;

          return (
            <button
              key={`${item.src}-${index}`}
              type="button"
              onClick={() => setActiveIndex(index)}
              style={{ width: 128, height: 80 }}
              className={`
                relative shrink-0
                border-4 border-black dark:border-[#00AFC7]
                rounded-lg overflow-hidden bg-gray-200
                transition-all duration-100
                ${
                  isActive
                    ? "-translate-x-[1px] -translate-y-[1px] shadow-[4px_4px_0_0_#00AFC7]"
                    : "opacity-80 hover:opacity-100"
                }
              `}
            >
              {item.type === "video" && !item.thumbnail ? (
                <div className="absolute inset-0 flex items-center justify-center bg-gray-300">
                  <span className="font-black text-black text-2xl">▶</span>
                </div>
              ) : (
                <Image
                  src={thumbSrc}
                  alt={`Thumbnail ${index + 1}`}
                  fill
                  className="object-cover"
                  sizes="128px"
                  quality={90}
                />
              )}

              {item.type === "video" && item.thumbnail && (
                <span className="absolute inset-0 flex items-center justify-center font-black text-white text-xl bg-black/40">
                  ▶
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}