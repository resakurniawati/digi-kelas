import { notFound } from "next/navigation";
import ClientPostTestPage from "./client-page";
import { QuizData } from "@/types/quiz";
import fs from "fs";
import path from "path";

export default async function PostTestPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  let postTestData: QuizData;
  try {
    const dataPath = path.join(
      process.cwd(),
      "src",
      "data",
      "materials",
      slug,
      "posttest.json"
    );
    
    if (!fs.existsSync(dataPath)) {
      notFound();
    }
    
    const fileContent = fs.readFileSync(dataPath, "utf-8");
    postTestData = JSON.parse(fileContent) as QuizData;
  } catch (error) {
    console.error("Error loading post-test data:", error);
    notFound();
  }

  return <ClientPostTestPage data={postTestData} slug={slug} />;
}
