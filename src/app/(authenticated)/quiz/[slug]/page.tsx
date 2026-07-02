import fs from "fs";
import path from "path";
import { notFound } from "next/navigation";
import { QuizData } from "@/types/quiz";
import ClientQuizPage from "./client-page";

export default async function QuizPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  let data: QuizData;
  try {
    const filePath = path.join(
      process.cwd(),
      "src",
      "data",
      "materials",
      slug,
      "quiz.json"
    );

    const fileContents = fs.readFileSync(filePath, "utf8");
    data = JSON.parse(fileContents) as QuizData;
  } catch (error) {
    console.error("Error reading quiz data:", error);
    notFound();
  }

  return <ClientQuizPage data={data} slug={slug} />;
}
