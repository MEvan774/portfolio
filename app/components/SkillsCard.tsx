"use client";

import { useState } from "react";
import { SiTypescript, SiReact, SiNextdotjs, SiHtml5, SiCss3, SiJavascript, SiNodedotjs} from "react-icons/si";

const SKILLS = [
  {
    label: "HTML",
    icon: <SiHtml5 size={34} />,
    categories: ["frontend"],
  },
  {
    label: "CSS",
    icon: <SiCss3 size={34} />,
    categories: ["frontend"],
  },
  {
    label: "JavaScript",
    icon: <SiJavascript size={34} />,
    categories: ["frontend", "backend"],
  },
  {
    label: "React",
    icon: <SiReact size={34} />,
    categories: ["frontend"],
  },
  {
    label: "Node.js",
    icon: <SiNodedotjs size={34} />,
    categories: ["backend"],
  },
    {
    label: "Typescript",
    icon: <SiTypescript size={34} />,
    categories: ["backend", "software"],
  },
];

export default function SkillsSection() {
  const [filter, setFilter] = useState("all");

  const filteredSkills =
    filter === "all"
      ? SKILLS
      : SKILLS.filter((skill) =>
          skill.categories.includes(filter)
        );

  return (
    <section className="bg-white rounded-3xl border-4 border-black shadow-[6px_6px_0_0_#000] overflow-hidden flex flex-col h-72 md:h-80">
      {/* Top bar */}
      <div className="flex items-center justify-between h-12 px-4 bg-[#00AFC7] border-b-4 border-black">
        {/* Title */}
        <h2 className="font-black text-lg text-black">
          Skills
        </h2>

        {/* Dropdown */}
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="
            h-8
            rounded-xl
            border-2 border-black
            bg-[#E9EDFF]
            px-3
            text-sm
            font-bold
            text-black
            outline-none
            shadow-[3px_3px_0_0_#000]
            transition
            hover:translate-x-[-1px]
            hover:translate-y-[-1px]
            hover:shadow-[4px_4px_0_0_#000]
            active:translate-x-[1px]
            active:translate-y-[1px]
            active:shadow-[1px_1px_0_0_#000]
          "
        >
            <option value="all">All</option>
            <option value="software">Software engineer</option>
            <option value="frontend">Frontend</option>
            <option value="backend">Backend</option>
        </select>

        {/* Window dots */}
        <div className="flex gap-2">
          <span className="h-3 w-3 rounded-full bg-red-500 border-2 border-black" />
          <span className="h-3 w-3 rounded-full bg-yellow-400 border-2 border-black" />
          <span className="h-3 w-3 rounded-full bg-green-500 border-2 border-black" />
        </div>
      </div>

      {/* Content */}
      <div className="p-4 flex-1 h-80"> {/* fills remaining fixed section height and scrolls */}
        <ul className="flex flex-col gap-3">
          {filteredSkills.map((skill) => (
            <li
              key={skill.label}
              className="flex items-center gap-3 font-bold text-black"
            >
              <span className="h-8 w-8 flex items-center justify-center">
                {skill.icon}
              </span>
              <span>{skill.label}</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
