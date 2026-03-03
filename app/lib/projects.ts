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
    name: "Point and click game",
    description: "Short description of Project Two.",
    github: "https://github.com/yourname/project-two",
    image: "/images/projects/game/CoverScaled.png",
  },
  {
    slug: "project-three",
    name: "Starshop",
    description: "Short description of Starshop.",
    github: "https://github.com/MEvan774/Webshop",
    image: "/images/projects/webshop/WebshopLanding.png",
    tech: ["React", "Node.js", "Tailwind"],
  },
];
