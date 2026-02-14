"use client";

import Link from "next/link";

export default function SidebarMenu() {
  const menuItems = [
    { label: "HOME", href: "#home" },
    { label: "SKILLS", href: "#skills" },
    { label: "PROJECTS", href: "#projects" },
    { label: "CONTACT", href: "#contact" },
  ];

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    e.preventDefault();
    const targetId = href.replace("#", "");
    const element = document.getElementById(targetId);
    
    if (element) {
      element.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
  };

  return (
    <aside className="fixed top-0 left-0 h-full w-64 bg-transparent z-40 hidden lg:block pointer-events-none">
      <div className="flex flex-col h-full pt-24 pb-8 px-6 pointer-events-auto">
        {/* Menu Items */}
        <nav className="flex-1 space-y-4">
          {menuItems.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              onClick={(e) => handleClick(e, item.href)}
              className="block w-full text-left px-6 py-4 bg-white dark:bg-gray-800/90 backdrop-blur-sm border-3 border-black dark:border-[#00AFC7] shadow-[4px_4px_0_0_#000] hover:shadow-[6px_6px_0_0_#000] hover:translate-x-[-2px] hover:translate-y-[-2px] transition-all text-xl font-black text-black dark:text-white"
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </div>
    </aside>
  );
}