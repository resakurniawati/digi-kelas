"use client";

import { useEffect, useRef } from "react";
import { useAuth } from "@/components/auth-provider";
import PdfFlipBook from "@/components/pdf-flipbook";
import Link from "next/link";
import { markResourceCompleted } from "@/app/actions/progress";

function BookIcon() {
  return (
    <svg
      viewBox="0 0 74 74"
      fill="none"
      className="size-16 shrink-0 sm:size-[74px]"
    >
      <circle cx="37" cy="37" r="31" fill="#FFF3CD" stroke="#FFC107" strokeWidth="3" />
      <path
        d="M18 25c0-4 3-7 7-7h11v34H25c-4 0-7-3-7-7V25Z"
        fill="white"
        stroke="#0984E3"
        strokeWidth="3"
        strokeLinejoin="round"
      />
      <path
        d="M38 18h11c4 0 7 3 7 7v20c0 4-3 7-7 7H38V18Z"
        fill="#F0F9FF"
        stroke="#0984E3"
        strokeWidth="3"
        strokeLinejoin="round"
      />
      <path d="M27 29h6M27 37h6M43 29h7M43 37h7" stroke="#00B894" strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}

export default function ClientMateriPage({ slug, materialTitle, pdfUrl }: { slug: string, materialTitle: string, pdfUrl: string }) {
  const { username } = useAuth();
  const progressLogged = useRef(false);

  useEffect(() => {
    if (!progressLogged.current) {
      const sessionId = localStorage.getItem("session_id");
      if (sessionId) {
        markResourceCompleted(slug, sessionId, "emodul").catch(console.error);
        progressLogged.current = true;
      }
    }
  }, [slug]);

  return (
    <main className="relative z-10 flex w-full max-w-6xl flex-1 flex-col gap-5">
      {/* Header */}
      <section className="overflow-hidden rounded-3xl border-[3px] border-border bg-white shadow-sm sm:rounded-4xl">
        <div className="flex flex-col gap-4 p-4 sm:gap-5 sm:p-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-row items-center gap-3 sm:gap-4">
            <div className="shrink-0">
              <BookIcon />
            </div>
            <div className="text-left">
              <p className="text-xs font-bold text-primary sm:text-sm">E-Modul - {materialTitle}</p>
              <h1 className="text-xl font-bold leading-tight text-foreground sm:text-3xl">
                Buka buku materimu, {username}
              </h1>
              <p className="mt-1 max-w-2xl text-sm font-semibold leading-relaxed text-gray-500 sm:mt-2 sm:text-base">
                Materi ditampilkan seperti flipbook di dalam aplikasi. Balik halaman dengan tombol atau keyboard.
              </p>
            </div>
          </div>

          <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:gap-3">
            <a
              href={pdfUrl}
              download
              target="_blank"
              rel="noopener noreferrer"
              className="flex min-h-10 items-center justify-center gap-2 rounded-2xl bg-accent px-4 py-2 text-sm font-bold text-white transition-all duration-200 hover:bg-accent-dark active:scale-[0.97] sm:min-h-12 sm:rounded-2.5xl sm:px-5 sm:py-3 sm:text-base"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="7 10 12 15 17 10" />
                <line x1="12" y1="15" x2="12" y2="3" />
              </svg>
              Unduh PDF
            </a>
            <Link
              href="/"
              className="flex min-h-10 items-center justify-center rounded-2xl border-2 border-border bg-primary-container px-4 py-2 text-sm font-bold text-primary transition-all duration-200 hover:bg-white active:scale-[0.97] sm:min-h-12 sm:rounded-2.5xl sm:px-5 sm:py-3 sm:text-base"
            >
              Kembali
            </Link>
          </div>
        </div>

        {/* Stats bar */}
        <div className="grid grid-cols-3 divide-x-[3px] divide-border border-t-[3px] border-border bg-primary-container">
          <div className="px-2 py-3 text-center sm:px-5 sm:py-4">
            <p className="text-xl font-bold text-primary sm:text-2xl">PDF</p>
            <p className="mt-1 text-[10px] font-bold leading-tight text-gray-500 sm:text-sm">Format sumber</p>
          </div>
          <div className="px-2 py-3 text-center sm:px-5 sm:py-4">
            <p className="text-xl font-bold text-accent sm:text-2xl">Flipbook</p>
            <p className="mt-1 text-[10px] font-bold leading-tight text-gray-500 sm:text-sm">Mode tampilan</p>
          </div>
          <div className="px-2 py-3 text-center sm:px-5 sm:py-4">
            <p className="text-xl font-bold text-primary sm:text-2xl">← →</p>
            <p className="mt-1 text-[10px] font-bold leading-tight text-gray-500 sm:text-sm">Navigasi keyboard</p>
          </div>
        </div>
      </section>

      {/* Flip Book */}
      <PdfFlipBook pdfUrl={pdfUrl} />
    </main>
  );
}
