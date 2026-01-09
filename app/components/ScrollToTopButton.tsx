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
        dark:border-[#00AFC7]
        bg-white
        dark:bg-black
        px-6
        py-3
        font-black
        text-black
        dark:text-[#00AFC7]
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
