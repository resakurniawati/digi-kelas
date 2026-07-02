"use client";

import { useAuth } from "@/components/auth-provider";
import Link from "next/link";
import { useState, useEffect, useRef } from "react";
import type { Video } from "@/types/video";
import { markResourceCompleted } from "@/app/actions/progress";

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

function VideoIcon() {
  return (
    <svg
      viewBox="0 0 74 74"
      fill="none"
      className="size-16 shrink-0 sm:size-[74px]"
    >
      <circle cx="37" cy="37" r="31" fill="#E8F8F2" stroke="#00B894" strokeWidth="3" />
      <rect x="18" y="23" width="28" height="28" rx="8" fill="white" stroke="#0984E3" strokeWidth="3" />
      <path d="M46 31l10-5v22l-10-5V31Z" fill="#00B894" stroke="#00B894" strokeWidth="2" strokeLinejoin="round" />
      <path d="M28 33l8 4-8 4V33Z" fill="#0984E3" />
    </svg>
  );
}

function VideoCard({
  video,
  isActive,
  tagColor,
  onClick,
}: {
  video: Video;
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
      {/* Thumbnail */}
      <div className="relative flex h-[68px] w-[110px] shrink-0 items-center justify-center overflow-hidden rounded-xl bg-slate-200">
        <img
          src={`https://img.youtube.com/vi/${video.youtube_id}/mqdefault.jpg`}
          alt={video.title}
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-black/10 transition-colors" />
        <svg width="28" height="28" viewBox="0 0 28 28" fill="none" className="relative z-10 drop-shadow-md">
          <circle cx="14" cy="14" r="14" fill="rgba(9,132,227,0.8)" />
          <circle cx="14" cy="14" r="10" fill="#0984E3" />
          <path d="M11 9.5l9 4.5-9 4.5V9.5Z" fill="white" />
        </svg>
        <span className="absolute bottom-1 right-1.5 z-10 rounded-md bg-black/70 px-1.5 py-0.5 text-[10px] font-bold text-white">
          {video.duration}
        </span>
      </div>

      <div className="min-w-0 flex-1 pt-0.5">
        <span
          className={`mb-1.5 inline-block rounded-full px-2 py-0.5 text-[11px] font-bold ${tagColor}`}
        >
          {video.tag}
        </span>
        <p
          className={`text-sm font-bold leading-snug ${isActive ? "text-primary" : "text-foreground"}`}
        >
          {video.title}
        </p>
      </div>
    </button>
  );
}

