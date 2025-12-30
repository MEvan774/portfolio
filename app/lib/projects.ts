export type Project = {
  name: string;
  href: string;
  github: string;
  image?: string;
};

export const projects: Project[] = [
  {
    name: "Project One",
    href: "/projects/project-one",
    github: "https://github.com/yourname/project-one",
  },
  {
    name: "Project Two",
    href: "/projects/project-two",
    github: "https://github.com/yourname/project-two",
  },
];
