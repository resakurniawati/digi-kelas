"use client";

import { useAuth } from "@/components/auth-provider";
import Link from "next/link";
import { useState, useTransition, useEffect } from "react";
import type { Question } from "@/types/question";
function PageIcon() {
  return (
    <svg
      viewBox="0 0 76 76"
      fill="none"
      className="size-16 shrink-0 sm:size-[76px]"
    >
      <circle cx="38" cy="38" r="32" fill="#FFF3CD" stroke="#FFC107" strokeWidth="3" />
      <path d="M26 27h24M26 38h18M26 49h12" stroke="#0984E3" strokeWidth="4" strokeLinecap="round" />
      <path d="m45 49 5 5 10-12" stroke="#00B894" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export default function ClientPreTest({
  slug,
  questions,
}: {
  slug: string;
  questions: Question[];
}) {
  const { username } = useAuth();
  
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [isPending, startTransition] = useTransition();
  const [result, setResult] = useState<{
    score: number;
    finalScore?: number;
    total: number;
    results: { questionId: number; isCorrect: boolean; correctAnswer: string }[];
  } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    const sessionId = localStorage.getItem("session_id");
    if (!sessionId) {
      setTimeout(() => setIsChecking(false), 0);
      return;
    }
    
    let isMounted = true;
    startTransition(async () => {
      import("@/app/actions/score").then(({ getScore }) => {
        getScore(slug, sessionId, "pretest").then((res) => {
          if (res && isMounted) {
            setResult({
              score: Math.round((res.score / 100) * questions.length),
              finalScore: res.score,
              total: questions.length,
              results: [], // Empty results means we fetched it from DB (already completed)
            });
          }
        }).catch(console.error).finally(() => {
          if (isMounted) setIsChecking(false);
        });
      });
    });
    
    return () => {
      isMounted = false;
    };
  }, [slug]);

  const answeredCount = Object.keys(answers).length;

  const handleAnswer = (questionId: number, optionLabel: string) => {
    if (result) return;
    setAnswers((current) => ({
      ...current,
      [questionId]: optionLabel,
    }));
  };

  const handleSubmit = () => {
    if (answeredCount === questions.length) {
      const sessionId = localStorage.getItem("session_id");
      if (!sessionId) {
        alert("Sesi tidak ditemukan. Harap muat ulang halaman atau login kembali.");
        return;
      }

      setIsSubmitting(true);
      startTransition(async () => {
        let correctCount = 0;
        const results = questions.map((q) => {
          const isCorrect = answers[q.id] === q.correct;
          if (isCorrect) correctCount++;
          return {
            questionId: q.id,
            isCorrect,
            correctAnswer: q.correct!,
          };
        });

        const finalScore = Math.round((correctCount / questions.length) * 100);

        try {
          const { saveScore } = await import("@/app/actions/score");
          await saveScore(slug, sessionId, "pretest", finalScore);

          const { initializeProgress } = await import("@/app/actions/progress");
          await initializeProgress(slug, sessionId);
        } catch (error) {
          console.error("Failed to save pretest data", error);
        }

        setResult({
          score: correctCount,
          finalScore: finalScore,
          total: questions.length,
          results: results,
        });
        setIsSubmitting(false);
      });
    }
  };

  // Retaking pre-test is not allowed

  const hasLoadedCompleted = result && result.results.length === 0;

  if (isChecking) {
    return (
      <main className="relative z-10 flex w-full max-w-4xl flex-1 flex-col items-center justify-center py-20 gap-4">
        <div className="size-12 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
        <p className="text-lg font-bold text-gray-500">Memeriksa status...</p>
      </main>
    );
  }

  return (
    <main className="relative z-10 flex w-full max-w-4xl flex-1 flex-col gap-5">
      <section className="overflow-hidden rounded-3xl border-[3px] border-border bg-white shadow-sm sm:rounded-4xl">
        <div className="flex flex-col gap-4 p-4 sm:gap-5 sm:p-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-row items-center gap-3 sm:gap-4">
            <div className="shrink-0">
              <PageIcon />
            </div>
            <div className="text-left">
              <p className="text-xs font-bold text-primary sm:text-sm">Pre-test</p>
              <h1 className="text-xl font-bold leading-tight text-foreground sm:text-3xl">
                {hasLoadedCompleted ? `Pre-test telah diselesaikan, ${username}` : `Ayo cek pemahaman awalmu, ${username}`}
              </h1>
              <p className="mt-1 max-w-2xl text-sm font-semibold leading-relaxed text-gray-500 sm:mt-2 sm:text-base">
                {hasLoadedCompleted ? "Kamu sudah menyelesaikan pre-test untuk materi ini." : "Jawab pertanyaan pilihan ganda berikut dengan satu jawaban terbaik."}
              </p>
            </div>
          </div>

          <Link
            href="/"
            className="flex min-h-10 items-center justify-center rounded-2xl border-2 border-border bg-primary-container px-4 py-2 text-sm font-bold text-primary transition-all duration-200 hover:bg-white active:scale-[0.97] sm:w-auto sm:min-h-12 sm:rounded-2.5xl sm:px-5 sm:py-3 sm:text-base"
          >
            Kembali
          </Link>
        </div>

        <div className="grid grid-cols-3 divide-x-[3px] divide-border border-t-[3px] border-border bg-primary-container">
          <div className="px-2 py-3 text-center sm:px-5 sm:py-4">
            <p className="text-xl font-bold text-primary sm:text-2xl">
              {hasLoadedCompleted ? questions.length : answeredCount}/{questions.length}
            </p>
            <p className="mt-1 text-[10px] font-bold leading-tight text-gray-500 sm:text-sm">Terjawab</p>
          </div>
          <div className="px-2 py-3 text-center sm:px-5 sm:py-4">
            <p className="text-xl font-bold text-accent sm:text-2xl">
              {result ? result.finalScore : "-"}
            </p>
            <p className="mt-1 text-[10px] font-bold leading-tight text-gray-500 sm:text-sm">Skor</p>
          </div>
          <div className="px-2 py-3 text-center sm:px-5 sm:py-4">
            <p className="text-xl font-bold text-primary sm:text-2xl">Pilihan Ganda</p>
            <p className="mt-1 text-[10px] font-bold leading-tight text-gray-500 sm:text-sm">Tipe soal</p>
          </div>
        </div>
      </section>

      {!hasLoadedCompleted && (
        <section className="flex flex-col gap-4">
        {questions.map((question, index) => {
          const selectedAnswer = answers[question.id];
          const questionResult = result?.results.find((r) => r.questionId === question.id);
          const isCorrect = questionResult?.isCorrect;

          return (
            <article
              key={question.id}
              className="rounded-4xl border-[3px] border-border bg-white p-4 shadow-sm sm:p-5"
            >
              <div className="mb-4 flex items-start gap-3">
                <div className="flex size-10 shrink-0 items-center justify-center rounded-2xl bg-primary text-base font-bold text-white">
                  {index + 1}
                </div>
                <div>
                  <p className="text-lg font-bold leading-snug text-foreground whitespace-pre-line">
                    {question.question.content}
                  </p>
                </div>
              </div>

              <div className="grid gap-2 sm:grid-cols-2 sm:grid-rows-2 sm:grid-flow-col">
                {question.options.map((option) => {
                  const isSelected = selectedAnswer === option.label;
                  const shouldShowCorrect = false; // Pre-test does not reveal correct answers
                  const shouldShowWrong = false; // Pre-test does not reveal wrong answers

                  return (
                    <button
                      key={option.label}
                      type="button"
                      disabled={!!result || isPending || isSubmitting}
                      onClick={() => handleAnswer(question.id, option.label)}
                      className={`flex min-h-14 items-center gap-3 rounded-2.5xl border-2 px-4 py-3 text-left text-sm font-bold leading-relaxed transition-all duration-200 active:scale-[0.98] disabled:active:scale-100 ${
                        shouldShowCorrect
                          ? "border-accent bg-[#E8F8F2] text-accent"
                          : shouldShowWrong
                            ? "border-error-border bg-error-bg text-error"
                            : isSelected
                              ? "border-primary bg-primary-container text-primary"
                              : "border-border bg-white text-gray-600 hover:bg-background"
                      }`}
                    >
                      <span
                        className={`flex size-6 shrink-0 items-center justify-center rounded-full border-2 text-xs ${
                          shouldShowCorrect || isSelected
                            ? "border-current bg-white"
                            : "border-border bg-primary-container"
                        }`}
                      >
                        {(isSelected || shouldShowCorrect) && (
                          <svg
                            width="14"
                            height="14"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="3"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="size-3.5 shrink-0"
                          >
                            <path d="m5 12 4 4L19 6" />
                          </svg>
                        )}
                      </span>
                      <span className="whitespace-pre-line">
                        <span className="mr-2 inline-block rounded bg-black/5 px-1.5 py-0.5 text-xs text-gray-500 font-bold">
                          {option.label}
                        </span>
                        {option.content}
                      </span>
                    </button>
                  );
                })}
              </div>
            </article>
          );
        })}
      </section>
      )}

      <section className="rounded-4xl border-[3px] border-border bg-white p-4 shadow-sm sm:p-5">
        {result ? (
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-xl font-bold text-foreground">
                Nilai akhir: {result.finalScore}
              </h2>
              <p className="mt-1 text-sm font-semibold text-gray-500">
                Menjawab benar {result.score} dari {result.total} soal. Nilai telah disimpan.
              </p>
            </div>
            <Link
              href={`/materi/${slug}`}
              className="flex min-h-12 items-center justify-center rounded-2.5xl bg-primary px-6 py-3 text-base font-bold text-white transition-all duration-200 hover:bg-primary-dark active:scale-[0.97]"
            >
              Lanjut ke Materi
            </Link>
          </div>
        ) : (
          <button
            type="button"
            disabled={answeredCount !== questions.length || isPending || isSubmitting}
            onClick={handleSubmit}
            className="flex min-h-14 w-full items-center justify-center rounded-2.5xl bg-accent px-5 py-3 text-lg font-bold text-white transition-all duration-200 hover:bg-accent-dark active:scale-[0.97] disabled:bg-gray-300 disabled:text-gray-500 disabled:active:scale-100"
          >
            {isSubmitting || isPending ? "Menyimpan..." : "Selesai Pre-test"}
          </button>
        )}
      </section>
    </main>
  );
}
