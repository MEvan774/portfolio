import Image from "next/image";
import ProjectCard from "./components/ProjectCard"
import { projects } from "./lib/projects";
import { getAllProjects } from "./lib/mdx";

export default async function Home() {
  const allProjects = await getAllProjects();

  return (
    <main className="flex justify-center transition-colors bg-[#E9EDFF] text-gray-900 dark:bg-black dark:text-gray-100">
      <div className="w-full max-w-2/4 space-y-6 py-10">

        {/* About Me Card */}
        <section className="bg-white rounded-3xl border-4 border-black shadow-[6px_6px_0_0_#000] dark:shadow-[6px_6px_0_0_white] overflow-hidden">
  {/* Browser-like top bar */}
  <div className="flex items-center justify-between h-12 px-4 bg-[#00AFC7] border-b-4 border-black mb-4">
    <h1 className="font-black text-black text-1xl">
      About me
    </h1>

    {/* Optional browser dots */}
    <div className="flex gap-2">
      <span className="h-3 w-3 rounded-full bg-red-500 border-2 border-black" />
      <span className="h-3 w-3 rounded-full bg-yellow-400 border-2 border-black" />
      <span className="h-3 w-3 rounded-full bg-green-500 border-2 border-black" />
    </div>
  </div>

  {/* Card content */}
  <div className="p-4">
    <div className="flex flex-row justify-between">
      <p className="mb-3 text-sm font-semibold text-black w-3/5">
        Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.
      </p>

      <div className="flex gap-4">
              <div className="relative h-62 aspect-[3/4] overflow-hidden rounded-3xl border-4 border-black relative">
                <Image
                  src="/images/profile/profile.jpg"
                  alt="Profile photo"
                  fill
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  className="object-cover"
                  priority
                />
              </div>
      </div>
    </div>

    {/* CV Button */}
    <button className="mt-4 rounded-3xl border-2 border-black bg-[#E9EDFF] px-3 py-1 text-sm font-black text-black/80 text-center hover:bg-[#DDE3FF] transition">
      CV
    </button>
  </div>
</section>

<section className="bg-white rounded-3xl border-4 border-black shadow-[6px_6px_0_0_#000] overflow-hidden">
  {/* Browser-like top bar */}
  <div className="flex items-center justify-between h-12 px-4 bg-[#00AFC7] border-b-4 border-black">
    <h2 className="font-black text-black text-1xl">
      Skills
    </h2>

        {/* Dropdown */}
    <select className="h-7 rounded-xl border-2 border-black bg-[#E9EDFF] px-2 text-sm font-semibold text-black outline-none">
      <option>All</option>
      <option>Frontend</option>
      <option>Backend</option>
      <option>Tools</option>
    </select>

    {/* Optional window controls */}
    <div className="flex gap-2">
      <span className="h-3 w-3 rounded-full bg-red-500 border-2 border-black" />
      <span className="h-3 w-3 rounded-full bg-yellow-400 border-2 border-black" />
      <span className="h-3 w-3 rounded-full bg-green-500 border-2 border-black" />
    </div>
  </div>

  {/* Card content */}
  <div className="p-4 flex gap-6">
    {/* Skill icons / list */}
    <div className="flex flex-col gap-2 text-sm font-semibold text-black/70">
      {/* icons or labels */}
    </div>
  </div>
</section>


        {/* Projects Grid */}
        <section className="grid grid-cols-3 gap-4">
      {projects.map((project) => (
        <ProjectCard
          key={project.slug}
          project={project}
        />
      ))}
        </section>

      </div>
    </main>
  );
 }
