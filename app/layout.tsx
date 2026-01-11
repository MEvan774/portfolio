import type { Metadata } from "next";
import { Geist, Geist_Mono, Crimson_Text } from "next/font/google";
import "./globals.css";
import Footer from "./components/Footer";
import Navbar from "./components/Navbar";
import { ThemeProvider } from "./hooks/UseTheme";
import I18nProvider from "./components/I18nProvider";
import { IBM_Plex_Mono } from "next/font/google";
import DarkModeToggle3D from "./components/DarkModeToggle3D";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const crimsonText = Crimson_Text({
  variable: "--font-crimson-text",
  subsets: ["latin"],
  weight: ["400", "600", "700"],
});

const ibmPlexMono = IBM_Plex_Mono({
  variable: "--font-ibm-plex-mono",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Portfolio website Milan Breuren",
  description: "A portfolio website showcasing the work of Milan Breuren.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${ibmPlexMono.className} antialiased has-fixed-navbar`}>
        <ThemeProvider>
          <I18nProvider>
            <header className="fixed inset-x-0 z-50" style={{ top: "var(--navbar-top-gap)" }}>
              <div className="mx-auto w-full w-full"> {/* container for centering */}
                <Navbar />
              </div>
            </header>
            <DarkModeToggle3D modelPath="/models/LowPolyMonitor.glb" />
            {children}
            <Footer />
          </I18nProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
