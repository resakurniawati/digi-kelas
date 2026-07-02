type ContentType = "text" | "image";

interface QuestionContent {
  type: ContentType;
  content: string;
  alt?: string; // wajib kalau type === 'image'
}

interface QuestionOption {
  label: "A" | "B" | "C" | "D";
  type: ContentType;
  content: string; // teks atau path image
  alt?: string;
}

interface SupportImage {
  src: string;
  alt: string;
}

export interface Question {
  id: number;
  question: QuestionContent;
  image?: SupportImage; // gambar pendukung opsional
  caption?: string; // caption opsional untuk image soal
  options: QuestionOption[];
  correct: "A" | "B" | "C" | "D";
}
