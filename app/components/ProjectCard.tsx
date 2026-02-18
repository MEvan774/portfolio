// app/components/ProjectCard.tsx
import { Github } from "lucide-react";
import type { Project } from "./../lib/projects";
import TransitionLink from "./TransitionLink";

type Props = {
  project: Project;
};

export default function ProjectCard({ project }: Props) {
  return (
    <div
      className="
        group relative aspect-square overflow-hidden mt-4 rounded-xl
        border-4 border-black
        bg-[linear-gradient(90deg,#000_32px,#E9EDFF_32px)]
        md:bg-[linear-gradient(90deg,#000_48px,#E9EDFF_48px)]
        shadow-[6px_6px_0_0_#000]
        transition-all duration-150 ease-out

        hover:scale-102
        hover:-translate-x-[6px] hover:-translate-y-[6px]
        hover:shadow-[11px_11px_0_-3px_#000]

        active:scale-101
        active:translate-x-[2px] active:translate-y-[2px]
        active:shadow-[2px_2px_0_0_#000]
      "
    >
      {/* Clickable card area */}
      <TransitionLink
        href={`/projects/${project.slug}`}
        className="absolute inset-0
          transition-[filter]
          duration-150
          ease-[steps(1)]
          hover:brightness-95"
        dotColor={[0, 0, 0]}
        spacing={35}
        dotSize={1.2}
        ariaLabel={`View ${project.name}`}
      >
        <span className="sr-only">View {project.name}</span>
      </TransitionLink>

      {/* Left sidebar content */}
      <div
        className="
          pointer-events-none absolute top-0 bottom-0 left-0
          w-8 md:w-12
          flex items-left justify-center
        "
      >
        <span
          className="
            text-base md:text-2xl font-black text-[#00AFC7]
            [writing-mode:vertical-rl]
            rotate-180
            select-none
            uppercase
            mb-3
          "
        >
          {project.name}
        </span>
      </div>

      {/* GitHub button – bottom right */}
      <a
        href={project.github}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={`View ${project.name} on GitHub`}
        className="
          pointer-events-auto absolute bottom-2 right-2 md:bottom-3 md:right-3
          rounded-3xl
          border-2
          border-black
          dark:border-[#00AFC7]
          bg-black
          dark:bg-[#00AFC7]
          px-1 py-1
          text-sm font-black
          text-white
          dark:text-black
          shadow-[4px_4px_0_0_#00AFC7]
          dark:shadow-[4px_4px_0_0_#000]
          hover:translate-x-[-3px]
          hover:translate-y-[-3px]
          hover:shadow-[8px_8px_0_0_#00AFC7]
          dark:hover:shadow-[8px_8px_0_0_#000]
          transition-all
          uppercase
          tracking-wider
        "
      >
        <Github size={16} className="md:hidden" />
        <Github size={24} className="hidden md:block" />
      </a>
    </div>
  );
}