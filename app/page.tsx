import Image from "next/image";
import ProjectCard from "./components/ProjectCard"
import { projects } from "./lib/projects";

export default function Home() {
  return (
    <main className="flex justify-center bg-white text-white">
      <div className="w-full max-w-2/4 space-y-6 py-10">

        {/* About Me Card */}
        <section className="rounded-lg bg-[#1c1c1c] p-4 shadow-md">
          <div className="flex flex-row justify-between">
            <h2 className="mb-3 text-sm font-semibold text-white/80 w-80 h-62">
              Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.
            </h2>

            <div className="flex gap-4">
              {/* Text */}


              {/* Profile Image Placeholder */}
              <div className="relative h-62 aspect-[3/4] overflow-hidden rounded-md relative">
                <Image
                  src="/images/profile/profile.jpg"
                  alt="Profile photo"
                  fill
                  className="object-cover"
                  priority
                />
              </div>

            </div>
          </div>

          {/* CV Button */}
          <button className="mt-4 rounded bg-[#2a2a2a] px-3 py-1 text-xs text-white/80 hover:bg-[#333] transition">
            CV
          </button>
        </section>

        {/* Skills Card */}
        <section className="rounded-lg bg-[#1c1c1c] p-4 shadow-md flex h-[600]">
          <h2 className="mb-3 text-sm font-semibold text-white/80">
            Skills
          </h2>

          <div className="flex gap-6">
            {/* Skill icons / list */}
            <div className="flex flex-col gap-2 text-sm text-white/60">
              {/* icons or labels */}
            </div>

            {/* Dropdown */}
            <select className="rounded bg-[#2a2a2a] px-2 py-1 text-sm text-white outline-none h-[25]">
              <option>All</option>
            </select>
          </div>
        </section>

        {/* Projects Grid */}
        <section className="grid grid-cols-3 gap-4">
          {projects.map((project: { name: string; href: string; github: string; image?: string; }) => (
            <ProjectCard
              key={project.name}
              project={project}
            />
          ))}
        </section>

      </div>
    </main>
  );
}
