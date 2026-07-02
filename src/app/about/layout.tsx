import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Tentang",
  description: "Interactive E-Learning Web App",
};

export default function AboutLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}
