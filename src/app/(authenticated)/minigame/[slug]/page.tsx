import fs from "fs/promises";
import path from "path";
import Link from "next/link";
import ClientMinigamePage from "./client-page";
import type { Minigame } from "@/types/minigame";

export default async function MinigamePage({
  params,
}: {
  params: { slug: string };
}) {
  const { slug } = await params;

  let minigameData: Minigame | null = null;
  try {
    const filePath = path.join(
      process.cwd(),
      "src/data/materials",
      slug,
      "minigame.json",
    );
    const fileContents = await fs.readFile(filePath, "utf8");
    minigameData = JSON.parse(fileContents);
  } catch (error) {
    // If file doesn't exist or parsing fails
  }

  if (!minigameData) {
    return (
      <main className="relative z-10 flex w-full max-w-4xl flex-1 flex-col gap-5 items-center justify-center py-20">
        <p className="text-xl font-bold text-gray-500">
          Mini Game belum tersedia untuk materi ini.
        </p>
        <Link href="/" className="mt-4 text-primary hover:underline font-bold">
          Kembali ke Beranda
        </Link>
      </main>
    );
  }

  return <ClientMinigamePage data={minigameData} slug={slug} />;
}
