"use client";

export default function ScrollToTopButton() {
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  return (
    <button
      onClick={scrollToTop}
      className="
        mt-12
        flex
        items-center
        justify-center
        rounded-2xl
        border-4
        border-black
        bg-white
        px-6
        py-3
        font-black
        text-black
        shadow-[4px_4px_0_0_#000]
        transition
        active:translate-x-[2px]
        active:translate-y-[2px]
        active:shadow-[2px_2px_0_0_#000]
        md:hidden
      "
    >
      Back to top
    </button>
  );
}
