import type { Metadata } from "next";
import { Quicksand } from "next/font/google";
import "./globals.css";
import BgDecoration from "@/components/bg-decoration";
import { SpeedInsights } from "@vercel/speed-insights/next";

const quicksand = Quicksand({
  variable: "--font-quicksand",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "DigiKelas - Platform Belajar",
    template: `%s | DigiKelas`,
  },
  description: "Interactive E-Learning Web App",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${quicksand.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">
        <div className="min-h-150 flex-1 flex flex-col items-center justify-center p-6 sm:p-12 relative overflow-hidden">
          <BgDecoration />
          {children}
          <SpeedInsights />
        </div>
      </body>
    </html>
  );
}
