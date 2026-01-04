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
    name: "Project One",
    description: "Short description of Project One.",
    github: "https://github.com/yourname/project-one",
    image: "/images/projects/project-one.jpg",
    tech: ["React", "Node.js", "Tailwind"],
  },
  {
    slug: "project-two",
    name: "Project Two",
    description: "Short description of Project Two.",
    github: "https://github.com/yourname/project-two",
  },
];
