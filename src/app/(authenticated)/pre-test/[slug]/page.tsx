import fs from "fs/promises";
import path from "path";
import Link from "next/link";
import ClientPreTest from "./client-page";
import { Question } from "@/types/question";

export default async function PreTestPage({
  params,
}: {
  params: { slug: string };
}) {
  // In Next.js 15, params must be awaited if treating them as a promise, but in Next 14/15 RSC,
  // we can also destructure. Let's safely access slug.
  const { slug } = await params;

  let clientQuestions = null;

  try {
    const filePath = path.join(
      process.cwd(),
      "src/data/materials",
      slug,
      "pre-test.json",
    );
    const fileContents = await fs.readFile(filePath, "utf8");
    clientQuestions = JSON.parse(fileContents);
  } catch (error) {
    // If file doesn't exist or parsing fails, clientQuestions remains null
  }

  if (!clientQuestions) {
    return (
      <main className="relative z-10 flex w-full max-w-4xl flex-1 flex-col gap-5 items-center justify-center py-20">
        <p className="text-xl font-bold text-gray-500">
          Data pre-test belum tersedia untuk materi ini.
        </p>
        <Link href="/" className="mt-4 text-primary hover:underline font-bold">
          Kembali ke Beranda
        </Link>
      </main>
    );
  }

  return <ClientPreTest slug={slug} questions={clientQuestions} />;
}
