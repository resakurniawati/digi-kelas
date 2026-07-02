"use client";

import { useAuth } from "@/components/auth-provider";

import Link from "next/link";

import type { MaterialWithProgress, StepStatus } from "@/types/material";

import { useEffect, useState } from "react";
import { getAllMaterialsWithProgress } from "@/lib/progress";

// Use hardcoded materials as a fallback or loading skeleton if needed,
// but we'll fetch real data on mount.

function MaterialIcon({ type }: Readonly<{ type: string }>) {
  return (
    <img
      src={`/assets/${type.endsWith(".svg") ? type : `${type}.svg`}`}
      alt=""
      className="size-10 shrink-0 sm:size-[58px]"
    />
  );
}

function ButtonIcon({ type }: Readonly<{ type: string }>) {
  const common = {
    width: 18,
    height: 18,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 2.5,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    className: "size-[18px] shrink-0",
  };

  if (type === "book") {
    return (
      <svg {...common}>
        <path d="M4 19.5V5a2 2 0 0 1 2-2h11" />
        <path d="M6 17h11a2 2 0 0 1 0 4H6a2 2 0 0 1 0-4Z" />
      </svg>
    );
  }

  if (type === "video") {
    return (
      <svg {...common}>
        <rect x="3" y="5" width="14" height="14" rx="3" />
        <path d="m17 9 4-2v10l-4-2" />
      </svg>
    );
  }

  if (type === "worksheet") {
    return (
      <svg {...common}>
        <path d="M8 3h7l4 4v14H8a3 3 0 0 1-3-3V6a3 3 0 0 1 3-3Z" />
        <path d="M14 3v5h5" />
        <path d="M9 13h6M9 17h4" />
      </svg>
    );
  }

  if (type === "game") {
    return (
      <svg {...common}>
        <path d="M6 12h4M8 10v4" />
        <path d="M15 11h.01M18 14h.01" />
        <path d="M6 7h12a4 4 0 0 1 4 4v4a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4v-4a4 4 0 0 1 4-4Z" />
      </svg>
    );
  }

  if (type === "logout") {
    return (
      <svg {...common}>
        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
        <path d="M16 17l5-5-5-5" />
        <path d="M21 12H9" />
      </svg>
    );
  }

  if (type === "certificate") {
    return (
      <svg {...common}>
        <circle cx="12" cy="8" r="6" />
        <path d="M15.477 12.89 17 22l-5-3-5 3 1.523-9.11" />
      </svg>
    );
  }

  if (type === "info") {
    return (
      <svg {...common}>
        <circle cx="12" cy="12" r="10" />
        <path d="M12 16v-4" />
        <path d="M12 8h.01" />
      </svg>
    );
  }

  if (type === "check") {
    return (
      <svg {...common}>
        <path d="m5 12 4 4L19 6" />
      </svg>
    );
  }

  if (type === "trophy") {
    return (
      <svg {...common}>
        <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" />
        <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" />
        <path d="M4 22h16" />
        <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22" />
        <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22" />
        <path d="M18 2H6v7c0 3.31 2.69 6 6 6s6-2.69 6-6V2Z" />
      </svg>
    );
  }

  if (type === "pre-test") {
    return (
      <svg {...common}>
        <rect width="8" height="4" x="8" y="2" rx="1" ry="1" />
        <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
        <path d="M12 11h4" />
        <path d="M12 16h4" />
        <path d="M8 11h.01" />
        <path d="M8 16h.01" />
      </svg>
    );
  }

  if (type === "quiz") {
    return (
      <svg {...common}>
        <circle cx="12" cy="12" r="10" />
        <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
        <path d="M12 17h.01" />
      </svg>
    );
  }

  if (type === "post-test") {
    return (
      <svg {...common}>
        <circle cx="12" cy="8" r="7" />
        <polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88" />
      </svg>
    );
  }

  return (
    <svg {...common}>
      <path d="M12 5v14M5 12h14" />
    </svg>
  );
}

