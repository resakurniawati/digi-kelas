import { Question } from "./question";

export interface QuizData {
  title: string;
  description: string;
  durationSeconds: number;
  questions: Question[];
}
