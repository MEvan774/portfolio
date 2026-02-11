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
        bg-[linear-gradient(90deg,#000_48px,#E9EDFF_48px)]
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
        className="absolute inset-0 hover:brightness-95 transition"
        dotColor={[0, 0, 0]}
        ariaLabel={`View ${project.name}`}
      >
        <span className="sr-only">View {project.name}</span>
      </TransitionLink>

      {/* Left sidebar content */}
      <div
        className="
          pointer-events-none absolute top-0 bottom-0 left-0 w-12
          flex items-left justify-center
        "
      >
        <span
          className="
            text-2xl font-black text-[#00AFC7]
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
          pointer-events-auto absolute bottom-3 right-3
          text-black
          transition
          hover:-translate-y-[1px]
          active:translate-y-[1px]
        "
      >
        <Github size={24} />
      </a>
    </div>
  );
}