export default function ClientVideoPage({
  videos,
  materialTitle,
  slug,
}: {
  videos: Video[];
  materialTitle: string;
  slug: string;
}) {
  const { username } = useAuth();
  const [activeIndex, setActiveIndex] = useState(0);
  const activeVideo = videos[activeIndex];
  const progressLogged = useRef(false);

  useEffect(() => {
    if (!progressLogged.current) {
      const sessionId = localStorage.getItem("session_id");
      if (sessionId) {
        markResourceCompleted(slug, sessionId, "video").catch(console.error);
        progressLogged.current = true;
      }
    }
  }, [slug]);
  
  if (!videos || videos.length === 0) {
    return (
      <main className="relative z-10 flex w-full max-w-4xl flex-1 flex-col gap-5 items-center justify-center py-20">
        <p className="text-xl font-bold text-gray-500">
          Data video belum tersedia untuk materi ini.
        </p>
        <Link href="/" className="mt-4 text-primary hover:underline font-bold">
          Kembali ke Beranda
        </Link>
      </main>
    );
  }

  const activeTagColor = getTagColor(activeIndex);

  return (
    <main className="relative z-10 flex w-full max-w-6xl flex-1 flex-col gap-5">
      {/* Header */}
      <section className="overflow-hidden rounded-3xl border-[3px] border-border bg-white shadow-sm sm:rounded-4xl">
        <div className="flex flex-col gap-4 p-4 sm:gap-5 sm:p-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-row items-center gap-3 sm:gap-4">
            <div className="shrink-0">
              <VideoIcon />
            </div>
            <div className="text-left">
              <p className="text-xs font-bold text-accent sm:text-sm">Video Pembelajaran</p>
              <h1 className="text-xl font-bold leading-tight text-foreground sm:text-3xl">
                Tonton dan pahami, {username}
              </h1>
              <p className="mt-1 max-w-2xl text-sm font-semibold leading-relaxed text-gray-500 sm:mt-2 sm:text-base">
                Video diputar langsung di halaman ini — kamu tidak perlu membuka YouTube secara terpisah.
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
            <p className="text-xl font-bold text-primary sm:text-2xl">{videos.length}</p>
            <p className="mt-1 text-[10px] font-bold leading-tight text-gray-500 sm:text-sm">Video tersedia</p>
          </div>
          <div className="px-2 py-3 text-center sm:px-5 sm:py-4">
            <p className="text-xl font-bold text-accent sm:text-2xl">{activeIndex + 1}</p>
            <p className="mt-1 text-[10px] font-bold leading-tight text-gray-500 sm:text-sm">Sedang ditonton</p>
          </div>
          <div className="px-2 py-3 text-center sm:px-5 sm:py-4">
            <p className="text-xl font-bold text-primary sm:text-2xl">{materialTitle}</p>
            <p className="mt-1 text-[10px] font-bold leading-tight text-gray-500 sm:text-sm">Materi aktif</p>
          </div>
        </div>
      </section>

      {/* Player + Playlist */}
      <section className="grid gap-4 lg:grid-cols-[1fr_340px]">
        {/* Video Player */}
        <div className="flex flex-col gap-4">
          {/* Embed */}
          <div className="overflow-hidden rounded-4xl border-[3px] border-border bg-black shadow-sm">
            <div className="relative w-full" style={{ paddingTop: "56.25%" }}>
              <iframe
                key={activeVideo.youtube_id}
                src={`https://www.youtube-nocookie.com/embed/${activeVideo.youtube_id}?autoplay=0&rel=0&modestbranding=1`}
                title={activeVideo.title}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="absolute inset-0 h-full w-full"
              />
            </div>
          </div>

          {/* Active video info */}
          <div className="rounded-4xl border-[3px] border-border bg-white p-5 shadow-sm">
            <div className="mb-3 flex flex-wrap items-center gap-2">
              <span
                className={`rounded-full px-3 py-1 text-xs font-bold ${activeTagColor}`}
              >
                {activeVideo.tag}
              </span>
              <span className="rounded-full bg-primary-container px-3 py-1 text-xs font-bold text-primary">
                {activeVideo.duration}
              </span>
            </div>
            <h2 className="text-xl font-bold leading-tight text-foreground sm:text-2xl">
              {activeVideo.title}
            </h2>
            <p className="mt-3 rounded-2.5xl border-2 border-dashed border-border bg-background px-4 py-3 text-base font-semibold leading-relaxed text-gray-600">
              {activeVideo.description}
            </p>
          </div>
        </div>

        {/* Playlist */}
        <div className="rounded-4xl border-[3px] border-border bg-white p-4 shadow-sm">
          <div className="mb-4 flex items-center gap-3">
            <div className="flex size-9 shrink-0 items-center justify-center rounded-2xl bg-accent">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 6h18M3 12h18M3 18h11" />
              </svg>
            </div>
            <div>
              <p className="text-xs font-bold text-gray-500">Daftar Video</p>
              <p className="text-sm font-bold text-foreground">
                {videos.length} video tersedia
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-2">
            {videos.map((video, index) => (
              <VideoCard
                key={video.id}
                video={video}
                isActive={index === activeIndex}
                tagColor={getTagColor(index)}
                onClick={() => setActiveIndex(index)}
              />
            ))}
          </div>

          {/* Navigation buttons */}
          <div className="mt-4 grid grid-cols-2 gap-2">
            <button
              type="button"
              disabled={activeIndex === 0}
              onClick={() => setActiveIndex((i) => Math.max(i - 1, 0))}
              className="min-h-11 rounded-2xl border-2 border-border bg-primary-container text-sm font-bold text-primary transition-all duration-200 hover:bg-white active:scale-[0.97] disabled:bg-gray-100 disabled:text-gray-400 disabled:active:scale-100"
            >
              ← Sebelumnya
            </button>
            <button
              type="button"
              disabled={activeIndex === videos.length - 1}
              onClick={() =>
                setActiveIndex((i) => Math.min(i + 1, videos.length - 1))
              }
              className="min-h-11 rounded-2xl bg-accent text-sm font-bold text-white transition-all duration-200 hover:bg-accent-dark active:scale-[0.97] disabled:bg-gray-300 disabled:text-gray-500 disabled:active:scale-100"
            >
              Berikutnya →
            </button>
          </div>
        </div>
      </section>
    </main>
  );
}
