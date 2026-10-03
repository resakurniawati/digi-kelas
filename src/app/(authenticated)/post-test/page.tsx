import { notFound } from "next/navigation";
import ClientPostTestPage from "./client-page";
import { QuizData } from "@/types/quiz";
import fs from "fs";
import path from "path";

export default function PostTestPage() {
  const dataPath = path.join(process.cwd(), "src/data/posttest.json");

  if (!fs.existsSync(dataPath)) {
    notFound();
  }

  const postTestData = JSON.parse(
    fs.readFileSync(dataPath, "utf-8"),
  ) as QuizData;

  return <ClientPostTestPage data={postTestData} />;
}
