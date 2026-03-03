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
    name: "Code Exchange",
    description: "Short description of Forum.",
    github: "https://github.com/MEvan774/Forum",
    image: "/images/projects/forum/ForumLanding.png",
    tech: ["React", "Node.js", "Tailwind"],
  },
  {
    slug: "project-two",
    name: "Kidnapped: Castle Breakout",
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
