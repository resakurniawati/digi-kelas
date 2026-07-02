import fs from "fs/promises";
import path from "path";
import Link from "next/link";
import ClientLkpdPage from "./client-page";
import type { Lkpd } from "@/types/lkpd";

export default async function LkpdPage({
  params,
}: {
  params: { slug: string };
}) {
  const { slug } = await params;

  let lkpdList: Lkpd[] = [];
  try {
    const filePath = path.join(
      process.cwd(),
      "src/data/materials",
      slug,
      "lkpd.json",
    );
    const fileContents = await fs.readFile(filePath, "utf8");
    lkpdList = JSON.parse(fileContents);
  } catch (error) {
    // If file doesn't exist or parsing fails, lkpdList remains empty
  }

  if (!lkpdList || lkpdList.length === 0) {
    return (
      <main className="relative z-10 flex w-full max-w-4xl flex-1 flex-col gap-5 items-center justify-center py-20">
        <p className="text-xl font-bold text-gray-500">
          Data LKPD belum tersedia untuk materi ini.
        </p>
        <Link href="/" className="mt-4 text-primary hover:underline font-bold">
          Kembali ke Beranda
        </Link>
      </main>
    );
  }

  return <ClientLkpdPage lkpdList={lkpdList} slug={slug} />;
}
