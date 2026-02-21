/* eslint-disable @typescript-eslint/no-explicit-any */
import { getProjectBySlug } from "@/app/lib/mdx";
import { Github } from "lucide-react";
import { notFound } from "next/navigation";
import {
  SiTypescript,
  SiReact,
  SiNextdotjs,
  SiJavascript,
  SiNodedotjs,
  SiCss3,
  SiHtml5,
} from "react-icons/si";
import CodeBlock from "../../components/codeBlock";
import { MDXRemote } from "next-mdx-remote/rsc";
import ProjectMediaGallery from "@/app/components/ProjectMediaGallery";
import { getServerTranslations } from "../../lib/ServerTranslations";
import PageReadyNotifier from "../../components/PageReadyNotifier";
import Slab3D from "../../components/Slab3D";
import ShaderBackground from "../../components/ShaderBackground";

// ─── Types ────────────────────────────────────────────────────────────────────

type Props = {
  params: Promise<{ slug: string }> | { slug: string };
};

type MediaItem = {
  type: "image" | "video";
  src: string;
  thumbnail?: string;
};

// ─── MDX Components ───────────────────────────────────────────────────────────

const mdxComponents = { pre: CodeBlock };

// ─── Icon Map ─────────────────────────────────────────────────────────────────

const ICON_MAP: Record<string, { component: any; color: string }> = {
  typescript: { component: SiTypescript, color: "#3178C6" },
  ts:         { component: SiTypescript, color: "#3178C6" },
  react:      { component: SiReact,      color: "#61DAFB" },
  "next.js":  { component: SiNextdotjs,  color: "#000000" },
  nextjs:     { component: SiNextdotjs,  color: "#000000" },
  next:       { component: SiNextdotjs,  color: "#000000" },
  javascript: { component: SiJavascript, color: "#F7DF1E" },
  js:         { component: SiJavascript, color: "#F7DF1E" },
  node:       { component: SiNodedotjs,  color: "#339933" },
  nodejs:     { component: SiNodedotjs,  color: "#339933" },
  css:        { component: SiCss3,       color: "#1572B6" },
  html:       { component: SiHtml5,      color: "#E34F26" },
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function parseTechs(raw: any): string[] {
  if (typeof raw === "string") return raw.split(",").map((s) => s.trim()).filter(Boolean);
  if (Array.isArray(raw))      return raw.map((s) => String(s).trim()).filter(Boolean);
  return [];
}

function lookupIcon(name: string) {
  const key = name.toLowerCase().replace(/\s+/g, "").replace(/\./g, "");
  return ICON_MAP[key] ?? ICON_MAP[name.toLowerCase()] ?? null;
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function CardTopBar({ title }: { title: string }) {
  return (
    <div className="relative flex items-center justify-between h-12 bg-[#00AFC7] border-b-4 border-black dark:border-[#00AFC7]">
      <div className="relative flex items-center">
        <span className="relative z-10 font-black text-lg uppercase text-[#00AFC7] bg-black px-4 h-12 flex items-center">
          {title}
        </span>
        <span
          className="absolute right-[-15px] top-0 h-full w-4 bg-black"
          style={{ clipPath: "polygon(0% 0%, 0% 100%, 44% 100%, 95% 0%)" }}
        />
      </div>
    </div>
  );
}

function SlantedDivider() {
  return (
    <div className="absolute bottom-0 left-0 right-0">
      <svg
        className="absolute bottom-0 left-0 w-full pointer-events-none"
        style={{ height: "134px" }}
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
  );
}

function TechGrid({ raw }: { raw: any }) {
  const techs = parseTechs(raw);

  return (
    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-3">
      {techs.map((name) => {
        const match = lookupIcon(name);
        const Icon = match?.component ?? null;

        return (
          <div
            key={name}
            className="flex flex-col items-center gap-2 bg-[#E9EDFF] dark:bg-black rounded-2xl border-2 border-black dark:border-[#00AFC7] p-3 shadow-[3px_3px_0_0_#000] dark:shadow-[4px_4px_0_0_#00AFC7] transition-all hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[5px_5px_0_0_#000] dark:hover:shadow-[6px_6px_0_0_#00AFC7]"
          >
            <Slab3D
              skillName={name}
              icon={Icon ? <Icon size={128} /> : undefined}
              color={match?.color}
              size={52}
              rotationSpeed={0.008}
            />
            <span className="text-xs font-black uppercase tracking-wide text-black dark:text-[#00AFC7] text-center leading-tight">
              {name}
            </span>
          </div>
        );
      })}
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function ProjectPage({ params }: Props) {
  const { t } = await getServerTranslations();
  const { slug } = await params;

  if (!slug) return notFound();

  let project;
  let meta;
  let media: MediaItem[] = [];

  try {
    project = getProjectBySlug(slug);
    meta = project.data;
    media = Array.isArray(meta.media)
      ? meta.media.filter((m: any) => m?.src && typeof m.src === "string")
      : [];
  } catch (err) {
    console.error("Project load error:", err);
    return notFound();
  }

  return (
    <>
      <PageReadyNotifier />

      <main className="min-h-screen bg-[#E9EDFF] dark:bg-black">

        {/* ── Overview Section ─────────────────────────────────────────── */}
        <section className="bg-[#E9EDFF] dark:bg-gray-950 overflow-visible relative pb-32">
          <div className="flex justify-center px-4 sm:px-6 lg:px-8 py-10">
            <div className="w-full max-w-6xl">

              <div className="bg-white dark:bg-black rounded-3xl border-4 border-black shadow-[6px_6px_0_0_#00AFC7] overflow-hidden dark:border-[#00AFC7] dark:shadow-[6px_6px_0_0_#00AFC7]">
                <CardTopBar title={meta.title} />

                <div className="p-6">
                  {media.length > 0 && <ProjectMediaGallery items={media} />}

                  <p className="text-base font-semibold text-black dark:text-[#00AFC7] mt-4 leading-relaxed border-l-4 border-[#00AFC7] pl-4">
                    {meta.description}
                  </p>

                  <div className="flex flex-row-reverse items-center gap-3 mt-5">
                    <a
                      href="https://github.com/MEvan774"
                      target="_blank"
                      rel="noreferrer"
                      aria-label="GitHub"
                      className="
                        inline-flex
                        items-center
                        justify-center
                        rounded-3xl
                        border-4
                        border-black
                        dark:border-[#00AFC7]
                        bg-black
                        dark:bg-white
                        p-2
                        text-white
                        dark:text-black
                        shadow-[4px_4px_0_0_#00AFC7]
                        dark:shadow-[4px_4px_0_0_#00AFC7]
                        hover:translate-x-[-2px]
                        hover:translate-y-[-2px]
                        hover:shadow-[6px_6px_0_0_#00AFC7]
                        dark:hover:shadow-[6px_6px_0_0_#00AFC7]
                        transition-all
                      "
                    >
                      <Github size={24} />
                    </a>
                    <a
                      href={meta.live}
                      target="_blank"
                      rel="noreferrer"
                      className="
                        rounded-3xl
                        border-4
                        border-black
                        dark:border-[#00AFC7]
                        bg-black
                        dark:bg-white
                        px-5
                        py-2
                        text-sm
                        font-black
                        text-white
                        dark:text-black
                        shadow-[4px_4px_0_0_#00AFC7]
                        dark:shadow-[4px_4px_0_0_#00AFC7]
                        hover:translate-x-[-2px]
                        hover:translate-y-[-2px]
                        hover:shadow-[6px_6px_0_0_#00AFC7]
                        dark:hover:shadow-[6px_6px_0_0_#00AFC7]
                        transition-all
                        uppercase
                        tracking-wider
                      "
                    >
                      Live
                    </a>
                  </div>
                </div>
              </div>

            </div>
          </div>

          <SlantedDivider />
        </section>

        {/* ── Turquoise Section ────────────────────────────────────────── */}
        <div className="relative bg-[#00AFC7]">
          <div className="absolute inset-0 z-0">
            <ShaderBackground />
          </div>

          <div className="relative z-10">
            <div className="flex justify-center px-4 sm:px-6 lg:px-8 py-10">
              <div className="w-full max-w-6xl space-y-8">

                {/* Technologies - floating directly in turquoise */}
                <div>
                  <div className="inline-flex items-center bg-black border-4 border-black rounded-2xl px-4 py-2 mb-4">
                    <h2 className="font-black text-lg uppercase text-[#00AFC7] tracking-wide">
                      {t("projectPage.technologies")}
                    </h2>
                  </div>
                  <TechGrid raw={meta.technologies ?? meta.tech ?? []} />
                </div>

                {/* Code Snippet - full width card */}
                <section className="min-h-[900px] bg-white rounded-3xl border-4 border-black shadow-[6px_6px_0_0_#000] overflow-hidden dark:bg-black dark:border-[#00AFC7] dark:shadow-[6px_6px_0_0_#00AFC7]">
                  <CardTopBar title={t("projectPage.codeSnippet")} />
                  <article className="p-4 text-black font-black dark:text-[#00AFC7] max-h-[900px] overflow-y-auto">
                    <MDXRemote source={project.content} components={mdxComponents} />
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