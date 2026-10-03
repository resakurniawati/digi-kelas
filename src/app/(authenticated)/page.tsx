"use client";

import { useAuth } from "@/components/auth-provider";
import Link from "next/link";
import type {
  CourseProgress,
  MaterialWithProgress,
  StepStatus,
} from "@/types/material";
import { useEffect, useState, useRef, useCallback } from "react";
import { getAllMaterialsWithProgress } from "@/lib/progress";
import {
  ChevronLeft,
  ChevronRight,
  Check,
  Lock,
  Sparkles,
} from "lucide-react";
import { motion, AnimatePresence, type Variants } from "framer-motion";

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
      <svg
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="opacity-50"
      >
        <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
        <path d="M7 11V7a5 5 0 0 1 10 0v4" />
      </svg>
    );
  }
  if (status === "completed") {
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
      >
        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
        <polyline points="22 4 12 14.01 9 11.01" />
      </svg>
    );
  }
  // available
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
    >
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
  onClick,
}: Readonly<{
  children: React.ReactNode;
  href?: string;
  icon: string;
  status?: StepStatus;
  variant?: "primary" | "accent" | "light" | "gold";
  onClick?: () => void;
}>) {
  const variantClass = {
    primary: "bg-primary text-white hover:bg-primary-dark",
    accent: "bg-accent text-white hover:bg-accent-dark",
    light: "border-2 border-border bg-white text-primary hover:bg-background",
    gold: "border-2 border-amber-300 bg-amber-50 text-amber-900 hover:bg-amber-100",
  }[variant as "primary" | "accent" | "light" | "gold"];
  const statusClass = {
    completed:
      "border-2 border-accent bg-[#E8F8F2] text-accent hover:bg-[#DDF7EC]",
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
      onClick={onClick}
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
      <circle
        cx="44"
        cy="44"
        r="37"
        fill="#FFF3CD"
        stroke="#FFC107"
        strokeWidth="3"
      />
      <ellipse cx="32" cy="39" rx="6" ry="7" fill="white" />
      <ellipse cx="56" cy="39" rx="6" ry="7" fill="white" />
      <circle cx="33" cy="40" r="3.5" fill="#1a1a2e" />
      <circle cx="57" cy="40" r="3.5" fill="#1a1a2e" />
      <path
        d="M35 53q9 8 18 0"
        stroke="#1a1a2e"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
      <ellipse cx="27" cy="48" rx="5" ry="3.5" fill="#FFB3B3" opacity="0.75" />
      <ellipse cx="61" cy="48" rx="5" ry="3.5" fill="#FFB3B3" opacity="0.75" />
      <path
        d="M19 68h50"
        stroke="#0984E3"
        strokeWidth="3"
        strokeLinecap="round"
      />
      <path
        d="M27 62h34l-5 9H32l-5-9Z"
        fill="#F0F9FF"
        stroke="#0984E3"
        strokeWidth="3"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function SkeletonGallery() {
  return (
    <div className="flex flex-col gap-3 sm:gap-4 pointer-events-none animate-pulse">
      {/* Skeleton Pill Selector */}
      <div className="flex items-center gap-2 overflow-x-auto rounded-2xl sm:rounded-3xl border-[3px] border-border bg-white p-2 sm:p-2.5 shadow-sm no-scrollbar">
        <div className="h-9 w-24 rounded-xl bg-slate-200 shrink-0" />
        <div className="h-9 w-18 rounded-xl bg-slate-200 shrink-0" />
        <div className="h-9 w-18 rounded-xl bg-slate-200 shrink-0" />
        <div className="h-9 w-18 rounded-xl bg-slate-200 shrink-0" />
        <div className="h-9 w-18 rounded-xl bg-slate-200 shrink-0" />
        <div className="h-9 w-18 rounded-xl bg-slate-200 shrink-0" />
        <div className="h-9 w-18 rounded-xl bg-slate-200 shrink-0" />
        <div className="h-9 w-24 rounded-xl bg-slate-200 shrink-0" />
      </div>

      {/* Skeleton Single Card */}
      <article className="flex flex-col overflow-hidden rounded-3xl border-[3px] border-border bg-white shadow-sm sm:rounded-4xl">
        <div className="flex items-center gap-3 border-b-[3px] border-border p-4 sm:gap-4 sm:p-5 bg-slate-50">
          <div className="flex size-16 shrink-0 items-center justify-center rounded-2xl bg-slate-200 shadow-sm sm:size-20 sm:rounded-3xl" />
          <div className="min-w-0 w-full flex flex-col gap-2">
            <div className="mb-1 flex flex-wrap items-center gap-1.5 sm:gap-2">
              <div className="w-16 h-5 bg-slate-200 rounded-full" />
              <div className="w-20 h-5 bg-slate-200 rounded-full" />
            </div>
            <div className="w-2/3 h-6 sm:h-8 bg-slate-200 rounded-lg" />
            <div className="w-full h-4 bg-slate-200 rounded-lg" />
          </div>
        </div>

        <div className="flex flex-1 flex-col gap-4 p-4 sm:p-6">
          <div className="w-full h-12 sm:h-14 rounded-2.5xl border-2 border-dashed border-slate-200 bg-slate-50" />

          <div className="flex flex-col gap-5 pt-1">
            <div className="flex flex-col gap-2.5">
              <div className="w-1/3 h-4 bg-slate-200 rounded-lg mb-1" />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div className="w-full h-11 sm:h-12 bg-slate-200 rounded-xl sm:rounded-2xl" />
                <div className="w-full h-11 sm:h-12 bg-slate-200 rounded-xl sm:rounded-2xl" />
                <div className="w-full h-11 sm:h-12 bg-slate-200 rounded-xl sm:rounded-2xl" />
                <div className="w-full h-11 sm:h-12 bg-slate-200 rounded-xl sm:rounded-2xl" />
              </div>
            </div>

            <div className="flex flex-col gap-2.5">
              <div className="w-1/4 h-4 bg-slate-200 rounded-lg mb-1" />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div className="w-full h-11 sm:h-12 bg-slate-200 rounded-xl sm:rounded-2xl" />
              </div>
            </div>
          </div>
        </div>
      </article>

      {/* Skeleton Bottom Bar */}
      <div className="flex items-center justify-between rounded-2xl sm:rounded-3xl border-[3px] border-border bg-white p-3 sm:p-4 shadow-sm">
        <div className="h-10 w-28 rounded-xl bg-slate-200" />
        <div className="flex flex-col items-center gap-1.5">
          <div className="h-4 w-36 rounded bg-slate-200" />
          <div className="h-2 w-24 rounded bg-slate-200" />
        </div>
        <div className="h-10 w-28 rounded-xl bg-slate-200" />
      </div>
    </div>
  );
}

type GalleryItem =
  | { type: "pretest" }
  | { type: "material"; material: MaterialWithProgress; index: number }
  | { type: "posttest" };

const slideVariants: Variants = {
  enter: (direction: number) => ({
    x: direction === 0 ? 0 : direction > 0 ? 45 : -45,
    opacity: 0,
    scale: 0.99,
  }),
  center: {
    x: 0,
    opacity: 1,
    scale: 1,
    transition: {
      duration: 0.26,
      ease: [0.16, 1, 0.3, 1] as [number, number, number, number],
    },
  },
  exit: (direction: number) => ({
    x: direction === 0 ? 0 : direction > 0 ? -45 : 45,
    opacity: 0,
    scale: 0.99,
    transition: {
      duration: 0.18,
      ease: [0.16, 1, 0.3, 1] as [number, number, number, number],
    },
  }),
};

export default function HomePage() {
  const { logout, username } = useAuth();
  const [materials, setMaterials] = useState<MaterialWithProgress[]>([]);
  const [course, setCourse] = useState<CourseProgress>({
    pretest: "locked",
    posttest: "locked",
  });
  const [certificateId, setCertificateId] = useState<string | undefined>(
    undefined,
  );
  const [isLoading, setIsLoading] = useState(true);

  // Gallery Navigation State
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(0);
  const hasInitializedIndex = useRef(false);

  // Touch swipe refs
  const touchStartX = useRef<number | null>(null);
  const touchStartY = useRef<number | null>(null);

  useEffect(() => {
    let isMounted = true;
    const sessionId = localStorage.getItem("session_id");

    if (!sessionId) {
      Promise.resolve().then(() => {
        if (isMounted) setIsLoading(false);
      });
      return;
    }

    getAllMaterialsWithProgress(sessionId)
      .then((data) => {
        if (isMounted) {
          setMaterials(data.materials);
          setCourse(data.course);
          setCertificateId(data.certificateId);
          setIsLoading(false);

          // Smart initial index determination (only once on load)
          if (!hasInitializedIndex.current && data.materials.length > 0) {
            hasInitializedIndex.current = true;
            if (data.course.pretest !== "completed") {
              setCurrentIndex(0); // Pre-test
            } else {
              // Find first mission where quiz is not completed
              const firstIncompleteIdx = data.materials.findIndex(
                (m) => m.progress.quiz !== "completed",
              );
              if (firstIncompleteIdx !== -1) {
                setCurrentIndex(firstIncompleteIdx + 1); // +1 because item 0 is pretest
              } else if (data.course.posttest !== "completed") {
                setCurrentIndex(data.materials.length + 1); // Post-test
              } else {
                // If everything completed, start at Misi 1
                setCurrentIndex(1);
              }
            }
          }
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
  let totalSteps = materials.length > 0 ? 2 : 0; // pretest + posttest
  let completedSteps =
    (course.pretest === "completed" ? 1 : 0) +
    (course.posttest === "completed" ? 1 : 0);

  materials.forEach((m) => {
    const steps = [
      m.progress.emodul,
      m.progress.video,
      m.progress.lkpd,
      m.progress.minigame,
      m.progress.quiz,
    ];
    totalSteps += steps.length;
    completedSteps += steps.filter((s) => s === "completed").length;
  });

  const progressPercentage =
    totalSteps > 0 ? Math.round((completedSteps / totalSteps) * 100) : 0;

  // Build the list of gallery items: Pre-test -> Materials -> Post-test
  const galleryItems: GalleryItem[] = materials.length > 0
    ? [
        { type: "pretest" },
        ...materials.map((m, idx) => ({
          type: "material" as const,
          material: m,
          index: idx,
        })),
        { type: "posttest" },
      ]
    : [];

  const handleSelectIndex = useCallback(
    (index: number) => {
      if (index === currentIndex) return;
      setDirection(index > currentIndex ? 1 : -1);
      setCurrentIndex(index);
    },
    [currentIndex],
  );

  const handleNext = useCallback(() => {
    if (currentIndex < galleryItems.length - 1) {
      setDirection(1);
      setCurrentIndex((prev) => prev + 1);
    }
  }, [currentIndex, galleryItems.length]);

  const handlePrev = useCallback(() => {
    if (currentIndex > 0) {
      setDirection(-1);
      setCurrentIndex((prev) => prev - 1);
    }
  }, [currentIndex]);

  // Keyboard navigation (ArrowLeft & ArrowRight)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (["INPUT", "TEXTAREA"].includes((e.target as HTMLElement)?.tagName)) {
        return;
      }
      if (e.key === "ArrowLeft") {
        handlePrev();
      } else if (e.key === "ArrowRight") {
        handleNext();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handlePrev, handleNext]);

  // Touch swipe handling
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null || touchStartY.current === null) return;
    const deltaX = e.changedTouches[0].clientX - touchStartX.current;
    const deltaY = e.changedTouches[0].clientY - touchStartY.current;
    touchStartX.current = null;
    touchStartY.current = null;

    // Detect strong horizontal swipe while ignoring vertical scrolling
    if (Math.abs(deltaX) > 45 && Math.abs(deltaX) > Math.abs(deltaY) * 1.4) {
      if (deltaX < 0) {
        handleNext();
      } else {
        handlePrev();
      }
    }
  };

  const currentItem = galleryItems[currentIndex];

  let currentTitle = "";
  if (currentItem) {
    if (currentItem.type === "pretest") {
      currentTitle = "Tahap Persiapan: Pre-test";
    } else if (currentItem.type === "material") {
      currentTitle = `Misi ${currentItem.material.misi} dari ${materials.length}: ${currentItem.material.title}`;
    } else if (currentItem.type === "posttest") {
      currentTitle = "Tahap Akhir: Post-test & Sertifikat";
    }
  }

  return (
    <main className="relative z-10 flex w-full max-w-5xl flex-1 flex-col gap-4 sm:gap-5 mx-auto">
      {/* Top Header Card */}
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
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="size-[18px] shrink-0"
              >
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
            <p className="flex justify-center text-xl font-bold text-primary sm:text-2xl">
              {isLoading ? (
                <span className="inline-block w-6 h-7 sm:w-8 sm:h-8 bg-primary/20 rounded-md animate-pulse"></span>
              ) : (
                totalMateri
              )}
            </p>
            <p className="mt-1 text-[10px] font-bold leading-tight text-gray-500 sm:text-sm">
              Materi
              <br className="sm:hidden" /> tersedia
            </p>
          </div>
          <div className="px-2 py-3 text-center sm:px-5 sm:py-4">
            <p className="flex justify-center text-xl font-bold text-accent sm:text-2xl">
              {isLoading ? (
                <span className="inline-block w-6 h-7 sm:w-8 sm:h-8 bg-accent/20 rounded-md animate-pulse"></span>
              ) : (
                completedSteps
              )}
            </p>
            <p className="mt-1 text-[10px] font-bold leading-tight text-gray-500 sm:text-sm">
              Langkah
              <br className="sm:hidden" /> belajar
            </p>
          </div>
          <div className="px-2 py-3 text-center sm:px-5 sm:py-4">
            <p className="flex justify-center text-xl font-bold text-primary sm:text-2xl">
              {isLoading ? (
                <span className="inline-block w-10 h-7 sm:w-12 sm:h-8 bg-primary/20 rounded-md animate-pulse"></span>
              ) : (
                `${progressPercentage}%`
              )}
            </p>
            <p className="mt-1 text-[10px] font-bold leading-tight text-gray-500 sm:text-sm">
              Progres
              <br className="sm:hidden" /> belajar
            </p>
          </div>
        </div>
      </section>

      {/* Main Single Card Gallery Section */}
      {isLoading ? (
        <SkeletonGallery />
      ) : materials.length === 0 ? (
        <section className="overflow-hidden rounded-3xl border-[3px] border-border bg-white p-12 text-center shadow-sm sm:rounded-4xl">
          <p className="text-base font-bold text-gray-400">
            Belum ada materi pembelajaran yang tersedia saat ini.
          </p>
        </section>
      ) : (
        <section className="flex flex-col gap-3 sm:gap-4">
          {/* Gallery Top Navigation Strip (Pills / Thumbnails) */}
          <div className="flex items-center gap-2 overflow-x-auto rounded-2xl sm:rounded-3xl border-[3px] border-border bg-white p-2 sm:p-2.5 shadow-sm no-scrollbar">
            <div className="flex items-center gap-1.5 pl-1 pr-2 text-xs font-bold text-primary shrink-0">
              <Sparkles className="size-4" />
              <span className="hidden sm:inline">Galeri Belajar:</span>
            </div>

            {/* Pre-test Pill */}
            <button
              type="button"
              onClick={() => handleSelectIndex(0)}
              className={`flex shrink-0 items-center gap-1.5 rounded-xl sm:rounded-2xl px-3 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm font-bold transition-all duration-200 active:scale-95 ${
                currentIndex === 0
                  ? "bg-primary text-white shadow-sm ring-2 ring-primary/30"
                  : course.pretest === "completed"
                  ? "bg-[#E8F8F2] text-accent hover:bg-[#DDF7EC]"
                  : "bg-slate-100 text-slate-700 hover:bg-slate-200"
              }`}
            >
              <ButtonIcon type="pre-test" />
              <span>Pre-test</span>
              {course.pretest === "completed" && (
                <span className="flex size-4 items-center justify-center rounded-full bg-accent text-white">
                  <Check className="size-2.5 stroke-[3]" />
                </span>
              )}
            </button>

            {/* Mission Pills */}
            {materials.map((m, idx) => {
              const missionIndex = idx + 1; // +1 because item 0 is pretest
              const isActive = currentIndex === missionIndex;
              const isMissionCompleted = Object.values(m.progress).every(
                (status) => status === "completed",
              );
              const isMissionLocked = m.progress.emodul === "locked";

              return (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => handleSelectIndex(missionIndex)}
                  className={`flex shrink-0 items-center gap-1.5 rounded-xl sm:rounded-2xl px-3 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm font-bold transition-all duration-200 active:scale-95 ${
                    isActive
                      ? "bg-primary text-white shadow-sm ring-2 ring-primary/30"
                      : isMissionCompleted
                      ? "bg-[#E8F8F2] text-accent hover:bg-[#DDF7EC]"
                      : isMissionLocked
                      ? "bg-slate-100 text-slate-400 hover:bg-slate-200"
                      : "bg-primary-container text-primary hover:bg-blue-100"
                  }`}
                >
                  <span>Misi {m.misi}</span>
                  {isMissionCompleted ? (
                    <span className="flex size-4 items-center justify-center rounded-full bg-accent text-white">
                      <Check className="size-2.5 stroke-[3]" />
                    </span>
                  ) : isMissionLocked ? (
                    <Lock className="size-3 opacity-60" />
                  ) : null}
                </button>
              );
            })}

            {/* Post-test Pill */}
            {(() => {
              const posttestIndex = galleryItems.length - 1;
              const isPosttestActive = currentIndex === posttestIndex;
              const isPosttestCompleted = course.posttest === "completed";
              const isPosttestLocked = course.posttest === "locked";

              return (
                <button
                  type="button"
                  onClick={() => handleSelectIndex(posttestIndex)}
                  className={`flex shrink-0 items-center gap-1.5 rounded-xl sm:rounded-2xl px-3 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm font-bold transition-all duration-200 active:scale-95 ${
                    isPosttestActive
                      ? "bg-primary text-white shadow-sm ring-2 ring-primary/30"
                      : isPosttestCompleted
                      ? "bg-[#E8F8F2] text-accent hover:bg-[#DDF7EC]"
                      : isPosttestLocked
                      ? "bg-slate-100 text-slate-400 hover:bg-slate-200"
                      : "bg-amber-100 text-amber-800 hover:bg-amber-200"
                  }`}
                >
                  <ButtonIcon type="post-test" />
                  <span>Post-test</span>
                  {isPosttestCompleted ? (
                    <span className="flex size-4 items-center justify-center rounded-full bg-accent text-white">
                      <Check className="size-2.5 stroke-[3]" />
                    </span>
                  ) : isPosttestLocked ? (
                    <Lock className="size-3 opacity-60" />
                  ) : null}
                </button>
              );
            })()}
          </div>

          {/* Card Viewport Container with Desktop Side Nav Arrows */}
          <div className="relative flex items-center justify-center w-full">
            {/* Desktop Left Chevron Button */}
            <button
              type="button"
              onClick={handlePrev}
              disabled={currentIndex === 0}
              aria-label="Kartu Sebelumnya"
              className="hidden lg:flex absolute -left-6 xl:-left-16 z-20 size-12 xl:size-14 items-center justify-center rounded-2xl xl:rounded-3xl border-[3px] border-border bg-white text-primary shadow-md transition-all duration-200 hover:bg-primary hover:text-white hover:border-primary active:scale-90 disabled:opacity-20 disabled:pointer-events-none"
            >
              <ChevronLeft className="size-6 xl:size-7" />
            </button>

            {/* Single Card Slide Container */}
            <div
              className="w-full overflow-hidden rounded-3xl sm:rounded-4xl"
              onTouchStart={handleTouchStart}
              onTouchEnd={handleTouchEnd}
            >
              <AnimatePresence mode="wait" custom={direction}>
                <motion.div
                  key={currentIndex}
                  custom={direction}
                  variants={slideVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  className="w-full"
                >
                  {/* CARD TYPE 1: PRE-TEST */}
                  {currentItem.type === "pretest" && (
                    <article className="flex flex-col overflow-hidden rounded-3xl border-[3px] border-border bg-white shadow-sm sm:rounded-4xl">
                      {/* Card Header */}
                      <div className="flex items-center gap-3 border-b-[3px] border-border p-4 sm:gap-4 sm:p-5 bg-[#E0F2FE]">
                        <div className="flex size-16 shrink-0 items-center justify-center rounded-2xl bg-white shadow-sm sm:size-20 sm:rounded-3xl border-2 border-[#BAE6FD]">
                          <svg
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="#0284C7"
                            strokeWidth="2.2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="size-9 sm:size-11"
                          >
                            <rect width="8" height="4" x="8" y="2" rx="1" ry="1" />
                            <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
                            <path d="M12 11h4" />
                            <path d="M12 16h4" />
                            <path d="M8 11h.01" />
                            <path d="M8 16h.01" />
                          </svg>
                        </div>
                        <div className="min-w-0">
                          <div className="mb-1.5 flex flex-wrap items-center gap-1.5 sm:mb-2 sm:gap-2">
                            <span className="rounded-full bg-white px-2.5 py-0.5 text-[10px] font-bold text-primary shadow-sm sm:px-3 sm:py-1 sm:text-xs">
                              Tahap Persiapan
                            </span>
                            <span
                              className={`rounded-full bg-white px-2.5 py-0.5 text-[10px] font-bold shadow-sm sm:px-3 sm:py-1 sm:text-xs ${
                                course.pretest === "completed"
                                  ? "text-accent"
                                  : "text-primary"
                              }`}
                            >
                              {course.pretest === "completed"
                                ? "Selesai"
                                : "Tersedia"}
                            </span>
                          </div>
                          <h2 className="text-xl font-bold leading-tight text-foreground sm:text-2xl">
                            Pre-test Kemampuan Awal
                          </h2>
                          <p className="mt-0.5 text-xs font-bold leading-relaxed text-gray-600 sm:mt-1 sm:text-sm">
                            Ukur kemampuan awalmu sebelum membuka petualangan misi
                            bangun ruang kubus dan balok.
                          </p>
                        </div>
                      </div>

                      {/* Card Body */}
                      <div className="flex flex-1 flex-col gap-4 p-4 sm:p-6">
                        <p className="rounded-2.5xl border-2 border-dashed border-border bg-background px-4 py-3 text-sm font-bold leading-relaxed text-gray-600">
                          💡 Jangan takut salah jika belum tahu semua jawabannya!
                          Pre-test ini diadakan untuk melihat sejauh mana kamu
                          sudah mengenal kubus dan balok.
                        </p>

                        <div className="flex flex-col gap-4 pt-1">
                          <div className="rounded-2xl border-2 border-border/70 bg-primary-container p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                            <div>
                              <h3 className="text-base sm:text-lg font-bold text-foreground">
                                {course.pretest === "completed"
                                  ? "Kamu sudah menyelesaikan Pre-test! 🎉"
                                  : "Siap menguji pengetahuan awalmu?"}
                              </h3>
                              <p className="mt-1 text-xs sm:text-sm font-semibold text-gray-600">
                                {course.pretest === "completed"
                                  ? "Misi 1 sekarang telah terbuka. Silakan lanjut ke Misi 1 untuk mulai belajar!"
                                  : "Selesaikan pre-test ini untuk membuka Misi 1 dan memulai perjalanan belajarmu."}
                              </p>
                            </div>
                            <div className="w-full sm:w-60 shrink-0">
                              <ActionButton
                                href="/pre-test"
                                icon="pre-test"
                                status={course.pretest}
                                variant="accent"
                              >
                                {course.pretest === "completed"
                                  ? "Lihat Pre-test"
                                  : "Mulai Pre-test"}
                              </ActionButton>
                            </div>
                          </div>

                          {course.pretest === "completed" && (
                            <div className="flex justify-end pt-1">
                              <button
                                type="button"
                                onClick={() => handleSelectIndex(1)}
                                className="flex items-center gap-2 rounded-2xl border-2 border-primary bg-primary px-4 py-2.5 text-xs sm:text-sm font-bold text-white shadow-sm transition-all hover:bg-primary-dark active:scale-95"
                              >
                                <span>Lanjut ke Misi 1: {materials[0]?.title}</span>
                                <ChevronRight className="size-4" />
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </article>
                  )}

                  {/* CARD TYPE 2: MATERIAL MISSION (MISI 1..6) */}
                  {currentItem.type === "material" && (
                    <article className="flex flex-col overflow-hidden rounded-3xl border-[3px] border-border bg-white shadow-sm sm:rounded-4xl">
                      {/* Card Header with Material Theme */}
                      <div
                        className={`flex items-center gap-3 border-b-[3px] border-border p-4 sm:gap-4 sm:p-5 ${currentItem.material.theme}`}
                      >
                        <div className="flex size-16 shrink-0 items-center justify-center rounded-2xl bg-white shadow-sm sm:size-20 sm:rounded-3xl">
                          <MaterialIcon type={currentItem.material.icon} />
                        </div>
                        <div className="min-w-0">
                          <div className="mb-1.5 flex flex-wrap items-center gap-1.5 sm:mb-2 sm:gap-2">
                            <span className="rounded-full bg-white px-2.5 py-0.5 text-[10px] font-bold text-primary shadow-sm sm:px-3 sm:py-1 sm:text-xs">
                              Misi {currentItem.material.misi} dari{" "}
                              {materials.length}
                            </span>
                            <span className="rounded-full bg-white px-2.5 py-0.5 text-[10px] font-bold text-accent shadow-sm sm:px-3 sm:py-1 sm:text-xs">
                              {(() => {
                                const completedCount = Object.values(
                                  currentItem.material.progress,
                                ).filter((status) => status === "completed").length;
                                return completedCount > 0
                                  ? `${completedCount} selesai`
                                  : "Belum mulai";
                              })()}
                            </span>
                          </div>
                          <h2 className="text-xl font-bold leading-tight text-foreground sm:text-2xl">
                            {currentItem.material.title}
                          </h2>
                          <p className="mt-0.5 text-xs font-bold leading-relaxed text-gray-600 sm:mt-1 sm:text-sm">
                            {currentItem.material.description}
                          </p>
                        </div>
                      </div>

                      {/* Card Body */}
                      <div className="flex flex-1 flex-col gap-4 p-4 sm:p-6">
                        <p className="rounded-2.5xl border-2 border-dashed border-border bg-background px-4 py-3 text-sm font-bold leading-relaxed text-gray-600">
                          {currentItem.material.tip}
                        </p>

                        {/* Locked Alert - if pretest not done */}
                        {currentItem.material.progress.emodul === "locked" &&
                          course.pretest !== "completed" && (
                            <div className="rounded-2xl border-2 border-amber-300 bg-amber-50 p-3.5 sm:p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                              <div className="flex items-center gap-2.5">
                                <span className="text-xl">🔒</span>
                                <p className="text-xs sm:text-sm font-bold text-amber-900">
                                  Misi ini terkunci. Kerjakan Pre-test terlebih
                                  dahulu untuk membuka petualangan ini!
                                </p>
                              </div>
                              <button
                                type="button"
                                onClick={() => handleSelectIndex(0)}
                                className="text-xs sm:text-sm font-bold text-primary hover:underline shrink-0"
                              >
                                Ke Pre-test →
                              </button>
                            </div>
                          )}

                        {/* Locked Alert - if previous quiz not completed */}
                        {currentItem.material.progress.emodul === "locked" &&
                          course.pretest === "completed" &&
                          currentItem.material.misi > 1 && (
                            <div className="rounded-2xl border-2 border-slate-200 bg-slate-50 p-3.5 sm:p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                              <div className="flex items-center gap-2.5">
                                <span className="text-xl">🔒</span>
                                <p className="text-xs sm:text-sm font-bold text-slate-700">
                                  Misi ini terkunci. Selesaikan Quiz pada Misi{" "}
                                  {currentItem.material.misi - 1} untuk membukanya!
                                </p>
                              </div>
                              <button
                                type="button"
                                onClick={() =>
                                  handleSelectIndex(currentItem.material.misi - 1)
                                }
                                className="text-xs sm:text-sm font-bold text-primary hover:underline shrink-0"
                              >
                                Ke Misi {currentItem.material.misi - 1} →
                              </button>
                            </div>
                          )}

                        {/* Activities & Evaluation Buttons */}
                        <div className="flex flex-col gap-5 pt-1">
                          <div className="flex flex-col gap-2.5">
                            <p className="text-sm font-bold text-primary border-b-2 border-border/50 pb-1.5">
                              Eksplorasi & Aktivitas
                            </p>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3">
                              <ActionButton
                                href={`/materi/${currentItem.material.slug}`}
                                icon="book"
                                status={currentItem.material.progress.emodul}
                                variant="light"
                              >
                                E-Modul
                              </ActionButton>
                              <ActionButton
                                href={`/video/${currentItem.material.slug}`}
                                icon="video"
                                status={currentItem.material.progress.video}
                                variant="light"
                              >
                                Video Pembelajaran
                              </ActionButton>
                              <ActionButton
                                href={`/lkpd/${currentItem.material.slug}`}
                                icon="worksheet"
                                status={currentItem.material.progress.lkpd}
                                variant="light"
                              >
                                LKPD
                              </ActionButton>
                              <ActionButton
                                href={`/minigame/${currentItem.material.slug}`}
                                icon="game"
                                status={currentItem.material.progress.minigame}
                                variant="light"
                              >
                                Mini-Game
                              </ActionButton>
                            </div>
                          </div>

                          <div className="flex flex-col gap-2.5">
                            <p className="text-sm font-bold text-primary border-b-2 border-border/50 pb-1.5">
                              Evaluasi
                            </p>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3">
                              <ActionButton
                                href={`/quiz/${currentItem.material.slug}`}
                                icon="quiz"
                                status={currentItem.material.progress.quiz}
                              >
                                Quiz
                              </ActionButton>
                            </div>
                          </div>

                          {/* Completion Next Step Banner */}
                          {Object.values(currentItem.material.progress).every(
                            (s) => s === "completed",
                          ) && (
                            <div className="rounded-2xl border-2 border-[#A7F3D0] bg-[#E8F8F2] p-3.5 sm:p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                              <div className="flex items-center gap-2">
                                <span className="text-xl">🎉</span>
                                <p className="text-xs sm:text-sm font-bold text-accent">
                                  {currentItem.material.misi === materials.length
                                    ? "Semua misi selesai! Sekarang saatnya menyelesaikan Post-test!"
                                    : `Misi ${currentItem.material.misi} selesai! Siap melangkah ke Misi ${
                                        currentItem.material.misi + 1
                                      }?`}
                                </p>
                              </div>
                              <button
                                type="button"
                                onClick={() => handleNext()}
                                className="flex items-center gap-1.5 rounded-xl border-2 border-accent bg-accent px-3.5 py-1.5 text-xs sm:text-sm font-bold text-white transition-all hover:bg-accent-dark active:scale-95 shrink-0"
                              >
                                <span>
                                  {currentItem.material.misi === materials.length
                                    ? "Buka Post-test"
                                    : `Lanjut ke Misi ${currentItem.material.misi + 1}`}
                                </span>
                                <ChevronRight className="size-4" />
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </article>
                  )}

                  {/* CARD TYPE 3: POST-TEST & CERTIFICATE */}
                  {currentItem.type === "posttest" && (
                    <article className="flex flex-col overflow-hidden rounded-3xl border-[3px] border-border bg-white shadow-sm sm:rounded-4xl">
                      {/* Card Header */}
                      <div className="flex items-center gap-3 border-b-[3px] border-border p-4 sm:gap-4 sm:p-5 bg-[#FEF3C7]">
                        <div className="flex size-16 shrink-0 items-center justify-center rounded-2xl bg-white shadow-sm sm:size-20 sm:rounded-3xl border-2 border-amber-200">
                          <svg
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="#D97706"
                            strokeWidth="2.2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="size-9 sm:size-11"
                          >
                            <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" />
                            <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" />
                            <path d="M4 22h16" />
                            <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22" />
                            <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22" />
                            <path d="M18 2H6v7c0 3.31 2.69 6 6 6s6-2.69 6-6V2Z" />
                          </svg>
                        </div>
                        <div className="min-w-0">
                          <div className="mb-1.5 flex flex-wrap items-center gap-1.5 sm:mb-2 sm:gap-2">
                            <span className="rounded-full bg-white px-2.5 py-0.5 text-[10px] font-bold text-amber-700 shadow-sm sm:px-3 sm:py-1 sm:text-xs">
                              Tahap Akhir
                            </span>
                            <span
                              className={`rounded-full bg-white px-2.5 py-0.5 text-[10px] font-bold shadow-sm sm:px-3 sm:py-1 sm:text-xs ${
                                course.posttest === "completed"
                                  ? "text-accent"
                                  : course.posttest === "available"
                                  ? "text-primary"
                                  : "text-gray-400"
                              }`}
                            >
                              {course.posttest === "completed"
                                ? "Selesai"
                                : course.posttest === "available"
                                ? "Tersedia"
                                : "Terkunci"}
                            </span>
                          </div>
                          <h2 className="text-xl font-bold leading-tight text-foreground sm:text-2xl">
                            Post-test & Sertifikat Kelulusan
                          </h2>
                          <p className="mt-0.5 text-xs font-bold leading-relaxed text-gray-600 sm:mt-1 sm:text-sm">
                            Uji kemampuan akhirmu setelah mempelajari seluruh
                            materi dan raih sertifikat kelulusan resmimu!
                          </p>
                        </div>
                      </div>

                      {/* Card Body */}
                      <div className="flex flex-1 flex-col gap-4 p-4 sm:p-6">
                        <p className="rounded-2.5xl border-2 border-dashed border-border bg-background px-4 py-3 text-sm font-bold leading-relaxed text-gray-600">
                          💡 Pastikan kamu sudah memahami materi di semua misi
                          sebelum mengerjakan post-test ini untuk memperoleh hasil
                          terbaik.
                        </p>

                        <div className="flex flex-col gap-4 pt-1">
                          <div className="rounded-2xl border-2 border-border/70 bg-slate-50 p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                            <div>
                              <h3 className="text-base sm:text-lg font-bold text-foreground">
                                {course.posttest === "completed"
                                  ? "Luar Biasa! Kamu Telah Lulus Seluruh Pembelajaran! 🎓"
                                  : course.posttest === "available"
                                  ? "Semua Misi Selesai! Saatnya Menguji Hasil Belajar 🚀"
                                  : "Post-test Masih Terkunci 🔒"}
                              </h3>
                              <p className="mt-1 text-xs sm:text-sm font-semibold text-gray-500">
                                {course.posttest === "completed"
                                  ? "Kamu telah menyelesaikan post-test dan berhasil menuntaskan seluruh petualangan kubus dan balok di DigiKelas."
                                  : course.posttest === "available"
                                  ? "Kerjakan post-test dengan sungguh-sungguh untuk melihat hasil akhir belajarmu dan mendapatkan sertifikat!"
                                  : "Selesaikan kuis di setiap misi (Misi 1 sampai Misi 6) terlebih dahulu untuk membuka ujian post-test."}
                              </p>
                            </div>
                            <div className="w-full sm:w-64 shrink-0">
                              <ActionButton
                                href="/post-test"
                                icon="post-test"
                                status={course.posttest}
                                variant="accent"
                              >
                                {course.posttest === "completed"
                                  ? "Lihat Post-test"
                                  : "Kerjakan Post-test"}
                              </ActionButton>
                            </div>
                          </div>

                          {certificateId && (
                            <div className="rounded-2xl border-2 border-amber-300 bg-[#FFF9E6] p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                              <div>
                                <h4 className="text-base sm:text-lg font-bold text-amber-900">
                                  Sertifikat Kelulusan Tersedia! 🏆
                                </h4>
                                <p className="mt-1 text-xs sm:text-sm font-semibold text-amber-800">
                                  Selamat atas keberhasilanmu! Kamu bisa melihat,
                                  mengunduh, atau mencetak sertifikat kelulusanmu.
                                </p>
                              </div>
                              <div className="w-full sm:w-64 shrink-0">
                                <ActionButton
                                  href={`/certificate/${certificateId}`}
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
                  )}
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Desktop Right Chevron Button */}
            <button
              type="button"
              onClick={handleNext}
              disabled={currentIndex === galleryItems.length - 1}
              aria-label="Kartu Selanjutnya"
              className="hidden lg:flex absolute -right-6 xl:-right-16 z-20 size-12 xl:size-14 items-center justify-center rounded-2xl xl:rounded-3xl border-[3px] border-border bg-white text-primary shadow-md transition-all duration-200 hover:bg-primary hover:text-white hover:border-primary active:scale-90 disabled:opacity-20 disabled:pointer-events-none"
            >
              <ChevronRight className="size-6 xl:size-7" />
            </button>
          </div>

          {/* Bottom Gallery Controls (Previous, Indicator / Dots, Next) */}
          <div className="flex items-center justify-between gap-2 rounded-2xl sm:rounded-3xl border-[3px] border-border bg-white p-3 sm:p-4 shadow-sm">
            <button
              type="button"
              onClick={handlePrev}
              disabled={currentIndex === 0}
              className="flex min-h-10 sm:min-h-11 items-center gap-1.5 sm:gap-2 rounded-xl sm:rounded-2xl border-2 border-border bg-white px-3 sm:px-5 py-2 text-xs sm:text-sm font-bold text-slate-700 transition-all duration-200 hover:border-primary hover:bg-primary hover:text-white active:scale-95 disabled:opacity-30 disabled:pointer-events-none"
            >
              <ChevronLeft className="size-4 sm:size-5" />
              <span className="hidden xs:inline sm:inline">Sebelumnya</span>
            </button>

            {/* Center: Title & Dots */}
            <div className="flex flex-col items-center justify-center gap-1.5 px-2 text-center">
              <span className="text-xs sm:text-sm font-extrabold text-foreground line-clamp-1">
                {currentTitle}
              </span>

              {/* Indicator Dots */}
              <div className="flex items-center gap-1 sm:gap-1.5">
                {galleryItems.map((item, idx) => {
                  const isActive = currentIndex === idx;
                  let isDone = false;
                  if (item.type === "pretest") {
                    isDone = course.pretest === "completed";
                  } else if (item.type === "material") {
                    isDone = Object.values(item.material.progress).every(
                      (s) => s === "completed",
                    );
                  } else if (item.type === "posttest") {
                    isDone = course.posttest === "completed";
                  }

                  return (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleSelectIndex(idx)}
                      aria-label={`Ke kartu ${idx + 1}`}
                      className={`h-2 sm:h-2.5 rounded-full transition-all duration-300 ${
                        isActive
                          ? "w-6 sm:w-8 bg-primary"
                          : isDone
                          ? "w-2 sm:w-2.5 bg-accent"
                          : "w-2 sm:w-2.5 bg-slate-200 hover:bg-slate-300"
                      }`}
                    />
                  );
                })}
              </div>
            </div>

            <button
              type="button"
              onClick={handleNext}
              disabled={currentIndex === galleryItems.length - 1}
              className="flex min-h-10 sm:min-h-11 items-center gap-1.5 sm:gap-2 rounded-xl sm:rounded-2xl border-2 border-primary bg-primary px-3 sm:px-5 py-2 text-xs sm:text-sm font-bold text-white transition-all duration-200 hover:bg-primary-dark active:scale-95 disabled:opacity-30 disabled:pointer-events-none"
            >
              <span className="hidden xs:inline sm:inline">Selanjutnya</span>
              <ChevronRight className="size-4 sm:size-5" />
            </button>
          </div>
        </section>
      )}
    </main>
  );
}