function StatusIcon({ status }: Readonly<{ status: StepStatus }>) {
  if (status === "locked") {
    return (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="opacity-50">
        <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
        <path d="M7 11V7a5 5 0 0 1 10 0v4" />
      </svg>
    );
  }
  if (status === "completed") {
    return (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
        <polyline points="22 4 12 14.01 9 11.01" />
      </svg>
    );
  }
  // available
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 12h14" />
      <path d="m12 5 7 7-7 7" />
    </svg>
  );
}

function ActionButton({
  children,
  href,
  icon,
  status = "available",
  variant = "primary",
}: Readonly<{
  children: React.ReactNode;
  href?: string;
  icon: string;
  status?: StepStatus;
  variant?: "primary" | "accent" | "light" | "gold";
}>) {
  const variantClass = {
    primary: "bg-primary text-white hover:bg-primary-dark",
    accent: "bg-accent text-white hover:bg-accent-dark",
    light: "border-2 border-border bg-white text-primary hover:bg-background",
    gold: "border-2 border-amber-300 bg-amber-50 text-amber-900 hover:bg-amber-100",
  }[variant as "primary" | "accent" | "light" | "gold"];
  const statusClass = {
    completed: "border-2 border-accent bg-[#E8F8F2] text-accent hover:bg-[#DDF7EC]",
    available: variantClass,
    locked:
      "border-2 border-gray-200 bg-gray-100 text-gray-400 cursor-not-allowed",
  }[status];
  const className = `flex min-h-10 sm:min-h-12 items-center justify-between gap-1.5 sm:gap-2 rounded-xl sm:rounded-2xl px-2.5 sm:px-3 py-2 sm:py-2.5 text-xs sm:text-sm font-bold leading-tight transition-all duration-200 active:scale-[0.97] ${statusClass}`;
  const content = (
    <>
      <span className="flex items-center gap-1.5 sm:gap-2">
        <ButtonIcon type={icon} />
        <span className="text-left line-clamp-2 leading-snug">{children}</span>
      </span>
      <span className="shrink-0 flex items-center justify-center p-1">
        <StatusIcon status={status} />
      </span>
    </>
  );

  if (href && status !== "locked") {
    return (
      <Link href={href} className={className}>
        {content}
      </Link>
    );
  }

  return (
    <button
      type="button"
      disabled={status === "locked"}
      className={`${className} disabled:active:scale-100`}
    >
      {content}
    </button>
  );
}

function Mascot() {
  return (
    <svg
      viewBox="0 0 88 88"
      fill="none"
      className="size-16 shrink-0 sm:size-[88px]"
    >
      <circle cx="44" cy="44" r="37" fill="#FFF3CD" stroke="#FFC107" strokeWidth="3" />
      <ellipse cx="32" cy="39" rx="6" ry="7" fill="white" />
      <ellipse cx="56" cy="39" rx="6" ry="7" fill="white" />
      <circle cx="33" cy="40" r="3.5" fill="#1a1a2e" />
      <circle cx="57" cy="40" r="3.5" fill="#1a1a2e" />
      <path d="M35 53q9 8 18 0" stroke="#1a1a2e" strokeWidth="2.5" strokeLinecap="round" />
      <ellipse cx="27" cy="48" rx="5" ry="3.5" fill="#FFB3B3" opacity="0.75" />
      <ellipse cx="61" cy="48" rx="5" ry="3.5" fill="#FFB3B3" opacity="0.75" />
      <path d="M19 68h50" stroke="#0984E3" strokeWidth="3" strokeLinecap="round" />
      <path d="M27 62h34l-5 9H32l-5-9Z" fill="#F0F9FF" stroke="#0984E3" strokeWidth="3" strokeLinejoin="round" />
    </svg>
  );
}

