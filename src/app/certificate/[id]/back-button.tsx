"use client";

import { useRouter } from "next/navigation";

export default function BackButton() {
  const router = useRouter();

  return (
    <button
      onClick={() => router.back()}
      className="flex min-h-12 items-center justify-center gap-2 rounded-2.5xl border-2 border-border bg-white px-6 py-3 text-base font-bold text-foreground transition-all duration-200 hover:bg-gray-50 active:scale-[0.97]"
    >
      <svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M19 12H5M12 19l-7-7 7-7" />
      </svg>
      Kembali
    </button>
  );
}
