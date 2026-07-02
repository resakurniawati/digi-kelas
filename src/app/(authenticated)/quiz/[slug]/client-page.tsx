"use client";

import { useAuth } from "@/components/auth-provider";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { QuizData } from "@/types/quiz";

function PageIcon() {
  return (
    <svg
      viewBox="0 0 76 76"
      fill="none"
      className="size-16 shrink-0 sm:size-[76px]"
    >
      <circle
        cx="38"
        cy="38"
        r="32"
        fill="#E8F8F2"
        stroke="#00B894"
        strokeWidth="3"
      />
      <path d="M25 28h10v6H25z" fill="#0984E3" rx="2" />
      <path d="M39 28h12v6H39z" fill="#FFC107" rx="2" />
      <path d="M25 38h12v6H25z" fill="#FFC107" rx="2" />
      <path d="M41 38h10v6H41z" fill="#0984E3" rx="2" />
      <path d="M25 48h8v6H25z" fill="#00B894" rx="2" />
      <path d="M37 48h14v6H37z" fill="#00B894" rx="2" />
      <path
        d="m46 24 5 5-12 12"
        stroke="#00B894"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function TimerIcon({ className }: Readonly<{ className?: string }>) {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <circle cx="12" cy="13" r="8" />
      <path d="M12 9v4l2 2" />
      <path d="M5 3 2 6" />
      <path d="m22 6-3-3" />
      <path d="M12 5V3" />
      <path d="M10 2h4" />
    </svg>
  );
}

function ChevronLeft({ className }: Readonly<{ className?: string }>) {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="m15 18-6-6 6-6" />
    </svg>
  );
}

function ChevronRight({ className }: Readonly<{ className?: string }>) {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="m9 18 6-6-6-6" />
    </svg>
  );
}

