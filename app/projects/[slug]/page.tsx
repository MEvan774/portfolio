/* eslint-disable @typescript-eslint/no-explicit-any */
import { getProjectBySlug } from "@/app/lib/mdx";
import { Github } from "lucide-react";
import { notFound } from "next/navigation";
import { SiTypescript, SiReact, SiNextdotjs, SiJavascript, SiNodedotjs, SiCss3, SiHtml5 } from "react-icons/si";
import CodeBlock from "../../components/codeBlock";
import { MDXRemote } from "next-mdx-remote/rsc";
import ProjectMediaGallery from "@/app/components/ProjectMediaGallery";
import { getServerTranslations } from "../../lib/ServerTranslations";
import PageReadyNotifier from "../../components/PageReadyNotifier";
import Slab3D from "../../components/Slab3D";
import ShaderBackground from "../../components/ShaderBackground";

type Props = { params: Promise<{ slug: string }> | { slug: string } };

const components = {
  pre: CodeBlock,
};

type MediaItem = {
  type: "image" | "video";
  src: string;
  thumbnail?: string;
};

export default async function ProjectPage({ params }: Props) {
  const { t } = await getServerTranslations();

  const resolved = await params;
  const slug = resolved?.slug;
  if (!slug) return notFound();

  let project;
  let meta;
  let media: MediaItem[] = [];

  try {
    project = getProjectBySlug(slug);
    meta = project.data;

    media = Array.isArray(meta.media)
      ? meta.media.filter((m) => m?.src && typeof m.src === "string")
      : [];
  } catch (err) {
    console.error("Project load error:", err);
    return notFound();
  }
    return (
      <>
        <PageReadyNotifier />

        <main className="min-h-screen bg-[#E9EDFF] dark:bg-black">
          {/* PROJECT OVERVIEW SECTION - Above background */}
          <section className="bg-[#E9EDFF] dark:bg-gray-900 overflow-visible relative pb-32">
            <div className="flex justify-center px-4 sm:px-6 lg:px-8 py-10">
              <div className="w-full sm:max-w-2/4 max-w-6xl">
                {/* Project Overview Card */}
                <div className="bg-white dark:bg-black rounded-3xl border-4 border-black shadow-[6px_6px_0_0_#000] overflow-hidden dark:border-[#00AFC7] dark:shadow-[0px_0px_0_0_black]">
                  {/* Top bar */}
                  <div className="flex items-center justify-between h-12 px-4 bg-[#00AFC7] border-b-4 border-black">
                    <h1 className="text-sm font-black text-black">{meta.title}</h1>

                    <div className="flex gap-2">
                      <span className="h-3 w-3 rounded-full bg-red-500 border-2 border-black" />
                      <span className="h-3 w-3 rounded-full bg-yellow-400 border-2 border-black" />
                      <span className="h-3 w-3 rounded-full bg-green-500 border-2 border-black" />
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-4">
                    {media.length > 0 && <ProjectMediaGallery items={media} />}
<div className="px-4 border-b-4 border-black dark:bg-[#00AFC7] dark:border-[#00AFC7] my-4">
                      <h2 className="font-black text-black text-1xl"></h2>
                      </div>
                      <p className="text-sm font-semibold text-black dark:text-[#00AFC7]">
                        {meta.description}
                      </p>

                    <div className="flex flex-row-reverse gap-3 w-full mt-4">
                      <a
                        href="https://github.com/MEvan774"
                        target="_blank"
                        className="hover:text-black transition text-black dark:text-[#00AFC7] dark:hover:text-[#00AFC7]"
                        aria-label="GitHub"
                      >
                        <Github size={28} />
                      </a>

                      <a href={`${meta.live}`} className="rounded-3xl border-2 border-black bg-[#E9EDFF] px-3 py-1 text-sm font-black text-black/80 text-center hover:bg-[#DDE3FF] transition dark:bg-black dark:border-[#00AFC7] dark:text-[#00AFC7] dark:hover:bg-[#00AFC7] dark:hover:text-black">
                        Live
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Slanted bottom with black outline */}
            <div className="absolute bottom-0 left-0 right-0">
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

          {/* TURQUOISE BACKGROUND WITH SHADER - starts after Project Overview */}
          <div className="relative bg-[#00AFC7] dark:bg-[#00AFC7]">
            {/* SHADER BACKGROUND */}
            <div className="absolute inset-0 z-0">
              <ShaderBackground />
            </div>

            {/* CONTENT */}
            <div className="relative z-10">
              <div className="flex justify-center px-4 sm:px-6 lg:px-8 py-10">
                <div className="w-full sm:max-w-2/4 max-w-6xl space-y-6">
                  {/* Technologies Card */}
                  <section className="bg-white rounded-3xl border-4 border-black shadow-[6px_6px_0_0_#000] overflow-hidden dark:bg-black dark:border-[#00AFC7]">
                    {/* Top bar */}
                    <div className="flex items-center justify-between h-12 px-4 bg-[#FFD93D] border-b-4 border-black dark:bg-[#00AFC7] dark:border-[#00AFC7]">
                      <h2 className="font-black text-black text-1xl">
                        {t("projectPage.technologies")}
                      </h2>

                      <div className="flex gap-2">
                        <span className="h-3 w-3 rounded-full bg-red-500 border-2 border-black" />
                        <span className="h-3 w-3 rounded-full bg-yellow-400 border-2 border-black" />
                        <span className="h-3 w-3 rounded-full bg-green-500 border-2 border-black" />
                      </div>
                    </div>

                    {/* Content */}
                    <div className="p-4 space-y-4">

                      <div className="w-full h-1 bg-black rounded-lg dark:bg-[#00AFC7]" />

                      <div className="flex flex-row flex-wrap gap-4 text-black dark:text-[#00AFC7]">
                        {(() => {
                          const raw = meta.technologies ?? meta.tech ?? [];
                          const techs: string[] =
                            typeof raw === "string"
                              ? raw.split(",").map((s: string) => s.trim()).filter(Boolean)
                              : Array.isArray(raw)
                              ? raw.map((s: any) => String(s).trim()).filter(Boolean)
                              : [];

                          const ICON_MAP: Record<string, { 
                            component: any; 
                            color: string 
                          }> = {
                            typescript: { component: SiTypescript, color: "#3178C6" },
                            ts: { component: SiTypescript, color: "#3178C6" },
                            react: { component: SiReact, color: "#61DAFB" },
                            "next.js": { component: SiNextdotjs, color: "#000000" },
                            nextjs: { component: SiNextdotjs, color: "#000000" },
                            next: { component: SiNextdotjs, color: "#000000" },
                            javascript: { component: SiJavascript, color: "#F7DF1E" },
                            js: { component: SiJavascript, color: "#F7DF1E" },
                            node: { component: SiNodedotjs, color: "#339933" },
                            nodejs: { component: SiNodedotjs, color: "#339933" },
                            css: { component: SiCss3, color: "#1572B6" },
                            html: { component: SiHtml5, color: "#E34F26" },
                          };

                          return techs.map((name) => {
                            const key = String(name).toLowerCase().replace(/\s+/g, '').replace(/\./g, '');
                            const lookup =
                              ICON_MAP[key] ||
                              ICON_MAP[name.toLowerCase()] ||
                              ICON_MAP[key.replace(".", "")];

                            if (lookup) {
                              const IconComponent = lookup.component;
                              return (
                                <Slab3D
                                  key={name}
                                  skillName={name}
                                  icon={<IconComponent size={128} />}
                                  color={lookup.color}
                                  size={70}
                                  rotationSpeed={0.008}
                                />
                              );
                            }

                            // Fallback: show plain slab without icon
                            return (
                              <Slab3D
                                key={name}
                                skillName={name}
                                size={70}
                                rotationSpeed={0.008}
                              />
                            );
                          });
                        })()}
                      </div>
                    </div>
                  </section>

                  {/* Code Snippet Card */}
                  <section className="bg-white rounded-3xl border-4 border-black dark:border-[#00AFC7] dark:bg-black shadow-[6px_6px_0_0_#000] overflow-hidden">
                    {/* Top bar */}
                    <div className="flex items-center justify-between h-12 px-4 bg-[#6BCB77] border-b-4 border-black dark:bg-[#00AFC7]">
                      <h2 className="font-black text-black text-1xl">
                        {t("projectPage.codeSnippet")}
                      </h2>

                      <div className="flex gap-2">
                        <span className="h-3 w-3 rounded-full bg-red-500 border-2 border-black" />
                        <span className="h-3 w-3 rounded-full bg-yellow-400 border-2 border-black" />
                        <span className="h-3 w-3 rounded-full bg-green-500 border-2 border-black" />
                      </div>
                    </div>

                    {/* Content */}
                    <article className="p-4 text-black font-black dark:text-[#00AFC7]">
                      <MDXRemote source={project.content} components={components} />
                    </article>
                  </section>
                </div>
              </div>
            </div>
          </div>
        </main>
      </>
    );
  }