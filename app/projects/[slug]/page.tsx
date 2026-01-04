import { getProjectBySlug } from "@/app/lib/mdx";
import { Github } from "lucide-react";
import { notFound } from "next/navigation";
import { SiTypescript, SiReact, SiNextdotjs } from "react-icons/si";
import CodeBlock from "../../components/codeBlock";
import { MDXRemote } from "next-mdx-remote/rsc";

type Props = { params: Promise<{ slug: string }> | { slug: string } };

const components = {
  pre: CodeBlock,
};


export default async function ProjectPage({ params }: Props) {
  const resolved = await params; // <- important for Turbopack / latest App Router
  const slug = resolved?.slug;
  if (!slug) return notFound();

  try {
    const project = getProjectBySlug(slug);
    const meta = project.data;
    return (
<main className="flex justify-center transition-colors bg-gray-50 text-gray-900 dark:bg-gray-900 dark:text-gray-100">
      <div className="w-full max-w-2/4 space-y-6 py-10">

        {/* About Me Card */}
        <section className="rounded-lg bg-[#1c1c1c] p-4 shadow-md">
          <div >
            <h1 className="mb-3 text-sm font-semibold text-white/80 w-80 h-10">
              {meta.title}
            </h1>

            <div>
              {/* Text */}
              <div className="bg-white w-full h-80">
              </div>

            </div>
          </div>

          {/* CV Button */}
          <div className="flex flex-row-reverse gap-2 w-full mt-4">

                        <a
                          href="https://github.com/MEvan774"
                          target="_blank"
                          className="hover:text-white transition text-white/80"
                          aria-label="GitHub"
                          >
                          <Github size={28} />
                        </a>
          <button className="rounded bg-[#2a2a2a] px-3 py-1 text-xs text-white/80 hover:bg-[#333] transition">
            Live
          </button>
                          </div>
        </section>

        {/* Skills Card */}
        <section className="rounded-lg bg-[#1c1c1c] p-4 shadow-md">
          <p className="mb-3 text-sm font-semibold text-white/80">
            {meta.description}
          </p>
          <h1 className="mb-3 text-sm font-semibold text-white/80">Technologies</h1>
          <div className="h-[2px] w-full bg-white mb-5">
                      </div>
          <div className="flex flex-row gap-2 text-sm text-white/60">
            {/* icons or labels */}
            <span><SiTypescript size={42} /></span>
            <span><SiReact size={42} /></span>
            <span><SiNextdotjs size={42} /></span>


          </div>
        </section>

<section className="rounded-lg bg-[#1c1c1c] p-4 shadow-md">
  <h1 className="mb-3 text-sm font-semibold text-white/80">Code snippet</h1>
  <article className="text-white">
    <MDXRemote
      source={project.content}
      components={components}
    />
</article>
</section>


      </div>
    </main>
    );
  } catch (err) {
    console.error("Project load error:", err);
    return notFound();
  }
}

