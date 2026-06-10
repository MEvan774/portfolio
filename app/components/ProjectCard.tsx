/* eslint-disable @next/next/no-img-element */
// app/components/ProjectCard.tsx
import { Github, Trophy } from "lucide-react";
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
      {/* Project image – fills the area to the right of the sidebar */}
      {project.image && (
        <div className="absolute inset-0 left-8 md:left-12">
          <img
            src={project.image}
            alt={project.name}
            className="h-full w-full object-cover blur-none"
          />
        </div>
      )}

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
        <span className="sr-only bg-red">View {project.name}</span>
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

      {/* Bottom-right action icons */}
      <div className="pointer-events-none absolute bottom-2 right-2 md:bottom-3 md:right-3 flex items-center gap-2">
        {project.award && (
          <span
            aria-label={
              project.awardText
                ? `${project.name} — ${project.awardText}`
                : `${project.name} won an award`
            }
            className="
              group/award
              relative
              pointer-events-auto
              rounded-3xl
              border-2
              border-black
              dark:border-[#00AFC7]
              bg-black
              dark:bg-[#00AFC7]
              px-1 py-1
              text-white
              dark:text-black
              shadow-[4px_4px_0_0_#00AFC7]
              dark:shadow-[4px_4px_0_0_#000]
              transition-all
            "
          >
            <Trophy size={16} className="md:hidden" />
            <Trophy size={24} className="hidden md:block" />

            {/* Hover tooltip */}
            <span
              role="tooltip"
              className="
                pointer-events-none
                absolute bottom-full right-0 mb-2
                w-56
                rounded-xl
                border-2 border-black dark:border-[#00AFC7]
                bg-black dark:bg-[#00AFC7]
                px-3 py-2
                text-[10px] md:text-xs font-black uppercase tracking-wider
                text-[#00AFC7] dark:text-black
                shadow-[4px_4px_0_0_#00AFC7] dark:shadow-[4px_4px_0_0_#000]
                opacity-0 translate-y-1
                transition-all duration-150
                group-hover/award:opacity-100 group-hover/award:translate-y-0
                group-focus-within/award:opacity-100 group-focus-within/award:translate-y-0
                z-20
                normal-case
              "
            >
              {project.awardText ?? "Award winner"}
            </span>
          </span>
        )}
        <a
          href={project.github}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`View ${project.name} on GitHub`}
          className="
            pointer-events-auto
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
    </div>
  );
}