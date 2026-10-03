"use client";

import { useAuth } from "@/components/auth-provider";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { QuizData } from "@/types/quiz";

// Post-test global disimpan di bawah material_id materi terakhir
const SLUG = "merancang-kemasan-kubus-dan-balok-bagian-2";

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
        fill="#F3E8FF"
        stroke="#8B5CF6"
        strokeWidth="3"
      />
      <path d="M24 26h12v7H24z" fill="#0984E3" rx="2" />
      <path d="M40 26h12v7H40z" fill="#F59E0B" rx="2" />
      <path d="M24 37h14v7H24z" fill="#F59E0B" rx="2" />
      <path d="M42 37h10v7H42z" fill="#0984E3" rx="2" />
      <path d="M24 48h10v7H24z" fill="#8B5CF6" rx="2" />
      <path d="M38 48h14v7H38z" fill="#8B5CF6" rx="2" />
      {/* Trophy / star accent */}
      <path
        d="m49 22 2 4 4 .5-3 3 .7 4.5L49 32l-3.7 2 .7-4.5-3-3 4-.5 2-4Z"
        fill="#F59E0B"
        stroke="#F59E0B"
        strokeWidth="1"
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

function AppreciationCard({ score, total }: { score: number; total: number }) {
  const percentage = (score / total) * 100;

  const isExcellent = percentage >= 80;
  const isGood = percentage >= 60 && percentage < 80;

  let title = "Kerja Bagus!";
  let text =
    "Kamu sudah berusaha dengan keras. Terus semangat dan jangan pernah menyerah ya!";
  let svg = (
    <svg viewBox="0 0 100 100" className="size-20 drop-shadow-md sm:size-24">
      <circle cx="50" cy="50" r="45" fill="#FFD93D" />
      <path
        d="M50 15 L60 40 L85 40 L65 55 L75 80 L50 65 L25 80 L35 55 L15 40 L40 40 Z"
        fill="#FF9A00"
      />
      <circle cx="40" cy="45" r="4" fill="#333" />
      <circle cx="60" cy="45" r="4" fill="#333" />
      <path
        d="M40 60 Q50 70 60 60"
        fill="none"
        stroke="#333"
        strokeWidth="4"
        strokeLinecap="round"
      />
    </svg>
  );

  if (isExcellent) {
    title = "Wah, Luar Biasa!";
    text =
      "Nilaimu sangat bagus! Kamu adalah bintang kelas yang bersinar terang. Pertahankan terus belajarmu ya!";
    svg = (
      <svg viewBox="0 0 100 100" className="size-20 drop-shadow-md sm:size-24">
        <circle cx="50" cy="50" r="45" fill="#FFD93D" />
        <path
          d="M50 10 L61 35 L88 35 L66 51 L74 77 L50 61 L26 77 L34 51 L12 35 L39 35 Z"
          fill="#FFF200"
          stroke="#FF9A00"
          strokeWidth="2"
        />
        <circle cx="38" cy="45" r="5" fill="#333" />
        <circle cx="62" cy="45" r="5" fill="#333" />
        <path
          d="M40 60 Q50 75 60 60"
          fill="none"
          stroke="#333"
          strokeWidth="4"
          strokeLinecap="round"
        />
        <path
          d="M80 20 L85 10 M85 20 L95 15 M20 20 L15 10 M15 20 L5 15"
          stroke="#FFD93D"
          strokeWidth="3"
          strokeLinecap="round"
        />
      </svg>
    );
  } else if (isGood) {
    title = "Hebat Sekali!";
    text =
      "Kamu sudah belajar dengan sangat baik. Sedikit lagi pasti bisa mendapat nilai sempurna. Tetap semangat!";
    svg = (
      <svg viewBox="0 0 100 100" className="size-20 drop-shadow-md sm:size-24">
        <circle cx="50" cy="50" r="45" fill="#4ADE80" />
        <path
          d="M30 50 L45 65 L70 35"
          fill="none"
          stroke="#FFF"
          strokeWidth="10"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    );
  } else {
    title = "Tetap Semangat!";
    text =
      "Kamu sudah berani mencoba dan itu adalah hal yang hebat! Terus berlatih ya, kamu pasti akan jadi lebih pintar!";
    svg = (
      <svg viewBox="0 0 100 100" className="size-20 drop-shadow-md sm:size-24">
        <circle cx="50" cy="50" r="45" fill="#60A5FA" />
        <path
          d="M50 20 A 30 30 0 1 0 80 50"
          fill="none"
          stroke="#FFF"
          strokeWidth="8"
          strokeLinecap="round"
        />
        <path
          d="M50 20 L60 10 M50 20 L60 30"
          fill="none"
          stroke="#FFF"
          strokeWidth="8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <circle cx="35" cy="40" r="4" fill="#FFF" />
        <circle cx="65" cy="40" r="4" fill="#FFF" />
        <path
          d="M40 65 Q50 60 60 65"
          fill="none"
          stroke="#FFF"
          strokeWidth="4"
          strokeLinecap="round"
        />
      </svg>
    );
  }

  return (
    <section className="relative overflow-hidden flex flex-col items-center gap-6 rounded-4xl border-[3px] border-border bg-gradient-to-br from-white to-primary-container p-6 text-center shadow-sm sm:flex-row sm:text-left sm:p-8">
      <div className="absolute -right-10 -top-10 size-40 rounded-full bg-yellow-100 opacity-50 blur-3xl"></div>
      <div className="absolute -bottom-10 -left-10 size-40 rounded-full bg-blue-100 opacity-50 blur-3xl"></div>

      <div className="shrink-0 animate-bounce">{svg}</div>
      <div className="z-10 flex flex-col gap-2">
        <h2 className="text-2xl font-extrabold text-primary sm:text-3xl">
          {title}
        </h2>
        <p className="text-base font-semibold leading-relaxed text-gray-600 sm:text-lg">
          {text}
        </p>
      </div>
    </section>
  );
}

