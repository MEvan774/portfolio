import { Github, Linkedin, Mail } from "lucide-react";
import { sendEmail } from "../components/actions/sendEmail";
import SubmitButton from "../components/SubmitButton";

export default function Footer() {
  return (
    <footer className="bg-[#1c1c1c] text-white">
      <div className="py-24">
        <div className="flex flex-col gap-16 md:flex-row md:justify-between w-full max-w-2/4 mx-auto items-center">

          {/* Left: Contact Links */}
          <div>
            <h2 className="mb-6 text-3xl font-semibold">Contacts</h2>
            <div className="flex items-center gap-6 text-white/80">
              <a
                href="https://nl.linkedin.com/in/milan-breuren-04223a1a5"
                target="_blank"
                className="hover:text-white transition"
                aria-label="LinkedIn"
              >
                <Linkedin size={28} />
              </a>

              <a
                href="https://github.com/MEvan774"
                target="_blank"
                className="hover:text-white transition"
                aria-label="GitHub"
              >
                <Github size={28} />
              </a>

              <a
                href="mailto:milanevanbreuren@gmail.com"
                className="hover:text-white transition"
                aria-label="Email"
              >
                <Mail size={28} />
              </a>
            </div>
          </div>

          {/* Right: Contact Form */}
          <div className="rounded-xl bg-gradient-to-br from-[#1C2594] to-[#5BCAF3] p-0.5 shadow-lg w-[340px]">
            <div className="h-full w-full bg-gray-900 rounded-xl p-9">
              <h3 className="mb-6 text-2xl font-semibold">
                Let’s get in touch!
              </h3>

              <form action={sendEmail} className="space-y-5">
                <div>
                  <label className="mb-1 block text-sm text-white/70">
                    Name
                  </label>
                  <input
                    name="name"
                    type="text"
                    required
                    placeholder="Enter your name..."
                    className="w-full rounded-md bg-white px-3 py-2 text-black outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-sm text-white/70">
                    Email
                  </label>
                  <input
                    name="email"
                    type="email"
                    required
                    placeholder="Enter your email..."
                    className="w-full rounded-md bg-white px-3 py-2 text-black outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-sm text-white/70">
                    Message
                  </label>
                  <textarea
                    name="message"
                    rows={4}
                    required
                    placeholder="Enter your message..."
                    className="w-full rounded-md bg-white px-3 py-2 text-black outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <SubmitButton />
              </form>

            </div>
          </div>

        </div>
      </div>
    </footer>
  );
}
