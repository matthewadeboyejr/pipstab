import type { Metadata } from "next";
import { Montserrat } from "next/font/google";
import "../globals.css";

const montserrat = Montserrat({
  variable: "--font-sans",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Sign In - PipTab",
  description: "This is the sign in page for PipTab",
};

export default function LoginLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main
      className={`${montserrat.variable} antialiased bg-[#111113] min-h-screen`}
    >
      {children}
    </main>
  );
}