type PostTestState = "idle" | "running" | "feedback" | "finished";

export default function ClientPostTestPage({
  data,
}: {
  data: QuizData;
}) {
  const {
    questions,
    durationSeconds: POSTTEST_DURATION_SECONDS,
    title,
    description,
  } = data;
  const { username } = useAuth();
  const [testState, setTestState] = useState<PostTestState>("idle");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [timeLeft, setTimeLeft] = useState(POSTTEST_DURATION_SECONDS);
  const [slideDirection, setSlideDirection] = useState<"left" | "right" | null>(
    null,
  );
  const [showAnswers, setShowAnswers] = useState(false);
  const [testQuestions, setTestQuestions] = useState(questions);
  const [feedbackRating, setFeedbackRating] = useState<number>(0);
  const [feedbackText, setFeedbackText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [savedScore, setSavedScore] = useState<number | null>(null);
  const [savedDuration, setSavedDuration] = useState<number | null>(null);
  const [certificateId, setCertificateId] = useState<string | null>(null);
  const [isChecking, setIsChecking] = useState(true);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const timeLeftRef = useRef(POSTTEST_DURATION_SECONDS);

  useEffect(() => {
    timeLeftRef.current = timeLeft;
  }, [timeLeft]);

  const answeredCount =
    savedScore !== null ? questions.length : Object.keys(answers).length;
  const currentQuestion = testQuestions[currentIndex];
  const selectedAnswer = answers[currentQuestion.id];
  const isFinished = testState === "finished" || testState === "feedback";

  const computedCorrectCount = useMemo(
    () =>
      testQuestions.reduce(
        (total, q) => (answers[q.id] === q.correct ? total + 1 : total),
        0,
      ),
    [answers, testQuestions],
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
    Promise.all([
      import("@/app/actions/score").then(({ getScore }) =>
        getScore(SLUG, sessionId, "posttest"),
      ),
      import("@/app/actions/certificate").then(({ getCertificate }) =>
        getCertificate(SLUG, sessionId),
      ),
    ])
      .then(([scoreRes, certRes]) => {
        if (!isMounted) return;
        if (scoreRes) {
          setSavedScore(scoreRes.score);
          if (scoreRes.durationSeconds != null)
            setSavedDuration(scoreRes.durationSeconds);
          setTestState("finished");
        }
        if (certRes) {
          setCertificateId(certRes.id);
        }
      })
      .catch(console.error)
      .finally(() => {
        if (isMounted) setIsChecking(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const stopTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const finishTest = useCallback(async () => {
    stopTimer();
    setIsSubmitting(true);

    const sessionId = localStorage.getItem("session_id");
    if (sessionId) {
      const finalScorePercentageToSave = Math.round(
        (computedCorrectCount / questions.length) * 100,
      );
      const durationUsed = POSTTEST_DURATION_SECONDS - timeLeftRef.current;

      try {
        const { markResourceCompleted } =
          await import("@/app/actions/progress");
        await markResourceCompleted(SLUG, sessionId, "posttest");

        const { saveScore } = await import("@/app/actions/score");
        await saveScore(
          SLUG,
          sessionId,
          "posttest",
          finalScorePercentageToSave,
          durationUsed,
        );
      } catch (error) {
        console.error("Failed to save posttest score", error);
      }
    }

    setIsSubmitting(false);

    if (certificateId === null) {
      setTestState("feedback");
    } else {
      setTestState("finished");
    }
    setCurrentIndex(0);
  }, [
    stopTimer,
    computedCorrectCount,
    questions.length,
    POSTTEST_DURATION_SECONDS,
    certificateId,
  ]);

  // Timer tick
  useEffect(() => {
    if (testState !== "running") return;

    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          finishTest();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => stopTimer();
  }, [testState, finishTest, stopTimer]);

  // Block browser back button during running state
  useEffect(() => {
    if (testState !== "running") return;

    // Push a sentinel state so pressing back stays on this page
    window.history.pushState({ postTestRunning: true }, "");

    const handlePopState = () => {
      // Re-push to keep the user on this page
      window.history.pushState({ postTestRunning: true }, "");
    };

    window.addEventListener("popstate", handlePopState);
    return () => {
      window.removeEventListener("popstate", handlePopState);
    };
  }, [testState]);

  // Warn before closing / refreshing while test is running
  useEffect(() => {
    if (testState !== "running") return;

    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [testState]);

  const retakeTest = () => {
    setTestState("idle");
    setAnswers({});
    setCurrentIndex(0);
    setTimeLeft(POSTTEST_DURATION_SECONDS);
    setSlideDirection(null);
    setShowAnswers(false);
    setTestQuestions([...questions].sort(() => Math.random() - 0.5));
    // Reset savedScore so "answeredCount" matches the new empty answers, not questions.length
    setSavedScore(null);
    setSavedDuration(null);
  };

  const startTest = () => {
    setTestState("running");
    setAnswers({});
    setCurrentIndex(0);
    setTimeLeft(POSTTEST_DURATION_SECONDS);
    setSlideDirection(null);
    setShowAnswers(false);
    setTestQuestions([...questions].sort(() => Math.random() - 0.5));
    setSavedScore(null);
    setSavedDuration(null);
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
      finishTest();
    }
  };

  const handleFeedbackSubmit = async () => {
    setIsSubmitting(true);
    const sessionId = localStorage.getItem("session_id");
    if (sessionId) {
      try {
        const { submitFeedback } = await import("@/app/actions/feedback");
        await submitFeedback(SLUG, sessionId, feedbackRating, feedbackText);

        const { generateCertificate } =
          await import("@/app/actions/certificate");
        const res = await generateCertificate(
          SLUG,
          sessionId,
          username || "Pelajar",
          finalScorePercentage,
        );
        if (res.success && res.certificateId) {
          setCertificateId(res.certificateId);
        }
      } catch (error) {
        console.error(error);
      }
    }
    setTestState("finished");
    setIsSubmitting(false);
  };

  // Timer urgency levels
  const timerPercent = timeLeft / POSTTEST_DURATION_SECONDS;
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
  if (testState === "idle") {
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
                  Post-test
                </p>
                <h1 className="text-xl font-bold leading-tight text-foreground sm:text-3xl">
                  Siap untuk post-test, {username}?
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
                {Math.floor(POSTTEST_DURATION_SECONDS / 60)} menit
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
              "Post-test mengukur pemahaman setelah belajar materi.",
              "Pilih satu jawaban terbaik untuk setiap soal.",
              "Kamu bisa berpindah antar soal kapan saja.",
              `Waktu post-test adalah ${Math.floor(POSTTEST_DURATION_SECONDS / 60)} menit. Post-test otomatis selesai jika waktu habis.`,
              "Sertifikat kelulusan akan langsung diterbitkan setelah kamu menyelesaikan percobaan pertama.",
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

        {/* Important Notice */}
        <section className="flex items-start gap-4 rounded-4xl border-[3px] border-orange-400 bg-orange-50 p-5 shadow-sm sm:p-6">
          <div className="mt-1 shrink-0 text-orange-500">
            <svg
              width="28"
              height="28"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
              <path d="M12 9v4" />
              <path d="M12 17h.01" />
            </svg>
          </div>
          <div>
            <h3 className="text-lg font-bold text-orange-800">
              Perhatian Penting!
            </h3>
            <p className="mt-1 text-sm font-bold leading-relaxed text-orange-700 sm:text-base">
              Meskipun kamu dapat mengulang post-test ini nanti,{" "}
              <span className="underline decoration-2 underline-offset-2">
                hanya nilai pada percobaan pertama
              </span>{" "}
              yang akan dicetak secara permanen ke dalam Sertifikat Kelulusan.
              Kerjakan dengan teliti dan sungguh-sungguh!
            </p>
          </div>
        </section>

        {/* Start button */}
        <section className="rounded-4xl border-[3px] border-border bg-white p-4 shadow-sm sm:p-5">
          <button
            type="button"
            onClick={startTest}
            className="flex min-h-14 w-full items-center justify-center gap-2 rounded-2.5xl bg-accent px-5 py-3 text-lg font-bold text-white transition-all duration-200 hover:bg-accent-dark active:scale-[0.97]"
          >
            <TimerIcon className="size-5" />
            Mulai Post-test
          </button>
        </section>
      </main>
    );
  }

  // ── Feedback ────────────────────────────────────────────────
  if (testState === "feedback") {
    const emojis = [
      { rating: 1, emoji: "😢", label: "Kurang Suka" },
      { rating: 2, emoji: "😐", label: "Biasa Saja" },
      { rating: 3, emoji: "😊", label: "Suka" },
      { rating: 4, emoji: "🤩", label: "Sangat Suka!" },
    ];

    return (
      <main className="relative z-10 flex w-full max-w-4xl flex-1 flex-col gap-5">
        <section className="overflow-hidden rounded-3xl border-[3px] border-border bg-white shadow-sm sm:rounded-4xl p-6 sm:p-8 text-center flex flex-col items-center">
          <div className="shrink-0 mb-4 inline-flex items-center justify-center size-20 rounded-full bg-blue-100 text-blue-500">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="size-10"
            >
              <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
            </svg>
          </div>
          <h1 className="text-2xl font-extrabold text-foreground sm:text-3xl mb-2">
            Bagaimana perasaanmu setelah belajar?
          </h1>
          <p className="text-gray-500 font-semibold mb-8 max-w-lg mx-auto">
            Bantu kami menjadi lebih baik dengan memberikan pendapatmu tentang
            materi dan post-test hari ini ya!
          </p>

          <div className="flex flex-wrap justify-center gap-4 mb-8">
            {emojis.map((item) => (
              <button
                key={item.rating}
                type="button"
                onClick={() => setFeedbackRating(item.rating)}
                className={`flex flex-col items-center gap-2 rounded-2.5xl border-2 p-4 transition-all duration-200 active:scale-95 min-w-[100px] sm:min-w-[120px] ${
                  feedbackRating === item.rating
                    ? "border-primary bg-primary-container"
                    : "border-border bg-white hover:bg-background"
                }`}
              >
                <span className="text-4xl sm:text-5xl">{item.emoji}</span>
                <span
                  className={`text-sm sm:text-base font-bold ${feedbackRating === item.rating ? "text-primary" : "text-gray-500"}`}
                >
                  {item.label}
                </span>
              </button>
            ))}
          </div>

          <div className="text-left mb-8 w-full max-w-xl mx-auto">
            <label
              htmlFor="feedback-text"
              className="block text-sm font-bold text-gray-700 mb-2"
            >
              Ceritakan pengalamanmu belajar hari ini!{" "}
              <span className="text-error">*</span>
            </label>
            <textarea
              id="feedback-text"
              value={feedbackText}
              onChange={(e) => setFeedbackText(e.target.value)}
              placeholder="Ketik pesanmu di sini..."
              className="w-full rounded-2xl border-2 border-border bg-white p-4 text-sm font-semibold text-foreground placeholder:text-gray-400 focus:border-primary focus:outline-none focus:ring-4 focus:ring-primary/20 min-h-[120px] resize-none"
            ></textarea>
          </div>

          <button
            type="button"
            disabled={
              feedbackRating === 0 || feedbackText.trim() === "" || isSubmitting
            }
            onClick={handleFeedbackSubmit}
            className="inline-flex min-h-14 items-center justify-center gap-2 rounded-2.5xl bg-primary px-8 py-3 text-lg font-bold text-white transition-all duration-200 hover:bg-primary-dark active:scale-[0.97] disabled:bg-gray-300 disabled:active:scale-100"
          >
            {isSubmitting ? "Mengirim..." : "Kirim Feedback & Lihat Hasil"}
          </button>
        </section>
      </main>
    );
  }

  // ── Finished — show all questions with answers ─────────────
  if (testState === "finished") {
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
                  Post-test
                </p>
                <h1 className="text-xl font-bold leading-tight text-foreground sm:text-3xl">
                  Hasil Post-test
                </h1>
                <p className="mt-1 max-w-2xl text-sm font-semibold leading-relaxed text-gray-500 sm:mt-2 sm:text-base">
                  Selamat, {username}! Kamu sudah menyelesaikan post-test.
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
                    : formatTime(POSTTEST_DURATION_SECONDS - timeLeft)}
              </p>
              <p className="mt-1 text-[10px] font-bold leading-tight text-gray-500 sm:text-sm">
                Waktu terpakai
              </p>
            </div>
          </div>
        </section>

        {/* Appreciation card */}
        <AppreciationCard score={score} total={questions.length} />

        {/* Score summary card */}
        <section className="rounded-4xl border-[3px] border-border bg-white p-5 shadow-sm sm:p-6">
          <div className="flex flex-col items-center gap-1 text-center sm:flex-row sm:justify-between sm:text-left">
            <div>
              <h2 className="text-xl font-bold text-foreground">
                Hasil post-test: {score} dari {questions.length}
              </h2>
              <p className="mt-1 text-sm font-semibold text-gray-500">
                Nilai: {finalScorePercentage} — Waktu:{" "}
                {savedDuration !== null
                  ? formatTime(savedDuration)
                  : savedScore !== null
                    ? "-"
                    : formatTime(POSTTEST_DURATION_SECONDS - timeLeft)}
              </p>
            </div>
            <div className="mt-3 flex size-16 shrink-0 items-center justify-center rounded-2xl border-[3px] border-accent bg-[#E8F8F2] sm:mt-0">
              <span className="text-2xl font-bold text-accent">
                {finalScorePercentage}
              </span>
            </div>
          </div>
        </section>

        {/* Retake and Certificate */}
        <section className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {certificateId && (
            <Link
              href={`/certificate/${certificateId}`}
              className="flex min-h-14 items-center justify-center gap-2 rounded-2.5xl bg-primary px-5 py-3 text-lg font-bold text-white transition-all duration-200 hover:bg-primary-dark active:scale-[0.97]"
            >
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M12 15V3m0 12l-4-4m4 4l4-4M2 17l.621 2.485A2 2 0 0 0 4.561 21h14.878a2 2 0 0 0 1.94-1.515L22 17" />
              </svg>
              Unduh Sertifikat
            </Link>
          )}

          <button
            type="button"
            onClick={retakeTest}
            className="flex min-h-14 items-center justify-center gap-2 rounded-2.5xl border-2 border-border bg-white px-5 py-3 text-lg font-bold text-foreground transition-all duration-200 hover:bg-gray-50 active:scale-[0.97]"
          >
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
              <path d="M3 3v5h5" />
            </svg>
            Ulangi Post-test
          </button>
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
            {testQuestions.map((question, index) => {
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
                        savedScore !== null || isCorrect
                          ? "bg-accent"
                          : userAnswer === undefined
                            ? "bg-yellow-500"
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
                          savedScore !== null || isCorrect
                            ? "text-accent"
                            : userAnswer === undefined
                              ? "text-yellow-600"
                              : "text-error"
                        }`}
                      >
                        {savedScore !== null
                          ? `Jawaban benar: ${correctContent}`
                          : userAnswer === undefined
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

        {/* Bottom back button */}
        <section className="rounded-4xl border-[3px] border-border bg-white p-4 shadow-sm sm:p-5">
          <Link
            href="/"
            className="flex min-h-14 w-full items-center justify-center gap-2 rounded-2.5xl bg-primary px-5 py-3 text-lg font-bold text-white transition-all duration-200 hover:bg-primary-dark active:scale-[0.97]"
          >
            Kembali ke Beranda
          </Link>
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
              <p className="text-xs font-bold text-primary sm:text-sm">
                Post-test
              </p>
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
          {testQuestions.map((q, i) => {
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
              : `Selesai Post-test (${answeredCount}/${questions.length})`}
          </button>
        </div>
      </section>
    </main>
  );
}
