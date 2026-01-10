"use client";
import { Github, Linkedin, Mail } from "lucide-react";
import { sendEmail } from "../components/actions/sendEmail";
import SubmitButton from "../components/SubmitButton";
import ScrollToTopButton from "./ScrollToTopButton";
import { useLanguage } from "@/app/hooks/UseLanguage";

export default function Footer() {
  const { t } = useLanguage();

  return (
    <footer className="bg-[#DDE3FF] dark:bg-black text-black border-t-4 border-black dark:border-[#00AFC7]">
      <div className="py-24">
        <div className="flex flex-col gap-16 md:flex-row md:justify-between w-full max-w-2/4 mx-auto items-center">

          {/* Left: Contact Links */}
          <div>
            <h2 className="mb-6 text-3xl font-semibold dark:text-[#00AFC7]">{t("footer.contacts")}</h2>
            <div className="flex items-center gap-6 text-black dark:text-[#00AFC7]">
              <a
                href="https://nl.linkedin.com/in/milan-breuren-04223a1a5"
                target="_blank"
                className="dark:text-[#00AFC7] dark:hover:text-[#00AFC7] hover:text-black transition"
                aria-label="LinkedIn"
              >
                <Linkedin size={28} />
              </a>

              <a
                href="https://github.com/MEvan774"
                target="_blank"
                className="dark:text-[#00AFC7] dark:hover:text-[#00AFC7] hover:text-black transition"
                aria-label="GitHub"
              >
                <Github size={28} />
              </a>

              <a
                href="mailto:milanevanbreuren@gmail.com"
                className="dark:text-[#00AFC7] dark:hover:text-[#00AFC7] hover:text-black transition"
                aria-label="Email"
              >
                <Mail size={28} />
              </a>
            </div>
          </div>

          {/* Right: Contact Form */}
          <div className="text-black border-4 border-black dark:border-[#00AFC7] dark:bg-black dark:text-[#00AFC7] rounded-xl bg-white p-9 shadow-[4px_4px_0_0_#000] w-[340px]">
              <h3 className="mb-6 text-2xl font-bold">
                {t("footer.form")}
              </h3>

              <form action={sendEmail} className="space-y-5">
                <div>
                  <label className="mb-1 block text-sm text-black font-bold dark:text-[#00AFC7]">
                    {t("footer.name")}
                  </label>
                  <input
                    name="name"
                    type="text"
                    required
                    placeholder={t("footer.namePlaceholder")}
                    className="w-full border-2 border-black rounded-xl bg-white px-3 py-2 text-black outline-none focus:ring-2 focus:ring-black dark:focus:ring-[#00AFC7] dark:text-[#00AFC7] dark:border-[#00AFC7] dark:bg-black"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-sm text-black font-bold dark:text-[#00AFC7]">
                    {t("footer.email")}
                  </label>
                  <input
                    name="email"
                    type="email"
                    required
                    placeholder={t("footer.emailPlaceholder")}
                    className="w-full border-2 border-black rounded-xl bg-white px-3 py-2 text-black outline-none focus:ring-2 focus:ring-black dark:focus:ring-[#00AFC7] dark:text-[#00AFC7] dark:border-[#00AFC7] dark:bg-black"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-sm text-black font-bold dark:text-[#00AFC7]">
                    {t("footer.message")}
                  </label>
                  <textarea
                    name="message"
                    rows={4}
                    required
                    placeholder={t("footer.messagePlaceholder")}
                    className="w-full border-2 border-black rounded-xl bg-white px-3 py-2 text-black outline-none focus:ring-2 focus:ring-black dark:focus:ring-[#00AFC7] dark:text-[#00AFC7] dark:border-[#00AFC7] dark:bg-black"
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
