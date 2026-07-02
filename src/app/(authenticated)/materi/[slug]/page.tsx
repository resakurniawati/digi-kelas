import fs from "fs/promises";
import path from "path";
import Link from "next/link";
import ClientMateriPage from "./client-page";
import materials from "../../../../../public/assets/material-data.json";

export default async function MateriPage({
  params,
}: {
  params: { slug: string };
}) {
  const { slug } = await params;
  
  const material = materials.find((m) => m.slug === slug);

  let pdfUrl = "";
  try {
    const filePath = path.join(
      process.cwd(),
      "src/data/materials",
      slug,
      "emodul.json",
    );
    const fileContents = await fs.readFile(filePath, "utf8");
    const data = JSON.parse(fileContents);
    pdfUrl = data.pdfUrl;
  } catch (error) {
    // If file doesn't exist or parsing fails, pdfUrl remains empty
  }

  if (!pdfUrl) {
    return (
      <main className="relative z-10 flex w-full max-w-4xl flex-1 flex-col gap-5 items-center justify-center py-20">
        <p className="text-xl font-bold text-gray-500">
          Data e-modul belum tersedia untuk materi ini.
        </p>
        <Link href="/" className="mt-4 text-primary hover:underline font-bold">
          Kembali ke Beranda
        </Link>
      </main>
    );
  }

  return (
    <ClientMateriPage 
      slug={slug} 
      materialTitle={material ? material.title : "Materi"} 
      pdfUrl={pdfUrl}
    />
  );
}
