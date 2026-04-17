export type Project = {
  slug: string;            // used for routing
  name: string;
  description: string;
  github: string;
  live?: string;
  image?: string;
  tech?: string[];
  category?: "software" | "gamedev";
};

export const projects: Project[] = [
  {
    slug: "project-one",
    name: "Code Exchange",
    description: "Short description of Forum.",
    github: "https://github.com/MEvan774/Forum",
    image: "/images/projects/forum/ForumLanding.png",
    tech: ["React", "Node.js", "Tailwind"],
    category: "software",
  },
  {
    slug: "project-two",
    name: "Castle Breakout",
    description: "Short description of Project Two.",
    github: "https://github.com/MEvan774/Point-and-click-game",
    image: "/images/projects/game/CoverScaled.png",
    category: "software",
  },
  {
    slug: "project-three",
    name: "Starshop",
    description: "Short description of Starshop.",
    github: "https://github.com/MEvan774/Webshop",
    image: "/images/projects/webshop/WebshopLanding.png",
    tech: ["React", "Node.js", "Tailwind"],
    category: "software",
  },
  {
  slug: "vr-grapple",
  name: "VR Grapple",
  description: "A VR grapple hook game built in Unreal Engine 4.",
  github: "",
  image: "/images/projects/vr-grapple/VRGrapple.jpg",
  tech: ["Unreal Engine 4", "Blueprints"],
  category: "gamedev",
  },
  {
  slug: "project-four",
  name: "Dungeon Gen",
  description: "Short description of Dungeon Generator.",
  github: "https://github.com/MEvan774/3DTileMap_DungeonGen",
  image: "/images/projects/dungeon/Dungeon2.png",
  tech: ["C#", "Unity"],
  category: "gamedev",
  },
    {
  slug: "project-five",
  name: "HackAndSlash",
  description: "Short description of HackAndSlash.",
  github: "https://github.com/MEvan774/2DHackAndSlash",
  image: "/images/projects/hack-and-slash/HackAndSlash1.png",
  tech: ["Unreal"],
  category: "gamedev",
  },
];
