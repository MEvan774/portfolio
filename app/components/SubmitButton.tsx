"use client";

import { useFormStatus } from "react-dom";

export default function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="w-full border-2 border-black rounded-3xl bg-[#00AFC7] py-2 font-medium text-black transition
                 hover:bg-[#1380c8] disabled:cursor-not-allowed disabled:opacity-60"
    >
      {pending ? "Sending..." : "Send message"}
    </button>
  );
}
