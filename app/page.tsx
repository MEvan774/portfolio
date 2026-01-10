import Image from "next/image";
import ProjectCard from "./components/ProjectCard";
import { projects } from "./lib/projects";
import { getAllProjects } from "./lib/mdx";
import SkillsSection from "./components/SkillsCard";
import { getServerTranslations } from "../app/lib/ServerTranslations";

export default async function Home() {
  const allProjects = await getAllProjects();
      const { t } = await getServerTranslations();

  return (
    <main className="flex justify-center bg-[#E9EDFF] text-gray-900 dark:bg-black dark:text-gray-100 transition-colors">
      <div className="sm:max-w-2/4 max-w-6xl px-4 sm:px-6 lg:px-0 space-y-6 py-10">

        {/* About Me Card */}
        <section className="
          bg-white
          dark:bg-black
          rounded-3xl
          border-4
          border-black
          dark:border-[#00AFC7]
          shadow-[6px_6px_0_0_#000]
          dark:shadow-[0px_0px_0_0_transparent]
          overflow-hidden
        ">

          {/* Browser-like top bar */}
          <div className="
            flex
            items-center
            justify-between
            h-12
            px-4
            bg-[#00AFC7]
            border-b-4
            border-black
            dark:border-[#00AFC7]
          ">
            <h1 className="font-black text-base sm:text-lg text-black">
              {t("landingPage.aboutMe")}
            </h1>

            <div className="flex gap-2">
              <span className="h-3 w-3 rounded-full bg-red-500 border-2 border-black" />
              <span className="h-3 w-3 rounded-full bg-yellow-400 border-2 border-black" />
              <span className="h-3 w-3 rounded-full bg-green-500 border-2 border-black" />
            </div>
          </div>

          {/* Card content */}
          <div className="p-4">
            <div className="flex flex-col md:flex-row gap-4 md:gap-6 justify-between">

              {/* Text */}
              <p className="text-sm font-semibold text-black md:w-3/5 dark:text-[#00AFC7]">
                {t("landingPage.aboutMeContent")}
              </p>

              {/* Image */}
              <div className="flex gap-4">
                <div className="
                  relative
                  h-62
                  aspect-[3/4]
                  overflow-hidden
                  rounded-3xl
                  border-4
                  border-black
                  dark:border-[#00AFC7]
                ">
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
            <button className="
              mt-4
              rounded-3xl
              border-2
              border-black
              dark:border-[#00AFC7]
              bg-[#E9EDFF]
              dark:bg-black
              px-4
              py-2
              text-sm
              font-black
              text-black
              dark:text-[#00AFC7]
              hover:bg-[#DDE3FF]
              dark:hover:bg-[#00AFC7]
              dark:hover:text-black
              transition
              active:translate-x-[2px]
              active:translate-y-[2px]
            ">
              CV
            </button>
          </div>
        </section>

        {/* Skills */}
        <SkillsSection />

        {/* Projects Grid */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {projects.map((project) => (
            <ProjectCard key={project.slug} project={project} />
          ))}
        </section>

      </div>
    </main>
  );
}
