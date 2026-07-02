"use client";

import React from "react";

export default function PrintButton() {
  return (
    <button
      onClick={() => window.print()}
      className="print:hidden flex min-h-12 items-center justify-center gap-2 rounded-2.5xl bg-primary px-6 py-3 text-base font-bold text-white transition-all duration-200 hover:bg-primary-dark active:scale-[0.97]"
    >
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M6 9V2h12v7M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" />
        <rect x="6" y="14" width="12" height="8" />
      </svg>
      Cetak / Simpan PDF
    </button>
  );
}
