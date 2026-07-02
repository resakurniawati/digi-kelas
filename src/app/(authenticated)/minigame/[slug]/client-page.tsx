"use client";

import React from "react";
import { useAuth } from "@/components/auth-provider";
import Link from "next/link";
import dynamic from "next/dynamic";
import type { Minigame } from "@/types/minigame";

// Dynamically import our custom games
// This ensures that games are only loaded when they are actually needed
const KubusBalokSorter = dynamic(() => import("@/components/games/kubus-balok-sorter"), {
  loading: () => (
    <div className="flex h-[400px] items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
    </div>
  )
});

const JaringJaringSorter = dynamic(() => import("@/components/games/jaring-jaring-sorter"), {
  loading: () => (
    <div className="flex h-[400px] items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
    </div>
  )
});

const AquariumFiller = dynamic(() => import("@/components/games/aquarium-filler"), {
  loading: () => (
    <div className="flex h-[400px] items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-[#0ea5e9]"></div>
    </div>
  )
});

const SurfaceAreaPainter = dynamic(() => import("@/components/games/surface-area-painter"), {
  loading: () => (
    <div className="flex h-[400px] items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-primary"></div>
    </div>
  )
});

const CompositeShapeArchitect = dynamic(() => import("@/components/games/composite-shape-architect"), {
  loading: () => (
    <div className="flex h-[400px] items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-purple-500"></div>
    </div>
  )
});

const CargoPacker = dynamic(() => import("@/components/games/cargo-packer"), {
  loading: () => (
    <div className="flex h-[400px] items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-orange-500"></div>
    </div>
  )
});

function GamepadIcon() {
  return (
    <svg
      viewBox="0 0 74 74"
      fill="none"
      className="size-16 shrink-0 sm:size-[74px]"
    >
      <circle cx="37" cy="37" r="31" fill="#FCE8E8" stroke="#D83A3A" strokeWidth="3" />
      <path
        d="M23 37C23 32 27 27 34 27h6c7 0 11 5 11 10v4c0 4-3 7-7 7a6 6 0 0 1-5-3 3 3 0 0 0-4 0 6 6 0 0 1-5 3c-4 0-7-3-7-7v-4Z"
        fill="white"
        stroke="#D83A3A"
        strokeWidth="3"
        strokeLinejoin="round"
      />
      <path d="M29 33v6M26 36h6" stroke="#D83A3A" strokeWidth="2.5" strokeLinecap="round" />
      <circle cx="43" cy="38" r="2" fill="#D83A3A" />
      <circle cx="47" cy="34" r="2" fill="#D83A3A" />
    </svg>
  );
}

export default function ClientMinigamePage({ data, slug }: { data: Minigame, slug: string }) {
  const { username } = useAuth();
  const progressLogged = React.useRef(false);

  React.useEffect(() => {
    if (!progressLogged.current) {
      const sessionId = localStorage.getItem("session_id");
      if (sessionId) {
        import("@/app/actions/progress").then(({ markResourceCompleted }) => {
          markResourceCompleted(slug, sessionId, "minigame").catch(console.error);
        });
        progressLogged.current = true;
      }
    }
  }, [slug]);

  const renderGame = () => {
    if (data.type === "iframe" && data.embedUrl) {
      return (
        <div className="w-full aspect-video rounded-4xl overflow-hidden border-[3px] border-border shadow-sm">
          <iframe 
            src={data.embedUrl} 
            className="w-full h-full border-0" 
            allowFullScreen 
          />
        </div>
      );
    }

    if (data.type === "custom") {
      switch (data.componentId) {
        case "kubus-balok-sorter":
          return <KubusBalokSorter data={data.data as any} />;
        case "jaring-jaring-sorter":
          return <JaringJaringSorter data={data.data as any} />;
        case "aquarium-filler":
          return <AquariumFiller data={data.data as any} />;
        case "surface-area-painter":
          return <SurfaceAreaPainter data={data.data as any} />;
        case "composite-shape-architect":
          return <CompositeShapeArchitect data={data.data as any} />;
        case "cargo-packer":
          return <CargoPacker data={data.data as any} />;
        default:
          return (
            <div className="flex flex-col items-center justify-center p-8 bg-gray-50 rounded-4xl border-[3px] border-border shadow-sm h-[400px]">
              <p className="text-xl font-bold text-gray-500">Game Component Not Found</p>
            </div>
          );
      }
    }

    return null;
  };

  return (
    <main className="relative z-10 flex w-full max-w-5xl mx-auto flex-1 flex-col gap-6">
      {/* Header */}
      <section className="overflow-hidden rounded-3xl border-[3px] border-border bg-white shadow-sm sm:rounded-4xl">
        <div className="flex flex-col gap-4 p-4 sm:gap-5 sm:p-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-row items-center gap-3 sm:gap-4">
            <div className="shrink-0">
              <GamepadIcon />
            </div>
            <div className="text-left">
              <p className="text-xs font-bold text-[#D83A3A] sm:text-sm">Waktunya Bermain!</p>
              <h1 className="text-xl font-bold leading-tight text-foreground sm:text-3xl">
                {data.title}
              </h1>
              <p className="mt-1 max-w-2xl text-sm font-semibold leading-relaxed text-gray-500 sm:mt-2 sm:text-base">
                {data.description}
              </p>
            </div>
          </div>

          <Link
            href="/"
            className="flex min-h-10 items-center justify-center rounded-2xl border-2 border-border bg-white px-4 py-2 text-sm font-bold text-foreground transition-all duration-200 hover:bg-gray-50 active:scale-[0.97] sm:w-auto sm:min-h-12 sm:rounded-2.5xl sm:px-5 sm:py-3 sm:text-base"
          >
            Kembali
          </Link>
        </div>
      </section>

      {/* Game Area */}
      <section className="w-full">
        {renderGame()}
      </section>
    </main>
  );
}
