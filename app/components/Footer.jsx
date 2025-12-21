import { Github, Linkedin, Mail } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-[#1c1c1c] text-white">
      <div className="mx-auto max-w-screen-2xl px-6 py-24 md:px-10">
        <div className="grid grid-cols-1 gap-16 md:grid-cols-2 items-center">
          
          {/* Left: Contact Links */}
          <div className="mx-auto">
            <h2 className="mb-6 text-3xl font-semibold">Contacts</h2>
            <div className="flex items-center gap-6 text-white/80">
              <a
                href="https://linkedin.com"
                target="_blank"
                className="hover:text-white transition"
                aria-label="LinkedIn"
              >
                <Linkedin size={28} />
              </a>

              <a
                href="https://github.com"
                target="_blank"
                className="hover:text-white transition"
                aria-label="GitHub"
              >
                <Github size={28} />
              </a>

              <a
                href="mailto:you@email.com"
                className="hover:text-white transition"
                aria-label="Email"
              >
                <Mail size={28} />
              </a>
            </div>
          </div>

          {/* Right: Contact Form */}
          <div className="rounded-xl bg-gradient-to-br from-[#1C2594] to-[#5BCAF3] p-0.5 shadow-lg w-[340] mx-auto">
                        <div class=" h-full w-full bg-gray-900 rounded-xl p-9">
            <h3 className="mb-6 text-2xl font-semibold ">
              Let’s get in touch!
            </h3>

            <form className="space-y-5">
              <div>
                <label className="mb-1 block text-sm text-white/70">
                  Name
                </label>
                <input
                  type="text"
                  placeholder="Enter your name..."
                  className="w-full rounded-md bg-white px-3 py-2 text-black outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm text-white/70">
                  Email
                </label>
                <input
                  type="email"
                  placeholder="Enter your email..."
                  className="w-full rounded-md bg-white px-3 py-2 text-black outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm text-white/70">
                  Message
                </label>
                <textarea
                  placeholder="Enter your message..."
                  rows={4}
                  className="w-full rounded-md bg-white px-3 py-2 text-black outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </form>
          </div>
        </div>
        </div>
      </div>
    </footer>
  );
}
