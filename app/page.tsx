import Image from "next/image";
import ProjectCard from "./components/ProjectCard";
import { projects } from "./lib/projects";
import { getAllProjects } from "./lib/mdx";
import SkillsSection from "./components/SkillsCard";
import { getServerTranslations } from "../app/lib/ServerTranslations";
import PageReadyNotifier from "./components/PageReadyNotifier";
import ShaderBackground from "./components/ShaderBackground";
import SidebarMenu from "./components/SidebarMenu";

// Note: Add this to your globals.css or tailwind.config.js:
// @keyframes float {
//   0%, 100% { transform: translateY(0px); }
//   50% { transform: translateY(-12px); }
// }
// .animate-float { animation: float 4s ease-in-out infinite; }

export default async function Home() {
  const allProjects = await getAllProjects();
  const { t } = await getServerTranslations();

  return (
    <>
      <PageReadyNotifier />
      <SidebarMenu />

      <main id="home" className="min-h-screen bg-[#E9EDFF] dark:bg-gray-950">
        {/* ABOUT ME */}
        <section className="bg-[#E9EDFF] dark:bg-gray-950 overflow-visible relative pb-32 md:pb-24">
          <div className="px-4 sm:px-6 lg:px-8 py-10 max-w-6xl mx-auto">
            <div className="flex flex-col md:flex-row gap-8 md:gap-12 justify-between items-center md:items-start">

              {/* Text */}
              <div className="flex-1 space-y-6 pb-4 md:pb-0">
                <h1 className="text-5xl md:text-6xl lg:text-8xl font-black text-black dark:text-white leading-[0.9] tracking-tight">
                  {t("landingPage.aboutMe")}{" "}
                  <span className="text-[#00AFC7]">MILAN,</span>
                  <br />
                  SOFTWARE
                  <br />
                  {/* Outline-only text - black in light mode, turquoise in dark mode */}
                  <span
                    className="text-transparent [text-shadow:none] [-webkit-text-stroke:3px_black] dark:[-webkit-text-stroke:3px_#00AFC7]"
                  >
                    ENGINEER
                  </span>
                </h1>

                <p className="text-base font-medium text-black/70 dark:text-gray-300 max-w-sm leading-relaxed">
                  {t("landingPage.aboutMeContent")}
                </p>

                <div className="flex items-center gap-4">
                  <a
                    href="/cv/milan-breuren-cv.pdf"
                    download
                    className="
                      rounded-full
                      border-4
                      border-black
                      dark:border-[#00AFC7]
                      bg-black
                      dark:bg-white
                      px-8
                      py-3
                      text-base
                      font-black
                      text-white
                      dark:text-black
                      shadow-[5px_5px_0_0_#00AFC7]
                      dark:shadow-[5px_5px_0_0_#00AFC7]
                      hover:translate-x-[-3px]
                      hover:translate-y-[-3px]
                      hover:shadow-[8px_8px_0_0_#00AFC7]
                      dark:hover:shadow-[8px_8px_0_0_#00AFC7]
                      transition-all
                      uppercase
                      tracking-wider
                    "
                  >
                    Download CV
                  </a>
                  <span className="text-xs font-black text-black/30 dark:text-gray-600 uppercase tracking-widest">
                    ↓ scroll
                  </span>
                </div>
              </div>

              {/* Image - larger, tilted, with multiple accent blocks and floating animation */}
              <div className="relative shrink-0 self-center md:self-start animate-float">
                {/* Black accent block - behind turquoise */}
                <div className="absolute inset-0 translate-x-[-8px] translate-y-[8px] bg-black rotate-[-2deg] z-0" />
                {/* Turquoise accent block */}
                <div className="absolute inset-0 translate-x-4 translate-y-4 bg-[#00AFC7] rotate-[2deg] z-[1]" />
                {/* Photo - larger and tilted */}
                <div className="relative h-80 md:h-[480px] w-64 md:w-80 overflow-hidden border-4 border-black rotate-[3deg] z-10 translate-y-0 md:translate-y-[-40px]">
                  <Image
                    src="/images/profile/profile.jpg"
                    alt="Profile photo"
                    fill
                    className="object-cover object-top rotate-[-3deg] scale-110"
                    priority
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Slanted bottom */}
          <div className="absolute bottom-0 left-0 right-0">
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
            <div
              className="bg-[#00AFC7] h-32"
              style={{ clipPath: "polygon(0 40%, 100% 0%, 100% 100%, 0 100%)" }}
            />
          </div>
        </section>

        {/* TURQUOISE SECTION - extra top padding for photo overlap */}
        <div className="relative bg-[#00AFC7] dark:bg-[#00AFC7]">
          <div className="absolute inset-0 z-0">
            <ShaderBackground />
          </div>
          <div className="relative z-10">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 py-16 pt-20 md:pt-24">
              <div id="skills">
                <SkillsSection />
              </div>
              <section id="projects" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
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