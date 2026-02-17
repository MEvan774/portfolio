"use client";

import { useState } from "react";
import { SiTypescript, SiReact, SiNextdotjs, SiHtml5, SiCss3, SiJavascript, SiNodedotjs } from "react-icons/si";
import { useLanguage } from "@/app/hooks/UseLanguage";
import Slab3D from "./Slab3D";

const SKILLS = [
  {
    label: "HTML",
    icon: <SiHtml5 size={34} />,
    color: "#E34F26",
    categories: ["frontend"],
  },
  {
    label: "CSS",
    icon: <SiCss3 size={34} />,
    color: "#1572B6",
    categories: ["frontend"],
  },
  {
    label: "JavaScript",
    icon: <SiJavascript size={34} />,
    color: "#F7DF1E",
    categories: ["frontend", "backend"],
  },
  {
    label: "React",
    icon: <SiReact size={34} />,
    color: "#61DAFB",
    categories: ["frontend"],
  },
  {
    label: "Node.js",
    icon: <SiNodedotjs size={34} />,
    color: "#339933",
    categories: ["backend"],
  },
  {
    label: "Typescript",
    icon: <SiTypescript size={34} />,
    color: "#3178C6",
    categories: ["backend", "software"],
  },
];

export default function SkillsSection() {
  const { t } = useLanguage();
  const [filter, setFilter] = useState("all");

  const filteredSkills =
    filter === "all"
      ? SKILLS
      : SKILLS.filter((skill) =>
          skill.categories.includes(filter)
        );

  return (
    <section className="bg-white dark:border-black dark:bg-black rounded-2xl border-4 border-black shadow-[6px_6px_0_0_#000] overflow-hidden flex flex-col h-96 md:h-120">
      {/* Top bar */}
      <div className="relative flex items-center justify-between h-12 bg-[#00AFC7] border-b-4 border-black">
        <div className="relative flex items-center">
          {/* Title block */}
          <h2
            className="
              relative z-10
              font-black text-lg uppercase
              text-[#00AFC7]
              bg-black
              px-4
              h-12
              flex items-center
            "
          >
            {t("landingPage.skills")}
          </h2>

          {/* Angled edge */}
          <span
            className="
              absolute right-[-15px] top-0 h-full w-4
              bg-black
            "
            style={{
              clipPath: "polygon(0% 0%, 0% 100%, 44% 100%, 95% 0%)",
            }}
          />
        </div>

        {/* Dropdown */}
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="
            h-8
            w-44
            rounded-xl
            border-2 border-black
            dark:border-[#00AFC7]
            bg-[#E9EDFF]
            dark:bg-black
            dark:text-white
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
          <option value="all">{t("landingPage.dropdown")}</option>
          <option value="software">Software engineer</option>
          <option value="frontend">Frontend</option>
          <option value="backend">Backend</option>
        </select>

        {/* Window dots */}
        <div className="flex gap-2">
          <span className="h-3 w-3 rounded-full bg-red-500 border-2 border-black" />
          <span className="h-3 w-3 rounded-full bg-yellow-400 border-2 border-black" />
          <span className="h-3 w-3 rounded-full bg-green-500 border-2 border-black mr-4" />
        </div>
      </div>

      {/* Content with 3D Slabs */}
      <div className="flex-1 overflow-y-scroll p-4 pr-2 scrollbar-gutter-stable">
        <ul className="flex flex-col gap-6">
          {filteredSkills.map((skill) => (
            <li
              key={skill.label}
              className="flex items-center gap-4 font-bold text-black dark:text-[#00AFC7]"
            >
              <Slab3D 
                skillName={skill.label}
                icon={skill.icon}
                color={skill.color}
                size={75}
                rotationSpeed={0.005}
              />
              <span className="text-lg">{skill.label}</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}