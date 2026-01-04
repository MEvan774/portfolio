import { Github, Linkedin, Mail } from "lucide-react";
import { sendEmail } from "../components/actions/sendEmail";
import SubmitButton from "../components/SubmitButton";

export default function Footer() {
  return (
    <footer className="bg-[#DDE3FF] text-black border-t-4 border-black">
      <div className="py-24">
        <div className="flex flex-col gap-16 md:flex-row md:justify-between w-full max-w-2/4 mx-auto items-center">

          {/* Left: Contact Links */}
          <div>
            <h2 className="mb-6 text-3xl font-semibold">Contacts</h2>
            <div className="flex items-center gap-6 text-black">
              <a
                href="https://nl.linkedin.com/in/milan-breuren-04223a1a5"
                target="_blank"
                className="hover:text-black transition"
                aria-label="LinkedIn"
              >
                <Linkedin size={28} />
              </a>

              <a
                href="https://github.com/MEvan774"
                target="_blank"
                className="hover:text-black transition"
                aria-label="GitHub"
              >
                <Github size={28} />
              </a>

              <a
                href="mailto:milanevanbreuren@gmail.com"
                className="hover:text-black transition"
                aria-label="Email"
              >
                <Mail size={28} />
              </a>
            </div>
          </div>

          {/* Right: Contact Form */}
          <div className="text-black border-4 border-black rounded-xl bg-white p-9 shadow-[4px_4px_0_0_#000] w-[340px]">
              <h3 className="mb-6 text-2xl font-bold">
                Let’s get in touch!
              </h3>

              <form action={sendEmail} className="space-y-5">
                <div>
                  <label className="mb-1 block text-sm text-black font-bold">
                    Name
                  </label>
                  <input
                    name="name"
                    type="text"
                    required
                    placeholder="Enter your name..."
                    className="w-full border-2 border-black rounded-xl bg-white px-3 py-2 text-black outline-none focus:ring-2 focus:ring-black"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-sm text-black font-bold">
                    Email
                  </label>
                  <input
                    name="email"
                    type="email"
                    required
                    placeholder="Enter your email..."
                    className="w-full border-2 border-black rounded-xl bg-white px-3 py-2 text-black outline-none focus:ring-2 focus:ring-black"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-sm text-black font-bold">
                    Message
                  </label>
                  <textarea
                    name="message"
                    rows={4}
                    required
                    placeholder="Enter your message..."
                    className="w-full border-2 border-black rounded-xl bg-white px-3 py-2 text-black outline-none focus:ring-2 focus:ring-black"
                  />
                </div>

                <SubmitButton />
              </form>

            </div>
          </div>

        </div>
    </footer>
  );
}
