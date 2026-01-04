import fs from "fs";
import path from "path";
import matter from "gray-matter";

const CONTENT_PROJECTS = path.join(process.cwd(), "content/projects");
const LEGACY_PROJECTS = path.join(process.cwd(), "projects");

// prefer content/projects, fallback to projects
function resolveProjectsPath() {
  if (fs.existsSync(CONTENT_PROJECTS)) return CONTENT_PROJECTS;
  if (fs.existsSync(LEGACY_PROJECTS)) return LEGACY_PROJECTS;
  return CONTENT_PROJECTS; // default location
}

export type ProjectMeta = {
  slug: string;
  title: string;
  description?: string;
  github?: string;
  image?: string;
};

export function getAllProjects(): ProjectMeta[] {
  const PROJECTS_PATH = resolveProjectsPath();
  if (!fs.existsSync(PROJECTS_PATH)) return [];

  const files = fs.readdirSync(PROJECTS_PATH);
  return files
    .filter((f) => f.endsWith(".mdx"))
    .map((filename) => {
      const slug = filename.replace(/\.mdx$/, "");
      const filePath = path.join(PROJECTS_PATH, filename);
      const source = fs.readFileSync(filePath, "utf8");
      const { data } = matter(source);
      return {
        slug,
        title: data.title,
        description: data.description,
        github: data.github,
        image: data.image,
        code: data.code,
      };
    });
}

export function getProjectBySlug(slug: string) {
  if (!slug) throw new Error("getProjectBySlug called with empty slug");
  const PROJECTS_PATH = resolveProjectsPath();
  const filePath = path.join(PROJECTS_PATH, `${slug}.mdx`);
  if (!fs.existsSync(filePath)) {
    throw new Error(`Project not found: ${filePath}`);
  }
  const source = fs.readFileSync(filePath, "utf8");
  return matter(source);
}
