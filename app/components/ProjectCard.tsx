import Link from "next/link";
import { Github } from "lucide-react";
import type { Project } from "./../lib/projects";

type Props = {
  project: Project;
};

export default function ProjectCard({ project }: Props) {
  return (
    <div className="group relative aspect-square overflow-hidden rounded-lg shadow-md">
      
      {/* Clickable card area */}
      <Link
        href={project.href}
        className="absolute inset-0 bg-[#cfe4f5] transition hover:brightness-95"
      >
        <span className="sr-only">
          View {project.name}
        </span>
      </Link>

      {/* Bottom bar */}
      <div className="pointer-events-none absolute bottom-0 left-0 right-0 flex items-center justify-between bg-black/70 px-3 py-2 text-white">
        <span className="text-sm font-medium">
          {project.name}
        </span>

        {/* GitHub button */}
        <a
          href={project.github}
          target="_blank"
          rel="noopener noreferrer"
          className="pointer-events-auto hover:opacity-80 transition"
          aria-label={`View ${project.name} on GitHub`}
        >
          <Github size={18} />
        </a>
      </div>
    </div>
  );
}