function SkeletonCard() {
  return (
    <article className="flex flex-col overflow-hidden rounded-3xl border-[3px] border-border bg-white shadow-sm sm:rounded-4xl pointer-events-none">
      <div className="flex items-center gap-3 border-b-[3px] border-border p-3 sm:gap-4 sm:p-4 bg-slate-50">
        <div className="flex size-16 shrink-0 items-center justify-center rounded-2xl bg-slate-200 shadow-sm sm:size-20 sm:rounded-3xl animate-pulse">
        </div>
        <div className="min-w-0 w-full flex flex-col gap-2">
          <div className="mb-1.5 flex flex-wrap items-center gap-1.5 sm:mb-2 sm:gap-2">
            <div className="w-14 h-4 bg-slate-200 rounded-full animate-pulse" />
            <div className="w-20 h-4 bg-slate-200 rounded-full animate-pulse" />
          </div>
          <div className="w-3/4 h-6 sm:h-8 bg-slate-200 rounded-lg animate-pulse" />
          <div className="w-full h-3 sm:h-4 bg-slate-200 rounded-lg animate-pulse" />
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-4 p-4">
        <div className="w-full h-12 sm:h-14 rounded-2.5xl border-2 border-dashed border-slate-200 bg-slate-50 animate-pulse" />

        <div className="flex flex-col gap-5 pt-1">
          <div className="flex flex-col gap-2.5">
            <div className="w-1/3 h-4 bg-slate-200 rounded-lg animate-pulse mb-1.5" />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <div className="w-full h-10 sm:h-12 bg-slate-200 rounded-xl sm:rounded-2xl animate-pulse" />
            </div>
          </div>
          
          <div className="flex flex-col gap-2.5">
            <div className="w-1/2 h-4 bg-slate-200 rounded-lg animate-pulse mb-1.5" />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <div className="w-full h-10 sm:h-12 bg-slate-200 rounded-xl sm:rounded-2xl animate-pulse" />
              <div className="w-full h-10 sm:h-12 bg-slate-200 rounded-xl sm:rounded-2xl animate-pulse" />
              <div className="w-full h-10 sm:h-12 bg-slate-200 rounded-xl sm:rounded-2xl animate-pulse" />
              <div className="w-full h-10 sm:h-12 bg-slate-200 rounded-xl sm:rounded-2xl animate-pulse" />
            </div>
          </div>

          <div className="flex flex-col gap-2.5">
            <div className="w-1/3 h-4 bg-slate-200 rounded-lg animate-pulse mb-1.5" />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <div className="w-full h-10 sm:h-12 bg-slate-200 rounded-xl sm:rounded-2xl animate-pulse" />
              <div className="w-full h-10 sm:h-12 bg-slate-200 rounded-xl sm:rounded-2xl animate-pulse" />
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}

export default function HomePage() {
  const { logout, username } = useAuth();
  const [materials, setMaterials] = useState<MaterialWithProgress[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    const sessionId = localStorage.getItem("session_id");
    
    if (!sessionId) {
      // Delay state update to avoid synchronous setState inside useEffect error
      Promise.resolve().then(() => {
        if (isMounted) setIsLoading(false);
      });
      return;
    }

    getAllMaterialsWithProgress(sessionId)
      .then((data) => {
        if (isMounted) {
          setMaterials(data);
          setIsLoading(false);
        }
      })
      .catch((err) => {
        console.error("Failed to load progress:", err);
        if (isMounted) setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const totalMateri = materials.length;
  let totalSteps = 0;
  let completedSteps = 0;

  materials.forEach(m => {
    const steps = [
      m.progress.pretest,
      m.progress.emodul,
      m.progress.video,
      m.progress.lkpd,
      m.progress.minigame,
      m.progress.quiz,
      m.progress.posttest
    ];
    totalSteps += steps.length;
    completedSteps += steps.filter(s => s === "completed").length;
  });

  const progressPercentage = totalSteps > 0 ? Math.round((completedSteps / totalSteps) * 100) : 0;

  return (
    <main className="relative z-10 flex w-full max-w-6xl flex-1 flex-col gap-4 sm:gap-5">
      <section className="overflow-hidden rounded-3xl border-[3px] border-border bg-white shadow-sm sm:rounded-4xl">
        <div className="flex flex-col gap-4 p-4 sm:gap-5 sm:p-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-row items-center gap-3 sm:gap-4">
            <div className="shrink-0 animate-float">
              <Mascot />
            </div>

            <div className="text-left">
              <h1 className="text-xl font-bold leading-tight text-foreground sm:text-3xl">
                Hai, {username}! 👋
              </h1>
              <p className="mt-1 text-sm font-semibold leading-relaxed text-gray-500 sm:mt-2 sm:text-base">
                Siap belajar sambil bermain hari ini?
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 sm:flex sm:w-auto sm:gap-3 sm:flex-wrap sm:justify-end">
            <Link
              href="/leaderboard"
              className="flex min-h-10 items-center justify-center gap-2 rounded-2xl border-2 border-border bg-[#FFF9E6] px-3 py-2 text-sm font-bold text-[#B07D00] transition-all duration-200 hover:bg-white active:scale-[0.97] sm:min-h-12 sm:rounded-2.5xl sm:px-5 sm:py-3 sm:text-base"
            >
              <ButtonIcon type="trophy" />
              <span className="truncate">Peringkat</span>
            </Link>

            <Link
              href="/about"
              className="flex min-h-10 items-center justify-center gap-2 rounded-2xl border-2 border-border bg-primary-container px-3 py-2 text-sm font-bold text-primary transition-all duration-200 hover:bg-white active:scale-[0.97] sm:min-h-12 sm:rounded-2.5xl sm:px-5 sm:py-3 sm:text-base"
            >
              <ButtonIcon type="info" />
              <span className="truncate">Tentang</span>
            </Link>

            <Link
              href="/change-pin"
              className="flex min-h-10 items-center justify-center gap-2 rounded-2xl border-2 border-border bg-slate-100 px-3 py-2 text-sm font-bold text-slate-700 transition-all duration-200 hover:bg-white active:scale-[0.97] sm:min-h-12 sm:rounded-2.5xl sm:px-5 sm:py-3 sm:text-base"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="size-[18px] shrink-0">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
              <span className="truncate">Ubah PIN</span>
            </Link>

            <button
              type="button"
              onClick={logout}
              className="flex min-h-10 items-center justify-center gap-2 rounded-2xl border-2 border-error-border bg-error-bg px-3 py-2 text-sm font-bold text-error transition-all duration-200 hover:bg-white active:scale-[0.97] sm:min-h-12 sm:rounded-2.5xl sm:px-5 sm:py-3 sm:text-base"
            >
              <ButtonIcon type="logout" />
              <span className="truncate">Keluar</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-3 divide-x-[3px] divide-border border-t-[3px] border-border bg-primary-container">
          <div className="px-2 py-3 text-center sm:px-5 sm:py-4">
            <p className="flex justify-center text-xl font-bold text-primary sm:text-2xl">{isLoading ? <span className="inline-block w-6 h-7 sm:w-8 sm:h-8 bg-primary/20 rounded-md animate-pulse"></span> : totalMateri}</p>
            <p className="mt-1 text-[10px] font-bold leading-tight text-gray-500 sm:text-sm">Materi<br className="sm:hidden" /> tersedia</p>
          </div>
          <div className="px-2 py-3 text-center sm:px-5 sm:py-4">
            <p className="flex justify-center text-xl font-bold text-accent sm:text-2xl">{isLoading ? <span className="inline-block w-6 h-7 sm:w-8 sm:h-8 bg-accent/20 rounded-md animate-pulse"></span> : completedSteps}</p>
            <p className="mt-1 text-[10px] font-bold leading-tight text-gray-500 sm:text-sm">Langkah<br className="sm:hidden" /> belajar</p>
          </div>
          <div className="px-2 py-3 text-center sm:px-5 sm:py-4">
            <p className="flex justify-center text-xl font-bold text-primary sm:text-2xl">{isLoading ? <span className="inline-block w-10 h-7 sm:w-12 sm:h-8 bg-primary/20 rounded-md animate-pulse"></span> : `${progressPercentage}%`}</p>
            <p className="mt-1 text-[10px] font-bold leading-tight text-gray-500 sm:text-sm">Progres<br className="sm:hidden" /> belajar</p>
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2">
        {isLoading ? (
          <>
            <SkeletonCard />
            <SkeletonCard />
          </>
        ) : materials.length === 0 ? (
          <div className="col-span-full py-12 text-center text-sm font-bold text-gray-400">
            Belum ada materi.
          </div>
        ) : (
          materials.map((material) => {
          const completedCount = Object.values(material.progress).filter(status => status === "completed").length;
          const progressText = completedCount > 0 ? `${completedCount} selesai` : "Belum mulai";
          
          return (
            <article
              key={material.id}
              className="flex flex-col overflow-hidden rounded-3xl border-[3px] border-border bg-white shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-[0_10px_24px_rgba(9,132,227,0.18)] sm:rounded-4xl"
            >
              <div className={`flex items-center gap-3 border-b-[3px] border-border p-3 sm:gap-4 sm:p-4 ${material.theme}`}>
                <div className="flex size-16 shrink-0 items-center justify-center rounded-2xl bg-white shadow-sm sm:size-20 sm:rounded-3xl">
                  <MaterialIcon type={material.icon} />
                </div>
                <div className="min-w-0">
                  <div className="mb-1.5 flex flex-wrap items-center gap-1.5 sm:mb-2 sm:gap-2">
                    <span className="rounded-full bg-white px-2.5 py-0.5 text-[10px] font-bold text-primary shadow-sm sm:px-3 sm:py-1 sm:text-xs">
                      Misi {material.misi}
                    </span>
                    <span className="rounded-full bg-white px-2.5 py-0.5 text-[10px] font-bold text-accent shadow-sm sm:px-3 sm:py-1 sm:text-xs">
                      {progressText}
                    </span>
                  </div>
                  <h2 className="text-xl font-bold leading-tight text-foreground sm:text-2xl">
                    {material.title}
                  </h2>
                  <p className="mt-0.5 text-xs font-bold leading-relaxed text-gray-600 sm:mt-1 sm:text-sm">
                    {material.description}
                  </p>
                </div>
              </div>

              <div className="flex flex-1 flex-col gap-4 p-4">
                <p className="rounded-2.5xl border-2 border-dashed border-border bg-background px-4 py-3 text-sm font-bold leading-relaxed text-gray-600">
                  {material.tip}
                </p>

                <div className="flex flex-col gap-5 pt-1">
                  <div className="flex flex-col gap-2.5">
                    <p className="text-sm font-bold text-primary border-b-2 border-border/50 pb-1.5">Persiapan Belajar</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      <ActionButton
                        href={`/pre-test/${material.slug}`}
                        icon="pre-test"
                        status={material.progress.pretest}
                        variant="accent"
                      >
                        Pre-test
                      </ActionButton>
                    </div>
                  </div>

                  <div className="flex flex-col gap-2.5">
                    <p className="text-sm font-bold text-primary border-b-2 border-border/50 pb-1.5">Eksplorasi & Aktivitas</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      <ActionButton
                        href={`/materi/${material.slug}`}
                        icon="book"
                        status={material.progress.emodul}
                        variant="light"
                      >
                        E-Modul
                      </ActionButton>
                      <ActionButton
                        href={`/video/${material.slug}`}
                        icon="video"
                        status={material.progress.video}
                        variant="light"
                      >
                        Video Pembelajaran
                      </ActionButton>
                      <ActionButton
                        href={`/lkpd/${material.slug}`}
                        icon="worksheet"
                        status={material.progress.lkpd}
                        variant="light"
                      >
                        LKPD
                      </ActionButton>
                      <ActionButton
                        href={`/minigame/${material.slug}`}
                        icon="game"
                        status={material.progress.minigame}
                        variant="light"
                      >
                        Mini-Game
                      </ActionButton>
                    </div>
                  </div>

                  <div className="flex flex-col gap-2.5">
                    <p className="text-sm font-bold text-primary border-b-2 border-border/50 pb-1.5">Evaluasi Akhir</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      <ActionButton
                        href={`/quiz/${material.slug}`}
                        icon="quiz"
                        status={material.progress.quiz}
                      >
                        Quiz
                      </ActionButton>
                      <ActionButton
                        href={`/post-test/${material.slug}`}
                        icon="post-test"
                        status={material.progress.posttest}
                      >
                        Post-test
                      </ActionButton>
                    </div>
                  </div>

                  {material.certificateId && (
                    <div className="flex flex-col gap-2.5">
                      <p className="text-sm font-bold text-accent border-b-2 border-border/50 pb-1.5">Penghargaan</p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                        <ActionButton
                          href={`/certificate/${material.certificateId}`}
                          icon="certificate"
                          status="available"
                          variant="gold"
                        >
                          Sertifikat Kelulusan
                        </ActionButton>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </article>
          );
        }))}
      </section>
    </main>
  );
}