function formatTime(totalSeconds: number): string {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

type QuizState = "idle" | "running" | "finished";

export default function ClientQuizPage({
  data,
  slug,
}: {
  data: QuizData;
  slug: string;
}) {
  const {
    questions,
    durationSeconds: QUIZ_DURATION_SECONDS,
    title,
    description,
  } = data;
  const { username } = useAuth();
  const [quizState, setQuizState] = useState<QuizState>("idle");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [timeLeft, setTimeLeft] = useState(QUIZ_DURATION_SECONDS);
  const [slideDirection, setSlideDirection] = useState<"left" | "right" | null>(
    null,
  );
  const [showAnswers, setShowAnswers] = useState(false);
  const [quizQuestions, setQuizQuestions] = useState(questions);
  const [savedScore, setSavedScore] = useState<number | null>(null);
  const [savedDuration, setSavedDuration] = useState<number | null>(null);
  const [isChecking, setIsChecking] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const timeLeftRef = useRef(QUIZ_DURATION_SECONDS);

  useEffect(() => {
    timeLeftRef.current = timeLeft;
  }, [timeLeft]);

  const answeredCount =
    savedScore !== null ? questions.length : Object.keys(answers).length;
  const currentQuestion = quizQuestions[currentIndex];
  const selectedAnswer = answers[currentQuestion.id];
  const isFinished = quizState === "finished";

  const computedCorrectCount = useMemo(
    () =>
      quizQuestions.reduce(
        (total, q) => (answers[q.id] === q.correct ? total + 1 : total),
        0,
      ),
    [answers, quizQuestions],
  );

  const score =
    savedScore !== null
      ? Math.round((savedScore / 100) * questions.length)
      : computedCorrectCount;
  const finalScorePercentage =
    savedScore !== null
      ? savedScore
      : Math.round((computedCorrectCount / questions.length) * 100);

  useEffect(() => {
    const sessionId = localStorage.getItem("session_id");
    if (!sessionId) {
      setTimeout(() => setIsChecking(false), 0);
      return;
    }

    let isMounted = true;
    import("@/app/actions/score").then(({ getScore }) => {
      getScore(slug, sessionId, "quiz")
        .then((res) => {
          if (res && isMounted) {
            setSavedScore(res.score);
            if (res.durationSeconds != null)
              setSavedDuration(res.durationSeconds);
            setQuizState("finished");
          }
        })
        .catch(console.error)
        .finally(() => {
          if (isMounted) setIsChecking(false);
        });
    });

    return () => {
      isMounted = false;
    };
  }, [slug]);

  const stopTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const finishQuiz = useCallback(async () => {
    stopTimer();
    setIsSubmitting(true);

    const sessionId = localStorage.getItem("session_id");
    if (sessionId) {
      const finalScorePercentageToSave = Math.round(
        (computedCorrectCount / questions.length) * 100,
      );
      const durationUsed = QUIZ_DURATION_SECONDS - timeLeftRef.current;

      try {
        const { markResourceCompleted } =
          await import("@/app/actions/progress");
        await markResourceCompleted(slug, sessionId, "quiz");

        const { saveScore } = await import("@/app/actions/score");
        await saveScore(
          slug,
          sessionId,
          "quiz",
          finalScorePercentageToSave,
          durationUsed,
        );
      } catch (error) {
        console.error("Failed to save quiz data", error);
      }
    }

    setIsSubmitting(false);
    setQuizState("finished");
    setCurrentIndex(0);
  }, [
    stopTimer,
    slug,
    computedCorrectCount,
    questions.length,
    QUIZ_DURATION_SECONDS,
  ]);

  // Timer tick
  useEffect(() => {
    if (quizState !== "running") return;

    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          finishQuiz();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => stopTimer();
  }, [quizState, finishQuiz, stopTimer]);

  // Block browser back button during running state
  useEffect(() => {
    if (quizState !== "running") return;

    window.history.pushState({ quizRunning: true }, "");

    const handlePopState = () => {
      window.history.pushState({ quizRunning: true }, "");
    };

    window.addEventListener("popstate", handlePopState);
    return () => {
      window.removeEventListener("popstate", handlePopState);
    };
  }, [quizState]);

  // Warn before closing / refreshing while quiz is running
  useEffect(() => {
    if (quizState !== "running") return;

    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [quizState]);

  const startQuiz = () => {
    setAnswers({});
    setCurrentIndex(0);
    setTimeLeft(QUIZ_DURATION_SECONDS);
    setSlideDirection(null);
    setQuizState("running");
    setShowAnswers(false);
    setQuizQuestions([...questions].sort(() => Math.random() - 0.5));
  };

  const handleAnswer = (questionId: number, option: string) => {
    if (isFinished) return;
    setAnswers((current) => ({
      ...current,
      [questionId]: option,
    }));
  };

  const goToQuestion = (index: number) => {
    if (index < 0 || index >= questions.length) return;
    setSlideDirection(index > currentIndex ? "left" : "right");
    setCurrentIndex(index);
  };

  const handleSubmit = () => {
    if (answeredCount === questions.length) {
      finishQuiz();
    }
  };

  const handleReset = () => {
    setQuizState("idle");
    setAnswers({});
    setCurrentIndex(0);
    setTimeLeft(QUIZ_DURATION_SECONDS);
    setSlideDirection(null);
    setShowAnswers(false);
    setSavedScore(null);
  };

  // Timer urgency levels
  const timerPercent = timeLeft / QUIZ_DURATION_SECONDS;
  const isUrgent = timerPercent <= 0.2; // 20% remaining
  const timerColor =
    timerPercent > 0.5
      ? "text-accent"
      : timerPercent > 0.2
        ? "text-yellow-500"
        : "text-error";
  const timerBgColor =
    timerPercent > 0.5
      ? "bg-[#E8F8F2]"
      : timerPercent > 0.2
        ? "bg-[#FFF8E1]"
        : "bg-error-bg";

  if (isChecking) {
    return (
      <main className="relative z-10 flex w-full max-w-4xl flex-1 flex-col items-center justify-center py-20 gap-4">
        <div className="size-12 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
        <p className="text-lg font-bold text-gray-500">Memeriksa status...</p>
      </main>
    );
  }

  // ── Idle / Start screen ──────────────────────────────────────
  if (quizState === "idle") {
    return (
      <main className="relative z-10 flex w-full max-w-4xl flex-1 flex-col gap-5">
        <section className="overflow-hidden rounded-3xl border-[3px] border-border bg-white shadow-sm sm:rounded-4xl">
          <div className="flex flex-col gap-4 p-4 sm:gap-5 sm:p-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex flex-row items-center gap-3 sm:gap-4">
              <div className="shrink-0">
                <PageIcon />
              </div>
              <div className="text-left">
                <p className="text-xs font-bold text-primary sm:text-sm">
                  Quiz
                </p>
                <h1 className="text-xl font-bold leading-tight text-foreground sm:text-3xl">
                  Siap untuk quiz, {username}?
                </h1>
                <p className="mt-1 max-w-2xl text-sm font-semibold leading-relaxed text-gray-500 sm:mt-2 sm:text-base">
                  {questions.length} soal pilihan ganda. {description}
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
                {questions.length}
              </p>
              <p className="mt-1 text-[10px] font-bold leading-tight text-gray-500 sm:text-sm">
                Soal
              </p>
            </div>
            <div className="px-2 py-3 text-center sm:px-5 sm:py-4">
              <p className="text-xl font-bold text-accent sm:text-2xl">
                {Math.floor(QUIZ_DURATION_SECONDS / 60)} menit
              </p>
              <p className="mt-1 text-[10px] font-bold leading-tight text-gray-500 sm:text-sm">
                Waktu
              </p>
            </div>
            <div className="px-2 py-3 text-center sm:px-5 sm:py-4">
              <p className="text-xl font-bold text-primary sm:text-2xl">
                Pilihan Ganda
              </p>
              <p className="mt-1 text-[10px] font-bold leading-tight text-gray-500 sm:text-sm">
                Tipe soal
              </p>
            </div>
          </div>
        </section>

        {/* Rules card */}
        <section className="rounded-4xl border-[3px] border-border bg-white p-5 shadow-sm sm:p-6">
          <h2 className="mb-4 text-xl font-bold text-foreground">
            Petunjuk Pengerjaan
          </h2>
          <ul className="flex flex-col gap-3">
            {[
              "Pilih satu jawaban terbaik untuk setiap soal.",
              "Kamu bisa berpindah antar soal kapan saja.",
              `Waktu quiz adalah ${Math.floor(QUIZ_DURATION_SECONDS / 60)} menit. Quiz otomatis selesai jika waktu habis.`,
              "Pastikan semua soal sudah dijawab sebelum submit.",
              "Skor akan ditampilkan setelah quiz selesai.",
            ].map((rule, i) => (
              <li key={i} className="flex items-start gap-3">
                <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-accent text-xs font-bold text-white">
                  {i + 1}
                </span>
                <span className="text-base font-semibold leading-relaxed text-gray-600">
                  {rule}
                </span>
              </li>
            ))}
          </ul>
        </section>

        {/* Start button */}
        <section className="rounded-4xl border-[3px] border-border bg-white p-4 shadow-sm sm:p-5">
          <button
            type="button"
            onClick={startQuiz}
            className="flex min-h-14 w-full items-center justify-center gap-2 rounded-2.5xl bg-accent px-5 py-3 text-lg font-bold text-white transition-all duration-200 hover:bg-accent-dark active:scale-[0.97]"
          >
            <TimerIcon className="size-5" />
            Mulai Quiz
          </button>
        </section>
      </main>
    );
  }

  // ── Finished — show all questions with answers ─────────────
  if (isFinished) {
    return (
      <main className="relative z-10 flex w-full max-w-4xl flex-1 flex-col gap-5">
        {/* Header */}
        <section className="overflow-hidden rounded-3xl border-[3px] border-border bg-white shadow-sm sm:rounded-4xl">
          <div className="flex flex-col gap-4 p-4 sm:gap-5 sm:p-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex flex-row items-center gap-3 sm:gap-4">
              <div className="shrink-0">
                <PageIcon />
              </div>
              <div className="text-left">
                <p className="text-xs font-bold text-primary sm:text-sm">
                  Quiz
                </p>
                <h1 className="text-xl font-bold leading-tight text-foreground sm:text-3xl">
                  Hasil Quiz
                </h1>
                <p className="mt-1 max-w-2xl text-sm font-semibold leading-relaxed text-gray-500 sm:mt-2 sm:text-base">
                  Selamat, {username}! Kamu sudah menyelesaikan quiz.
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
                {answeredCount}/{questions.length}
              </p>
              <p className="mt-1 text-[10px] font-bold leading-tight text-gray-500 sm:text-sm">
                Terjawab
              </p>
            </div>
            <div className="px-2 py-3 text-center sm:px-5 sm:py-4">
              <p className="text-xl font-bold text-accent sm:text-2xl">
                {score}
              </p>
              <p className="mt-1 text-[10px] font-bold leading-tight text-gray-500 sm:text-sm">
                Skor
              </p>
            </div>
            <div className="px-2 py-3 text-center sm:px-5 sm:py-4">
              <p className="text-xl font-bold text-primary sm:text-2xl">
                {savedDuration !== null
                  ? formatTime(savedDuration)
                  : savedScore !== null
                    ? "-"
                    : formatTime(QUIZ_DURATION_SECONDS - timeLeft)}
              </p>
              <p className="mt-1 text-[10px] font-bold leading-tight text-gray-500 sm:text-sm">
                Waktu terpakai
              </p>
            </div>
          </div>
        </section>

        {/* Score summary card */}
        <section className="rounded-4xl border-[3px] border-border bg-white p-5 shadow-sm sm:p-6">
          <div className="flex flex-col items-center gap-1 text-center sm:flex-row sm:justify-between sm:text-left">
            <div>
              <h2 className="text-xl font-bold text-foreground">
                Hasil quiz: {score} dari {questions.length}
              </h2>
              <p className="mt-1 text-sm font-semibold text-gray-500">
                Nilai: {finalScorePercentage} — Waktu:{" "}
                {savedDuration !== null
                  ? formatTime(savedDuration)
                  : savedScore !== null
                    ? "-"
                    : formatTime(QUIZ_DURATION_SECONDS - timeLeft)}
              </p>
            </div>
            <div className="mt-3 flex size-16 shrink-0 items-center justify-center rounded-2xl border-[3px] border-accent bg-[#E8F8F2] sm:mt-0">
              <span className="text-2xl font-bold text-accent">
                {finalScorePercentage}
              </span>
            </div>
          </div>
        </section>

        {/* All questions review toggle */}
        {savedScore === null && (
          <section className="rounded-4xl border-[3px] border-border bg-white p-4 shadow-sm sm:p-5">
            <button
              type="button"
              onClick={() => setShowAnswers(!showAnswers)}
              className="flex min-h-14 w-full items-center justify-center gap-2 rounded-2.5xl border-2 border-primary bg-primary-container px-5 py-3 text-lg font-bold text-primary transition-all duration-200 hover:bg-white active:scale-[0.97]"
            >
              {showAnswers
                ? "Sembunyikan Kunci Jawaban"
                : "Lihat Kunci Jawaban"}
            </button>
          </section>
        )}

        {/* All questions review */}
        {savedScore === null && showAnswers && (
          <section className="flex flex-col gap-4">
            {quizQuestions.map((question, index) => {
              const userAnswer = answers[question.id];
              const isCorrect = userAnswer === question.correct;
              const correctContent = question.options.find(
                (o) => o.label === question.correct,
              )?.content;

              return (
                <article
                  key={question.id}
                  className="rounded-4xl border-[3px] border-border bg-white p-4 shadow-sm sm:p-5"
                >
                  <div className="mb-4 flex items-start gap-3">
                    <div
                      className={`flex size-10 shrink-0 items-center justify-center rounded-2xl text-base font-bold text-white ${
                        userAnswer === undefined
                          ? "bg-yellow-500"
                          : isCorrect
                            ? "bg-accent"
                            : "bg-error"
                      }`}
                    >
                      {index + 1}
                    </div>
                    <div>
                      <p className="text-lg font-bold leading-snug text-foreground whitespace-pre-line">
                        {question.question.content}
                      </p>
                      <p
                        className={`mt-2 text-sm font-bold ${
                          userAnswer === undefined
                            ? "text-yellow-600"
                            : isCorrect
                              ? "text-accent"
                              : "text-error"
                        }`}
                      >
                        {userAnswer === undefined
                          ? `Tidak dijawab. Jawaban benar: ${correctContent}`
                          : isCorrect
                            ? "Jawabanmu benar!"
                            : `Jawaban benar: ${correctContent}`}
                      </p>
                    </div>
                  </div>

                  <div className="grid gap-2 sm:grid-cols-2 sm:grid-rows-2 sm:grid-flow-col">
                    {question.options.map((option) => {
                      const isSelected = userAnswer === option.label;
                      const shouldShowCorrect =
                        option.label === question.correct;
                      const shouldShowWrong =
                        isSelected && option.label !== question.correct;

                      return (
                        <div
                          key={option.label}
                          className={`flex min-h-14 items-center gap-3 rounded-2.5xl border-2 px-4 py-3 text-left text-sm font-bold leading-relaxed ${
                            shouldShowCorrect
                              ? "border-accent bg-[#E8F8F2] text-accent"
                              : shouldShowWrong
                                ? "border-error-border bg-error-bg text-error"
                                : "border-border bg-white text-gray-600"
                          }`}
                        >
                          <span
                            className={`flex size-6 shrink-0 items-center justify-center rounded-full border-2 text-xs ${
                              shouldShowCorrect || isSelected
                                ? "border-current bg-white"
                                : "border-border bg-primary-container"
                            }`}
                          >
                            {shouldShowCorrect && (
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
                            {shouldShowWrong && (
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
                                <path d="m18 6-12 12" />
                                <path d="m6 6 12 12" />
                              </svg>
                            )}
                          </span>
                          <span className="whitespace-pre-line">
                            <span className="mr-2 inline-block rounded bg-black/5 px-1.5 py-0.5 text-xs text-gray-500 font-bold">
                              {option.label}
                            </span>
                            {option.content}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </article>
              );
            })}
          </section>
        )}

        {/* Bottom actions */}
        <section className="rounded-4xl border-[3px] border-border bg-white p-4 shadow-sm sm:p-5">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <Link
              href="/"
              className="flex min-h-14 flex-1 items-center justify-center gap-2 rounded-2.5xl bg-primary px-5 py-3 text-lg font-bold text-white transition-all duration-200 hover:bg-primary-dark active:scale-[0.97]"
            >
              Kembali ke Beranda
            </Link>
            <button
              type="button"
              onClick={handleReset}
              className="flex min-h-14 items-center justify-center rounded-2.5xl border-2 border-border bg-primary-container px-6 py-3 text-lg font-bold text-primary transition-all duration-200 hover:bg-white active:scale-[0.97]"
            >
              Ulangi Quiz
            </button>
          </div>
        </section>
      </main>
    );
  }

  // ── Running ──────────────────────────────────────────────────
  return (
    <main className="relative z-10 flex w-full max-w-4xl flex-1 flex-col gap-5">
      {/* Header with timer */}
      <section className="overflow-hidden rounded-3xl border-[3px] border-border bg-white shadow-sm sm:rounded-4xl">
        <div className="flex flex-col gap-4 p-4 sm:gap-5 sm:p-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-row items-center gap-3 sm:gap-4">
            <div className="shrink-0">
              <PageIcon />
            </div>
            <div className="text-left">
              <p className="text-xs font-bold text-primary sm:text-sm">Quiz</p>
              <h1 className="text-xl font-bold leading-tight text-foreground sm:text-3xl">
                {title}
              </h1>
              <p className="mt-1 max-w-2xl text-sm font-semibold leading-relaxed text-gray-500 sm:mt-2 sm:text-base">
                Pilih satu jawaban terbaik untuk setiap soal.
              </p>
            </div>
          </div>

          <div
            className={`flex min-h-10 items-center justify-center gap-2 rounded-2xl border-2 border-border px-4 py-2 ${timerBgColor} transition-colors duration-300 sm:min-h-12 sm:rounded-2.5xl sm:px-5 sm:py-3`}
          >
            <TimerIcon className={`size-4 sm:size-5 ${timerColor}`} />
            <span
              className={`min-w-[4rem] text-center text-xl sm:min-w-[4.5rem] sm:text-2xl font-bold tabular-nums ${timerColor} transition-colors duration-300`}
            >
              {formatTime(timeLeft)}
            </span>
          </div>
        </div>

        {/* Stats bar */}
        <div className="grid grid-cols-3 divide-x-[3px] divide-border border-t-[3px] border-border bg-primary-container">
          <div className="px-2 py-3 text-center sm:px-5 sm:py-4">
            <p className="text-xl font-bold text-primary sm:text-2xl">
              {answeredCount}/{questions.length}
            </p>
            <p className="mt-1 text-[10px] font-bold leading-tight text-gray-500 sm:text-sm">
              Terjawab
            </p>
          </div>
          <div className="px-2 py-3 text-center sm:px-5 sm:py-4">
            <p className="text-xl font-bold text-accent sm:text-2xl">-</p>
            <p className="mt-1 text-[10px] font-bold leading-tight text-gray-500 sm:text-sm">
              Skor
            </p>
          </div>
          <div className="px-2 py-3 text-center sm:px-5 sm:py-4">
            <p className={`text-xl font-bold sm:text-2xl ${timerColor}`}>
              {formatTime(timeLeft)}
            </p>
            <p className="mt-1 text-[10px] font-bold leading-tight text-gray-500 sm:text-sm">
              Sisa waktu
            </p>
          </div>
        </div>
      </section>

      {/* Progress bar + question nav */}
      <section className="rounded-4xl border-[3px] border-border bg-white p-4 shadow-sm sm:p-5">
        {/* Progress bar */}
        <div className="mb-4 overflow-hidden rounded-full bg-primary-container">
          <div
            className="h-2.5 rounded-full bg-accent transition-all duration-500 ease-out"
            style={{
              width: `${(answeredCount / questions.length) * 100}%`,
            }}
          />
        </div>

        {/* Question number pills */}
        <div className="flex flex-wrap items-center justify-center gap-2">
          {quizQuestions.map((q, i) => {
            const isAnswered = answers[q.id] !== undefined;
            const isCurrent = i === currentIndex;

            let pillClass =
              "border-border bg-primary-container text-gray-500 hover:bg-background";
            if (isCurrent) {
              pillClass = "border-primary bg-primary text-white";
            } else if (isAnswered) {
              pillClass = "border-accent bg-[#E8F8F2] text-accent";
            }

            return (
              <button
                key={q.id}
                type="button"
                onClick={() => goToQuestion(i)}
                className={`flex size-10 items-center justify-center rounded-xl border-2 text-sm font-bold transition-all duration-200 active:scale-95 ${pillClass}`}
              >
                {i + 1}
              </button>
            );
          })}
        </div>
      </section>

      {/* Question card */}
      <section
        key={currentQuestion.id}
        className={`rounded-4xl border-[3px] border-border bg-white p-4 shadow-sm sm:p-5 ${
          slideDirection === "left"
            ? "animate-slide-in-left"
            : slideDirection === "right"
              ? "animate-slide-in-right"
              : ""
        }`}
        onAnimationEnd={() => setSlideDirection(null)}
      >
        <div className="mb-4 flex items-start gap-3">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-2xl bg-primary text-base font-bold text-white">
            {currentIndex + 1}
          </div>
          <p className="text-lg font-bold leading-snug text-foreground whitespace-pre-line">
            {currentQuestion.question.content}
          </p>
        </div>

        <div className="grid gap-2 sm:grid-cols-2 sm:grid-rows-2 sm:grid-flow-col">
          {currentQuestion.options.map((option) => {
            const isSelected = selectedAnswer === option.label;

            return (
              <button
                key={option.label}
                type="button"
                onClick={() => handleAnswer(currentQuestion.id, option.label)}
                className={`flex min-h-14 items-center gap-3 rounded-2.5xl border-2 px-4 py-3 text-left text-sm font-bold leading-relaxed transition-all duration-200 active:scale-[0.98] ${
                  isSelected
                    ? "border-primary bg-primary-container text-primary"
                    : "border-border bg-white text-gray-600 hover:bg-background"
                }`}
              >
                <span
                  className={`flex size-6 shrink-0 items-center justify-center rounded-full border-2 text-xs ${
                    isSelected
                      ? "border-current bg-white"
                      : "border-border bg-primary-container"
                  }`}
                >
                  {isSelected && (
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
      </section>

      {/* Navigation & Submit */}
      <section className="rounded-4xl border-[3px] border-border bg-white p-4 shadow-sm sm:p-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          {/* Prev / Next */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={currentIndex === 0}
              onClick={() => goToQuestion(currentIndex - 1)}
              className="flex-1 flex min-h-12 items-center justify-center gap-1 rounded-2.5xl border-2 border-border bg-primary-container px-4 py-3 text-sm font-bold text-primary transition-all duration-200 hover:bg-white active:scale-[0.97] disabled:text-gray-400 disabled:hover:bg-primary-container disabled:active:scale-100"
            >
              <ChevronLeft className="size-[18px]" />
              Sebelumnya
            </button>
            <button
              type="button"
              disabled={currentIndex === questions.length - 1}
              onClick={() => goToQuestion(currentIndex + 1)}
              className="flex-1 flex min-h-12 items-center justify-center gap-1 rounded-2.5xl border-2 border-border bg-primary-container px-4 py-3 text-sm font-bold text-primary transition-all duration-200 hover:bg-white active:scale-[0.97] disabled:text-gray-400 disabled:hover:bg-primary-container disabled:active:scale-100"
            >
              Selanjutnya
              <ChevronRight className="size-[18px]" />
            </button>
          </div>

          {/* Submit */}
          <button
            type="button"
            disabled={answeredCount !== questions.length || isSubmitting}
            onClick={handleSubmit}
            className="flex min-h-12 items-center justify-center rounded-2.5xl bg-accent px-6 py-3 text-base font-bold text-white transition-all duration-200 hover:bg-accent-dark active:scale-[0.97] disabled:bg-gray-300 disabled:text-gray-500 disabled:active:scale-100"
          >
            {isSubmitting
              ? "Menyimpan..."
              : `Selesai Quiz (${answeredCount}/${questions.length})`}
          </button>
        </div>
      </section>
    </main>
  );
}
