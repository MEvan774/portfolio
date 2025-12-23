import { Github } from "lucide-react";

export default function ProjectCard() {
  return (
    <div className="relative aspect-square rounded-lg bg-[#cfe4f5] overflow-hidden shadow-md">
      
      {/* Project preview area */}
      <div className="flex h-full items-center justify-center text-black">
        {/* project preview / image */}
      </div>

      {/* Bottom bar */}
      <div className="absolute bottom-0 left-0 right-0 flex items-center justify-between bg-black/70 px-3 py-2 text-white">
        <span className="text-sm font-medium">
          Project name
        </span>

        <a
          href="https://github.com/your-repo"
          target="_blank"
          aria-label="View on GitHub"
          className="hover:opacity-80 transition"
        >
          <Github size={18} />
        </a>
      </div>
    </div>
  );
}
