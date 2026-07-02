"use client";

import React, { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { Trophy, ArrowLeft, Medal } from "lucide-react";
import { getLeaderboard, LeaderboardData } from "@/app/actions/leaderboard";
import { useAuth } from "@/components/auth-provider";

export default function LeaderboardPage() {
  const [data, setData] = useState<LeaderboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<string>("overall");
  const { username } = useAuth();

  useEffect(() => {
    setIsLoading(true);
    getLeaderboard(activeTab).then((res) => {
      setData(res);
      setIsLoading(false);
    });
  }, [activeTab]);

  const sortedEntries = data?.entries || [];

  return (
    <main className="relative z-10 flex w-full max-w-4xl flex-1 flex-col gap-4 sm:gap-6 p-3 sm:p-4 mx-auto py-6 sm:py-10">
      {/* Header */}
      <section className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-4 sm:p-6 rounded-3xl sm:rounded-4xl border-[3px] border-border shadow-sm">
        <div className="flex items-center gap-3 sm:gap-4 w-full">
          <div className="size-12 sm:size-14 bg-[#FFF3CD] rounded-2xl flex items-center justify-center shrink-0 border-2 border-[#FFC107]">
            <Trophy className="size-6 sm:size-8 text-[#B07D00]" />
          </div>
          <div className="min-w-0 flex-1">
            <h1 className="text-xl sm:text-2xl font-black text-foreground truncate">Papan Peringkat</h1>
            <p className="text-xs sm:text-sm text-slate-500 font-medium truncate">Siapa yang meraih poin tertinggi?</p>
          </div>
        </div>
        <Link
          href="/"
          className="flex w-full sm:w-auto items-center justify-center gap-2 rounded-2xl border-2 border-border bg-primary-container px-4 py-2.5 sm:px-5 sm:py-3 text-sm font-bold text-primary transition-all hover:bg-white active:scale-[0.97] shrink-0"
        >
          <ArrowLeft className="size-4" /> Kembali
        </Link>
      </section>

      {/* Filter / Dropdown */}
      {!isLoading && data && data.materialTabs.length > 0 && (
        <section className="bg-white rounded-3xl border-[3px] border-border shadow-sm p-3 sm:p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-3">
          <label htmlFor="material-select" className="font-bold text-sm sm:text-base text-slate-600 shrink-0 px-1">
            Pilih Papan Peringkat:
          </label>
          <div className="relative flex-1 w-full sm:max-w-md">
            <select
              id="material-select"
              value={activeTab}
              onChange={(e) => setActiveTab(e.target.value)}
              className="w-full appearance-none rounded-2xl border-2 border-border bg-slate-50 px-4 py-2.5 sm:py-3 pr-10 text-sm font-bold text-slate-700 outline-none transition-all hover:bg-slate-100 focus:border-primary focus:ring-4 focus:ring-primary/20 cursor-pointer shadow-sm truncate"
            >
              <option value="overall">🌟 Semua Materi (Keseluruhan)</option>
              {data.materialTabs.map(tab => (
                <option key={tab.id} value={tab.id}>
                  Misi {tab.misi}: {tab.title}
                </option>
              ))}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-4 flex items-center">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="text-slate-400">
                <path d="m6 9 6 6 6-6" />
              </svg>
            </div>
          </div>
        </section>
      )}

      {/* Leaderboard List */}
      <section className="bg-white rounded-3xl sm:rounded-4xl border-[3px] border-border shadow-sm p-4 sm:p-6 overflow-hidden min-h-[400px]">
        
        {/* Notice Top 10 */}
        {!isLoading && sortedEntries.length > 0 && (
          <div className="mb-4 flex items-center gap-2 rounded-xl bg-blue-50 px-3 py-2 text-xs sm:text-sm font-bold text-blue-600 border border-blue-100">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="shrink-0">
              <circle cx="12" cy="12" r="10" />
              <path d="M12 16v-4" />
              <path d="M12 8h.01" />
            </svg>
            Hanya menampilkan 10 peringkat teratas
          </div>
        )}

        {isLoading ? (
          <div className="flex flex-col items-center justify-center h-64 gap-4">
             <div className="animate-spin rounded-full h-10 w-10 sm:h-12 sm:w-12 border-[4px] border-primary border-t-transparent"></div>
             <p className="text-sm sm:text-base text-slate-500 font-bold">Memuat data...</p>
          </div>
        ) : sortedEntries.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 gap-3 sm:gap-4 text-center">
            <Medal className="size-12 sm:size-16 text-slate-300" />
            <p className="text-slate-500 font-bold text-base sm:text-lg">Belum ada skor yang tercatat.</p>
            <p className="text-xs sm:text-sm text-slate-400 font-medium max-w-[250px] sm:max-w-none">Ayo kerjakan kuis dan post-test untuk mendapatkan skor pertama!</p>
          </div>
        ) : (
          <div className="flex flex-col gap-2.5 sm:gap-3">
            {sortedEntries.map((entry, index) => {
              const isCurrentUser = username && entry.name.toLowerCase() === username.toLowerCase();
              let rankStyle = "bg-slate-50 border-slate-200 text-slate-700";
              let badge = null;

              if (index === 0) {
                rankStyle = "bg-[#FFF9E6] border-[#FFC107] text-[#B07D00] shadow-[0_3px_0_0_#FFC107] sm:shadow-[0_4px_0_0_#FFC107]";
                badge = <Trophy className="size-4 sm:size-5 text-[#FFC107] fill-[#FFC107] shrink-0" />;
              } else if (index === 1) {
                rankStyle = "bg-slate-100 border-slate-300 text-slate-600 shadow-[0_3px_0_0_#CBD5E1] sm:shadow-[0_4px_0_0_#CBD5E1]";
                badge = <Medal className="size-4 sm:size-5 text-slate-400 fill-slate-300 shrink-0" />;
              } else if (index === 2) {
                rankStyle = "bg-[#FFF0E6] border-[#FF9F1C] text-[#B04C00] shadow-[0_3px_0_0_#FF9F1C] sm:shadow-[0_4px_0_0_#FF9F1C]";
                badge = <Medal className="size-4 sm:size-5 text-[#FF9F1C] fill-[#FFD166] shrink-0" />;
              } else if (isCurrentUser) {
                rankStyle = "bg-primary-container border-primary text-primary shadow-[0_3px_0_0_#0984E3] sm:shadow-[0_4px_0_0_#0984E3]";
              }

              const displayScore = activeTab === "overall" ? entry.totalScore : (entry.materials[activeTab]?.total || 0);

              return (
                <div 
                  key={entry.id} 
                  className={`flex flex-col gap-1 sm:gap-2 p-3 sm:p-4 rounded-2xl border-2 transition-all ${rankStyle} ${isCurrentUser ? 'ring-2 ring-primary ring-offset-1 sm:ring-offset-2' : ''}`}
                >
                  <div className="flex items-center gap-2 sm:gap-4 w-full">
                    <div className="w-6 sm:w-10 text-center font-black text-lg sm:text-2xl shrink-0 opacity-80 sm:opacity-100">
                      {index + 1}
                    </div>
                    <div className="flex-1 flex items-center justify-between gap-2 min-w-0">
                      <div className="flex items-center gap-1.5 sm:gap-2 min-w-0">
                        <span className="font-bold text-sm sm:text-lg truncate">{entry.name}</span>
                        {isCurrentUser && <span className="text-[9px] sm:text-[10px] bg-primary text-white px-1.5 py-0.5 sm:px-2 sm:py-0.5 rounded-full font-bold uppercase tracking-wider shrink-0">Kamu</span>}
                        {badge}
                      </div>
                      <div className="font-black text-base sm:text-xl flex items-center gap-1 shrink-0">
                        {displayScore} <span className="text-[10px] sm:text-sm font-bold opacity-70">XP</span>
                      </div>
                    </div>
                  </div>
                  
                  {activeTab !== "overall" && entry.materials[activeTab] && (
                    <div className="ml-8 sm:ml-14 flex items-center gap-x-3 gap-y-1.5 flex-wrap text-[10px] sm:text-sm font-semibold opacity-80 border-t-2 border-black/5 pt-1.5 sm:pt-2 mt-0.5 sm:mt-1">
                       <span className="flex items-center gap-1">
                         <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-blue-500"></span>
                         Pre-test: <span className="font-black">{entry.materials[activeTab].pretest || 0}</span>
                       </span>
                       <span className="flex items-center gap-1">
                         <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-amber-500"></span>
                         Quiz: <span className="font-black">{entry.materials[activeTab].quiz || 0}</span>
                       </span>
                       <span className="flex items-center gap-1">
                         <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-green-500"></span>
                         Post-test: <span className="font-black">{entry.materials[activeTab].posttest || 0}</span>
                       </span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </section>
    </main>
  );
}
