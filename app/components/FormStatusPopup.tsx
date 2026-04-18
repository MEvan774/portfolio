"use client";

import { useEffect, useState } from "react";
import { CheckCircle2, XCircle } from "lucide-react";
import { useLanguage } from "@/app/hooks/UseLanguage";

export type FormStatus = "success" | "error" | null;

type Props = {
  status: FormStatus;
  onClose: () => void;
};

export default function FormStatusPopup({ status, onClose }: Props) {
  const { t } = useLanguage();
  const [visible, setVisible] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    if (status) {
      setMounted(true);
      const id = requestAnimationFrame(() => setVisible(true));
      return () => cancelAnimationFrame(id);
    } else {
      setVisible(false);
      const t = setTimeout(() => setMounted(false), 300);
      return () => clearTimeout(t);
    }
  }, [status]);

  useEffect(() => {
    if (!status) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [status, onClose]);

  if (!mounted) return null;

  const isSuccess = status === "success";

  const title = isSuccess ? t("footer.successTitle") : t("footer.errorTitle");
  const body = isSuccess ? t("footer.successBody") : t("footer.errorBody");

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="form-status-title"
      className={`fixed inset-0 z-[100] flex items-center justify-center px-4 transition-opacity duration-300 ease-out ${
        visible ? "opacity-100" : "opacity-0"
      }`}
    >
      <div
        onClick={onClose}
        className={`absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-300 ease-out ${
          visible ? "opacity-100" : "opacity-0"
        }`}
      />

      <div
        className={`relative w-full max-w-md transform-gpu transition-all duration-300 ${
          visible
            ? "opacity-100 translate-y-0 scale-100"
            : "opacity-0 translate-y-4 scale-95"
        }`}
        style={{
          transitionTimingFunction: "cubic-bezier(0.34, 1.56, 0.64, 1)",
        }}
      >
        <div
          className={`relative border-4 rounded-xl p-8 uppercase
            ${
              isSuccess
                ? "bg-white dark:bg-black border-black dark:border-[#00AFC7] shadow-[6px_6px_0_0_#000] dark:shadow-[6px_6px_0_0_#00AFC7]"
                : "bg-white dark:bg-black border-black dark:border-[#00AFC7] shadow-[6px_6px_0_0_#000] dark:shadow-[6px_6px_0_0_#00AFC7]"
            }`}
        >
          <div className="flex flex-col items-center text-center gap-4">
            <div
              className={`border-4 rounded-full p-3 ${
                isSuccess
                  ? "border-black dark:border-[#00AFC7] text-black dark:text-[#00AFC7]"
                  : "border-black dark:border-[#FF4D6D] text-black dark:text-[#FF4D6D]"
              }`}
            >
              {isSuccess ? <CheckCircle2 size={40} /> : <XCircle size={40} />}
            </div>

            <h3
              id="form-status-title"
              className="text-2xl font-black text-black dark:text-white"
            >
              {title}
            </h3>

            <p className="text-sm font-bold normal-case text-black dark:text-gray-200">
              {body}
            </p>

            <button
              type="button"
              onClick={onClose}
              className="mt-2 rounded-full border-4 border-black dark:border-[#00AFC7] bg-black dark:bg-white px-6 py-2.5 md:px-8 md:py-3 text-sm md:text-base font-black text-white dark:text-black shadow-[5px_5px_0_0_#00AFC7] dark:shadow-[5px_5px_0_0_#00AFC7] hover:translate-x-[-3px] hover:translate-y-[-3px] hover:shadow-[8px_8px_0_0_#00AFC7] dark:hover:shadow-[8px_8px_0_0_#00AFC7] transition-all uppercase tracking-wider whitespace-nowrap"
            >
              {t("footer.popupClose")}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
