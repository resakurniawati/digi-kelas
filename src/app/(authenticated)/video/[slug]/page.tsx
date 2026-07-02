import fs from "fs/promises";
import path from "path";
import Link from "next/link";
import ClientVideoPage from "./client-page";
import materials from "../../../../../public/assets/material-data.json";

export default async function VideoPage({
  params,
}: {
  params: { slug: string };
}) {
  const { slug } = await params;
  
  const material = materials.find((m) => m.slug === slug);

  let videos = [];
  try {
    const filePath = path.join(
      process.cwd(),
      "src/data/materials",
      slug,
      "video.json",
    );
    const fileContents = await fs.readFile(filePath, "utf8");
    videos = JSON.parse(fileContents);
  } catch (error) {
    // If file doesn't exist or parsing fails, videos remains empty
  }

  if (!videos || videos.length === 0) {
    return (
      <main className="relative z-10 flex w-full max-w-4xl flex-1 flex-col gap-5 items-center justify-center py-20">
        <p className="text-xl font-bold text-gray-500">
          Data video belum tersedia untuk materi ini.
        </p>
        <Link href="/" className="mt-4 text-primary hover:underline font-bold">
          Kembali ke Beranda
        </Link>
      </main>
    );
  }

  return (
    <ClientVideoPage 
      videos={videos} 
      materialTitle={material ? material.title : "Materi"} 
      slug={slug}
    />
  );
}
