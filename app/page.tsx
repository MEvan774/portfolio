import Image from "next/image";
import ProjectCard from "./components/ProjectCard";
import { projects } from "./lib/projects";
import { getAllProjects } from "./lib/mdx";
import SkillsSection from "./components/SkillsCard";
import { getServerTranslations } from "../app/lib/ServerTranslations";
import PageReadyNotifier from "./components/PageReadyNotifier";

export default async function Home() {
  const allProjects = await getAllProjects();
  const { t } = await getServerTranslations();

  return (
    <>
      <PageReadyNotifier />

      <main className="min-h-screen bg-[#E9EDFF] dark:bg-black">
        {/* ABOUT ME - starts right after navbar */}
        <section className="bg-[#E9EDFF] dark:bg-gray-900 overflow-visible relative">

          <div className="px-4 sm:px-6 lg:px-8 py-8 max-w-6xl mx-auto">
            <div className="flex flex-col md:flex-row gap-6 md:gap-8 justify-between items-start">

              {/* Text */}
              <div className="flex-1 space-y-4">
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-black dark:text-white leading-tight">
                  IM <span className="text-[#00AFC7]">MILAN,</span>
                  <br />
                  SOFTWARE
                  <br />
                  ENGINEER
                </h1>

                <p className="text-sm font-medium text-black dark:text-gray-300 max-w-md">
                  {t("landingPage.aboutMeContent")}
                </p>

                <button
                  className="
                    rounded-full
                    border-3
                    border-black
                    dark:border-[#00AFC7]
                    bg-white
                    dark:bg-gray-800
                    px-6
                    py-2
                    text-sm
                    font-black
                    hover:translate-x-[-2px]
                    hover:translate-y-[-2px]
                    hover:shadow-[4px_4px_0_0_#000]
                    transition-all
                  "
                >
                  CV
                </button>
              </div>

              {/* Image */}
              <div className="relative h-64 md:h-80 aspect-[3/4] overflow-hidden rounded-2xl border-4 border-black dark:border-[#00AFC7] shrink-0">
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

          {/* Slanted bottom with black outline */}
          <div className="relative">
            {/* Black border outline */}
            <svg 
              className="absolute bottom-0 left-0 w-full pointer-events-none" 
              style={{ height: '134px' }}
              preserveAspectRatio="none"
              viewBox="0 0 100 100"
            >
              <path 
                d="M 0,40 L 100,0 L 100,100 L 0,100 Z" 
                fill="black" 
                stroke="black" 
                strokeWidth="0.1"
                vectorEffect="non-scaling-stroke"
              />
            </svg>
            
            {/* Turquoise fill */}
            <div
              className="bg-[#00AFC7] h-32"
              style={{
                clipPath: "polygon(0 40%, 100% 0%, 100% 100%, 0 100%)",
              }}
            />
          </div>
        </section>

        {/* TURQUOISE BACKGROUND WITH GRID - starts after About Me */}
        <div className="relative bg-[#00AFC7] dark:bg-[#00AFC7]">

          {/* GRID FADE OVERLAY */}
<div
  className="absolute inset-0 z-[1] pointer-events-none"
  style={{
    background: `
      linear-gradient(
        to bottom,
        #00AFC7 0%,
        rgba(0, 175, 199, 1) 25%,
        rgba(0, 175, 199, 0.8) 30%,
        rgba(119, 205, 255, 0) 80%,
        rgba(119, 205, 255, 0) 100%
      )
    `,
  }}
/>
<div
  className="absolute inset-0 z-0 pointer-events-none"
  style={{
    backgroundImage: `
      linear-gradient(to right, #77cdff 2px, transparent 2px),
      linear-gradient(to bottom, #77cdff 2px, transparent 2px)
    `,
    backgroundSize: "32px 32px",
  }}
/>

          {/* CONTENT */}
          <div className="relative z-10">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6 py-10">
              <SkillsSection />

              <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {projects.map((project) => (
                  <ProjectCard key={project.slug} project={project} />
                ))}
              </section>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}