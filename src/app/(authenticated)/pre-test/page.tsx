import fs from "fs/promises";
import path from "path";
import ClientPreTest from "./client-page";
import { Question } from "@/types/question";

export default async function PreTestPage() {
  const filePath = path.join(process.cwd(), "src/data/pretest.json");
  const fileContents = await fs.readFile(filePath, "utf8");
  const questions: Question[] = JSON.parse(fileContents);

  return <ClientPreTest questions={questions} />;
}
