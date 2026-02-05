"use client";
import { Github, Linkedin, Mail } from "lucide-react";
import { sendEmail } from "../components/actions/sendEmail";
import SubmitButton from "../components/SubmitButton";
import ScrollToTopButton from "./ScrollToTopButton";
import { useLanguage } from "@/app/hooks/UseLanguage";

export default function Footer() {
  const { t } = useLanguage();

  return (
    <footer className="bg-black text-[#00AFC7] border-t-4 border-[#77cdff]">
      <div className="py-24">
        <div className="flex flex-col gap-16 md:flex-row md:justify-between w-full max-w-2/4 mx-auto items-center">

          {/* Left: Contact Links */}
          <div>
            {/* Contact heading with lines */}
            <div className="flex items-center gap-4 mb-6">
              <div className="h-[3px] w-16 bg-[#00AFC7]"></div>
              <h2 className="text-3xl font-semibold text-[#00AFC7] whitespace-nowrap">
                {t("footer.contacts")}
              </h2>
              <div className="h-[3px] w-16 bg-[#00AFC7]"></div>
            </div>

            <div className="flex items-center items-center gap-6 text-black text-[#00AFC7]">
              <a
                href="https://nl.linkedin.com/in/milan-breuren-04223a1a5"
                target="_blank"
                className="text-[#00AFC7] hover:text-[#00AFC7] transition"
                aria-label="LinkedIn"
              >
                <Linkedin size={28} />
              </a>

              <a
                href="https://github.com/MEvan774"
                target="_blank"
                className="text-[#00AFC7] hover:text-[#00AFC7] transition"
                aria-label="GitHub"
              >
                <Github size={28} />
              </a>

              <a
                href="mailto:milanevanbreuren@gmail.com"
                className="text-[#00AFC7] hover:text-[#00AFC7] transition"
                aria-label="Email"
              >
                <Mail size={28} />
              </a>
            </div>
          </div>

          {/* Right: Contact Form */}
          <div className="border-4 border-[#00AFC7] bg-black text-[#00AFC7] rounded-xl p-9 shadow-[4px_4px_0_0_#000] w-[340px]">
              <h3 className="mb-6 text-2xl font-bold">
                {t("footer.form")}
              </h3>

              <form action={sendEmail} className="space-y-5">
                <div>
                  <label className="mb-1 block text-sm font-bold text-[#00AFC7]">
                    {t("footer.name")}
                  </label>
                  <input
                    name="name"
                    type="text"
                    required
                    placeholder={t("footer.namePlaceholder")}
                    className="w-full border-2 rounded-xl px-3 py-2 outline-none focus:ring-2 focus:ring-[#00AFC7] text-[#00AFC7] border-[#00AFC7] bg-black"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-sm font-bold text-[#00AFC7]">
                    {t("footer.email")}
                  </label>
                  <input
                    name="email"
                    type="email"
                    required
                    placeholder={t("footer.emailPlaceholder")}
                    className="w-full border-2 rounded-xl px-3 py-2 outline-none focus:ring-2 focus:ring-[#00AFC7] text-[#00AFC7] border-[#00AFC7] bg-black"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-sm font-bold text-[#00AFC7]">
                    {t("footer.message")}
                  </label>
                  <textarea
                    name="message"
                    rows={4}
                    required
                    placeholder={t("footer.messagePlaceholder")}
                    className="w-full border-2 rounded-xl px-3 py-2 outline-none focus:ring-2 focus:ring-[#00AFC7] text-[#00AFC7] border-[#00AFC7] bg-black"
                  />
                </div>

                <SubmitButton />
              </form>

            </div>
          </div>
<div className="flex justify-center">
  <ScrollToTopButton />
</div>
        </div>
    </footer>
  );
}