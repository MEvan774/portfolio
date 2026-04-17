// app/layout.tsx - UPDATED VERSION
import type { Metadata } from "next";
import { Geist, Geist_Mono, Crimson_Text, Archivo} from "next/font/google";
import "./globals.css";
import Footer from "./components/Footer";
import Navbar from "./components/Navbar";
import { ThemeProvider } from "./hooks/UseTheme";
import I18nProvider from "./components/I18nProvider";
import { IBM_Plex_Mono } from "next/font/google";
import DarkModeToggle3D from "./components/DarkModeToggle3D";
import { TransitionProvider } from "./context/TransitionContext";
import TransitionCanvasWrapper from "./components/TransitionCanvasWrapper";
import TransitionLoadingSpinner from "./components/TransitionLoadingSpinner";

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

const archivo = Archivo({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-archivo",
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
      <body className={`${archivo.className} antialiased has-fixed-navbar`}>
        <ThemeProvider>
          <I18nProvider>
            <TransitionProvider
              defaultConfig={{
                dotColor: [0, 0, 0],
                spacing: 25,
                dotSize: 1.0,
                speed: 600,
              }}
            >
              {/* Transition Canvas */}
              <TransitionCanvasWrapper />
                <TransitionLoadingSpinner />

                  <Navbar />
              {children}
              <Footer />
            </TransitionProvider>
            <DarkModeToggle3D />
          </I18nProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}