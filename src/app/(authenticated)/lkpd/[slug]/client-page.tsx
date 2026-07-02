"use client";

import { useAuth } from "@/components/auth-provider";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import "react-pdf/dist/Page/TextLayer.css";
import "react-pdf/dist/Page/AnnotationLayer.css";
import type { Lkpd } from "@/types/lkpd";

pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  "pdfjs-dist/build/pdf.worker.min.mjs",
  import.meta.url,
).toString();

const TAG_COLORS = [
  "bg-[#FFF3CD] text-[#B07D00]", // Yellow
  "bg-[#E8F8F2] text-[#006B4F]", // Green
  "bg-[#F0F9FF] text-[#0984E3]", // Blue
  "bg-[#FCE8E8] text-[#D83A3A]", // Red
  "bg-[#F4E8FC] text-[#8E44AD]", // Purple
];

function getTagColor(index: number) {
  return TAG_COLORS[index % TAG_COLORS.length];
}

function WorksheetIcon() {
  return (
    <svg
      viewBox="0 0 74 74"
      fill="none"
      className="size-16 shrink-0 sm:size-[74px]"
    >
      <circle cx="37" cy="37" r="31" fill="#F0F9FF" stroke="#0984E3" strokeWidth="3" />
      <path
        d="M24 17h17l10 10v30a4 4 0 0 1-4 4H24a4 4 0 0 1-4-4V21a4 4 0 0 1 4-4Z"
        fill="white"
        stroke="#0984E3"
        strokeWidth="3"
        strokeLinejoin="round"
      />
      <path
        d="M41 17v10h10"
        fill="#F0F9FF"
        stroke="#0984E3"
        strokeWidth="3"
        strokeLinejoin="round"
      />
      <path d="M28 35h18M28 43h14M28 51h10" stroke="#00B894" strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}

function LkpdCard({
  lkpd,
  isActive,
  tagColor,
  onClick,
}: {
  lkpd: Lkpd;
  isActive: boolean;
  tagColor: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex w-full items-start gap-3 rounded-2.5xl border-2 p-3 text-left transition-all duration-200 active:scale-[0.98] ${
        isActive
          ? "border-primary bg-primary-container shadow-[0_0_0_3px_rgba(9,132,227,0.15)]"
          : "border-border bg-white hover:border-primary hover:bg-primary-container"
      }`}
    >
      {/* Document thumbnail */}
      <div className="relative flex h-[68px] w-[52px] shrink-0 items-center justify-center overflow-hidden rounded-xl border-2 border-border bg-white">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <path
            d="M8 3h7l4 4v14H8a3 3 0 0 1-3-3V6a3 3 0 0 1 3-3Z"
            fill="#F0F9FF"
            stroke="#0984E3"
            strokeWidth="1.5"
          />
          <path d="M14 3v5h5" stroke="#0984E3" strokeWidth="1.5" />
          <path d="M9 13h6M9 17h4" stroke="#00B894" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
        <span className="absolute bottom-0.5 left-0 right-0 text-center text-[9px] font-bold text-gray-400">
          {lkpd.pages} hal
        </span>
      </div>

      <div className="min-w-0 flex-1 pt-0.5">
        <span
          className={`mb-1.5 inline-block rounded-full px-2 py-0.5 text-[11px] font-bold ${tagColor}`}
        >
          {lkpd.tag}
        </span>
        <p
          className={`text-sm font-bold leading-snug ${isActive ? "text-primary" : "text-foreground"}`}
        >
          {lkpd.title}
        </p>
      </div>
    </button>
  );
}

export default function ClientLkpdPage({ lkpdList, slug }: { lkpdList: Lkpd[], slug: string }) {
  const { username } = useAuth();
  const [activeIndex, setActiveIndex] = useState(0);
  const [pdfError, setPdfError] = useState(false);
  const [numPages, setNumPages] = useState<number>(0);
  const [containerWidth, setContainerWidth] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const progressLogged = useRef(false);
  
  const activeLkpd = lkpdList[activeIndex];
  const activeTagColor = getTagColor(activeIndex);

  useEffect(() => {
    if (!progressLogged.current) {
      const sessionId = localStorage.getItem("session_id");
      if (sessionId) {
        import("@/app/actions/progress").then(({ markResourceCompleted }) => {
          markResourceCompleted(slug, sessionId, "lkpd").catch(console.error);
        });
        progressLogged.current = true;
      }
    }
  }, [slug]);

  const handleSelectLkpd = useCallback((index: number) => {
    setActiveIndex(index);
    setPdfError(false);
    setNumPages(0);
  }, []);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        setContainerWidth(entry.contentRect.width);
      }
    });
    observer.observe(container);
    return () => observer.disconnect();
  }, [activeLkpd?.id]);

  const onDocumentLoadSuccess = useCallback(({ numPages }: { numPages: number }) => {
    setNumPages(numPages);
    setPdfError(false);
  }, []);

  const handleDownload = useCallback(() => {
    if (!activeLkpd) return;
    const link = document.createElement("a");
    link.href = activeLkpd.pdfUrl;
    link.download = `${activeLkpd.title}.pdf`;
    link.target = "_blank";
    link.rel = "noopener noreferrer";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }, [activeLkpd]);

  if (!lkpdList || lkpdList.length === 0) {
    return (
      <main className="relative z-10 flex w-full max-w-4xl flex-1 flex-col gap-5 items-center justify-center py-20">
        <p className="text-xl font-bold text-gray-500">
          Data LKPD belum tersedia untuk materi ini.
        </p>
        <Link href="/" className="mt-4 text-primary hover:underline font-bold">
          Kembali ke Beranda
        </Link>
      </main>
    );
  }

  return (
    <main className="relative z-10 flex w-full max-w-6xl flex-1 flex-col gap-5">
      {/* Header */}
      <section className="overflow-hidden rounded-3xl border-[3px] border-border bg-white shadow-sm sm:rounded-4xl">
        <div className="flex flex-col gap-4 p-4 sm:gap-5 sm:p-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-row items-center gap-3 sm:gap-4">
            <div className="shrink-0">
              <WorksheetIcon />
            </div>
            <div className="text-left">
              <p className="text-xs font-bold text-primary sm:text-sm">Lembar Kerja Peserta Didik</p>
              <h1 className="text-xl font-bold leading-tight text-foreground sm:text-3xl">
                Kerjakan LKPD-mu, {username}
              </h1>
              <p className="mt-1 max-w-2xl text-sm font-semibold leading-relaxed text-gray-500 sm:mt-2 sm:text-base">
                Baca dan kerjakan langsung di halaman ini. Kamu juga bisa mengunduh PDF-nya untuk dikerjakan secara offline.
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

        {/* Stats bar */}
        <div className="grid grid-cols-3 divide-x-[3px] divide-border border-t-[3px] border-border bg-primary-container">
          <div className="px-2 py-3 text-center sm:px-5 sm:py-4">
            <p className="text-xl font-bold text-primary sm:text-2xl">{lkpdList.length}</p>
            <p className="mt-1 text-[10px] font-bold leading-tight text-gray-500 sm:text-sm">LKPD tersedia</p>
          </div>
          <div className="px-2 py-3 text-center sm:px-5 sm:py-4">
            <p className="text-xl font-bold text-accent sm:text-2xl">{activeIndex + 1}</p>
            <p className="mt-1 text-[10px] font-bold leading-tight text-gray-500 sm:text-sm">Sedang dibuka</p>
          </div>
          <div className="px-2 py-3 text-center sm:px-5 sm:py-4">
            <p className="text-xl font-bold text-primary sm:text-2xl">{activeLkpd.pages} Halaman</p>
            <p className="mt-1 text-[10px] font-bold leading-tight text-gray-500 sm:text-sm">Dalam LKPD ini</p>
          </div>
        </div>
      </section>

      {/* PDF Viewer + Sidebar */}
      <section className="grid gap-4 lg:grid-cols-[1fr_340px]">
        {/* PDF Viewer */}
        <div className="flex flex-col gap-4">
          {/* Viewer frame */}
          <div className="overflow-hidden rounded-4xl border-[3px] border-border bg-white shadow-sm">
            {/* Toolbar */}
            <div className="flex items-center justify-between border-b-[3px] border-border bg-primary-container px-4 py-3">
              <div className="flex items-center gap-2">
                <span className="flex size-8 items-center justify-center rounded-xl bg-primary">
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="white"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M8 3h7l4 4v14H8a3 3 0 0 1-3-3V6a3 3 0 0 1 3-3Z" />
                    <path d="M14 3v5h5" />
                  </svg>
                </span>
                <span className="text-sm font-bold text-foreground truncate max-w-[200px] sm:max-w-none">
                  {activeLkpd.title}
                </span>
              </div>

              <div className="flex items-center gap-2">
                {/* Full screen hint */}
                <span className="hidden rounded-full bg-white px-3 py-1 text-[11px] font-bold text-gray-500 sm:inline-block">
                  Scroll & zoom di dalam viewer
                </span>
                {/* Download button */}
                <button
                  type="button"
                  onClick={handleDownload}
                  className="flex items-center gap-1.5 rounded-xl bg-accent px-3 py-2 text-xs font-bold text-white transition-all duration-200 hover:bg-accent-dark active:scale-[0.97]"
                >
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                    <polyline points="7 10 12 15 17 10" />
                    <line x1="12" y1="15" x2="12" y2="3" />
                  </svg>
                  Unduh PDF
                </button>
              </div>
            </div>

            {/* PDF embed area */}
            {pdfError ? (
              <div className="flex min-h-[600px] flex-col items-center justify-center gap-4 bg-gray-50 p-8">
                <div className="flex size-20 items-center justify-center rounded-3xl bg-primary-container">
                  <svg
                    width="40"
                    height="40"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#0984E3"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M8 3h7l4 4v14H8a3 3 0 0 1-3-3V6a3 3 0 0 1 3-3Z" />
                    <path d="M14 3v5h5" />
                    <line x1="9" y1="14" x2="15" y2="14" />
                  </svg>
                </div>
                <p className="text-center text-lg font-bold text-foreground">
                  PDF belum bisa ditampilkan
                </p>
                <p className="max-w-sm text-center text-sm font-semibold text-gray-500">
                  File PDF belum tersedia atau terjadi kesalahan saat memuat PDF.
                  Coba unduh file-nya.
                </p>
                <button
                  type="button"
                  onClick={handleDownload}
                  className="flex items-center gap-2 rounded-2xl bg-primary px-5 py-3 text-sm font-bold text-white transition-all duration-200 hover:bg-primary-dark active:scale-[0.97]"
                >
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                    <polyline points="7 10 12 15 17 10" />
                    <line x1="12" y1="15" x2="12" y2="3" />
                  </svg>
                  Unduh PDF
                </button>
              </div>
            ) : (
              <div
                ref={containerRef}
                className="flex min-h-[600px] w-full flex-col items-center overflow-y-auto bg-gray-50 py-6 sm:min-h-[700px] lg:min-h-[780px]"
                style={{ maxHeight: "800px" }}
              >
                <Document
                  key={activeLkpd.id}
                  file={activeLkpd.pdfUrl}
                  onLoadSuccess={onDocumentLoadSuccess}
                  onLoadError={() => setPdfError(true)}
                  loading={
                    <div className="flex min-h-[400px] items-center justify-center">
                      <div className="flex flex-col items-center gap-4">
                        <div className="flex size-16 items-center justify-center rounded-3xl bg-white shadow-sm">
                          <svg
                            width="32"
                            height="32"
                            viewBox="0 0 24 24"
                            fill="none"
                            className="animate-pulse"
                          >
                            <path
                              d="M8 3h7l4 4v14H8a3 3 0 0 1-3-3V6a3 3 0 0 1 3-3Z"
                              fill="#F0F9FF"
                              stroke="#0984E3"
                              strokeWidth="2"
                            />
                            <path
                              d="M14 3v5h5"
                              stroke="#0984E3"
                              strokeWidth="2"
                            />
                          </svg>
                        </div>
                        <p className="text-sm font-bold text-primary">
                          Memuat lembar kerja...
                        </p>
                      </div>
                    </div>
                  }
                >
                  {numPages > 0 &&
                    Array.from(new Array(numPages), (el, index) => (
                      <div
                        key={`page_${index + 1}`}
                        className="mb-6 overflow-hidden rounded-xl border-2 border-border bg-white shadow-sm last:mb-0"
                      >
                        <Page
                          pageNumber={index + 1}
                          width={containerWidth ? Math.min(containerWidth - 48, 800) : undefined}
                          renderTextLayer={true}
                          renderAnnotationLayer={true}
                          loading={
                            <div className="flex h-[400px] w-full items-center justify-center bg-white">
                              <span className="text-sm font-bold text-gray-400">Memuat halaman...</span>
                            </div>
                          }
                        />
                      </div>
                    ))}
                </Document>
              </div>
            )}
          </div>

          {/* Active LKPD info */}
          <div className="rounded-4xl border-[3px] border-border bg-white p-5 shadow-sm">
            <div className="mb-3 flex flex-wrap items-center gap-2">
              <span
                className={`rounded-full px-3 py-1 text-xs font-bold ${activeTagColor}`}
              >
                {activeLkpd.tag}
              </span>
              <span className="rounded-full bg-primary-container px-3 py-1 text-xs font-bold text-primary">
                {activeLkpd.pages} halaman
              </span>
            </div>
            <h2 className="text-xl font-bold leading-tight text-foreground sm:text-2xl">
              {activeLkpd.title}
            </h2>
            <p className="mt-3 rounded-2.5xl border-2 border-dashed border-border bg-background px-4 py-3 text-base font-semibold leading-relaxed text-gray-600">
              {activeLkpd.description}
            </p>

            {/* Download CTA */}
            <div className="mt-4 flex flex-col gap-3 rounded-2.5xl border-2 border-border bg-primary-container p-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm font-bold text-foreground">
                  Ingin mengerjakan secara offline?
                </p>
                <p className="text-sm font-semibold text-gray-500">
                  Unduh file PDF lalu cetak atau isi di perangkatmu.
                </p>
              </div>
              <button
                type="button"
                onClick={handleDownload}
                className="flex min-h-11 shrink-0 items-center justify-center gap-2 rounded-2xl bg-primary px-5 py-2.5 text-sm font-bold text-white transition-all duration-200 hover:bg-primary-dark active:scale-[0.97]"
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <polyline points="7 10 12 15 17 10" />
                  <line x1="12" y1="15" x2="12" y2="3" />
                </svg>
                Unduh PDF
              </button>
            </div>
          </div>
        </div>

        {/* Sidebar — LKPD list */}
        <div className="rounded-4xl border-[3px] border-border bg-white p-4 shadow-sm">
          <div className="mb-4 flex items-center gap-3">
            <div className="flex size-9 shrink-0 items-center justify-center rounded-2xl bg-primary">
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="white"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M8 3h7l4 4v14H8a3 3 0 0 1-3-3V6a3 3 0 0 1 3-3Z" />
                <path d="M14 3v5h5" />
                <path d="M9 13h6M9 17h4" />
              </svg>
            </div>
            <div>
              <p className="text-xs font-bold text-gray-500">Daftar LKPD</p>
              <p className="text-sm font-bold text-foreground">
                {lkpdList.length} lembar kerja
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-2">
            {lkpdList.map((lkpd, index) => (
              <LkpdCard
                key={lkpd.id}
                lkpd={lkpd}
                isActive={index === activeIndex}
                tagColor={getTagColor(index)}
                onClick={() => handleSelectLkpd(index)}
              />
            ))}
          </div>

          {/* Navigation buttons */}
          <div className="mt-4 grid grid-cols-2 gap-2">
            <button
              type="button"
              disabled={activeIndex === 0}
              onClick={() => handleSelectLkpd(Math.max(activeIndex - 1, 0))}
              className="min-h-11 rounded-2xl border-2 border-border bg-primary-container text-sm font-bold text-primary transition-all duration-200 hover:bg-white active:scale-[0.97] disabled:bg-gray-100 disabled:text-gray-400 disabled:active:scale-100"
            >
              ← Sebelumnya
            </button>
            <button
              type="button"
              disabled={activeIndex === lkpdList.length - 1}
              onClick={() =>
                handleSelectLkpd(
                  Math.min(activeIndex + 1, lkpdList.length - 1),
                )
              }
              className="min-h-11 rounded-2xl bg-accent text-sm font-bold text-white transition-all duration-200 hover:bg-accent-dark active:scale-[0.97] disabled:bg-gray-300 disabled:text-gray-500 disabled:active:scale-100"
            >
              Berikutnya →
            </button>
          </div>

          {/* Help hint */}
          <div className="mt-4 rounded-2.5xl border-2 border-dashed border-border bg-background p-3">
            <p className="text-xs font-bold leading-relaxed text-gray-500">
              💡 Kamu bisa <strong className="text-primary">scroll</strong>{" "}
              untuk melihat halaman,{" "}
              <strong className="text-primary">zoom</strong> untuk memperbesar,
              dan <strong className="text-primary">unduh</strong> untuk
              menyimpan file PDF ke perangkatmu.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
