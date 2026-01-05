import Link from "next/link";
import { Github } from "lucide-react";
import type { Project } from "./../lib/projects";

type Props = {
  project: Project;
};

export default function ProjectCard({ project }: Props) {
  return (
    <div className="group relative aspect-square overflow-hidden mt-4 rounded-xl border-4 border-black bg-[#E9EDFF] shadow-[6px_6px_0_0_#000]
  absolute inset-0
  bg-[#cfe4f5]
  transition-all duration-150 ease-out
  shadow-[6px_6px_0_0_#000]

  hover:scale-101
  hover:-translate-x-[2px] hover:-translate-y-[2px]
  hover:shadow-[7px_7px_0_1px_#000]

  active:scale-99
  active:translate-x-[2px] active:translate-y-[2px]
  active:shadow-[2px_2px_0_0_#000]
">
      
      {/* Clickable card area */}
      <Link
        href={`/projects/${project.slug}`}
        className="absolute inset-0 bg-[#cfe4f5] transition hover:brightness-95"
      >
        <span className="sr-only">
          View {project.name}
        </span>
      </Link>

      {/* Bottom bar */}
      <div className=" border-t-2 border-black pointer-events-none absolute bottom-0 left-0 right-0 flex items-center justify-between bg-[#00AFC7] px-3 py-2 text-white">
        <span className="text-s font-bold text-black">
          {project.name}
        </span>

        {/* GitHub button */}
        <a
          href={project.github}
          target="_blank"
          rel="noopener noreferrer"
          className="pointer-events-auto hover:opacity-80 transition text-black"
          aria-label={`View ${project.name} on GitHub`}
        >
          <Github size={24} />
        </a>
      </div>
    </div>
  );
}
