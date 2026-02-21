export type Project = {
  slug: string;            // used for routing
  name: string;
  description: string;
  github: string;
  live?: string;
  image?: string;
  tech?: string[];
};

export const projects: Project[] = [
  {
    slug: "project-one",
    name: "Forum",
    description: "Short description of Forum.",
    github: "https://github.com/MEvan774/Forum",
    image: "/images/projects/forum/ForumLanding.png",
    tech: ["React", "Node.js", "Tailwind"],
  },
  {
    slug: "project-two",
    name: "Project Two",
    description: "Short description of Project Two.",
    github: "https://github.com/yourname/project-two",
  },
];
