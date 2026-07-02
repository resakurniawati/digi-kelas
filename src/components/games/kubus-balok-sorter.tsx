"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

interface Item {
  id: string;
  name: string;
  image: string;
  correctType: "kubus" | "balok" | "lainnya";
}

export default function KubusBalokSorter({ data }: { data: { items: Item[] } }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [isWrong, setIsWrong] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [gameOver, setGameOver] = useState(false);

  const items = data.items;
  const currentItem = items[currentIndex];

  const handleGuess = (type: "kubus" | "balok" | "lainnya") => {
    if (type === currentItem.correctType) {
      setIsCorrect(true);
      setScore((s) => s + 1);
      setTimeout(() => {
        setIsCorrect(false);
        if (currentIndex + 1 < items.length) {
          setCurrentIndex((i) => i + 1);
        } else {
          setGameOver(true);
        }
      }, 800);
    } else {
      setIsWrong(true);
      setTimeout(() => {
        setIsWrong(false);
      }, 500);
    }
  };

  const restartGame = () => {
    setCurrentIndex(0);
    setScore(0);
    setGameOver(false);
    setIsCorrect(false);
    setIsWrong(false);
  };

  if (gameOver) {
    return (
      <div className="flex flex-col items-center justify-center p-8 bg-white rounded-4xl border-[3px] border-border shadow-sm min-h-[500px]">
        <div className="text-8xl mb-6">🎉</div>
        <h2 className="text-3xl font-bold text-foreground mb-2">Permainan Selesai!</h2>
        <p className="text-gray-500 font-semibold mb-8 text-center max-w-md">
          Hebat! Kamu berhasil mengelompokkan semua benda dengan benar.
          Skor akhirmu: <span className="text-primary font-bold text-xl">{score}</span> / {items.length}.
        </p>
        <div className="flex gap-4">
          <button
            onClick={restartGame}
            className="px-6 py-3 bg-primary-container text-primary border-2 border-border font-bold rounded-2xl hover:bg-white transition-all active:scale-95"
          >
            Main Lagi
          </button>
          <Link
            href="/"
            className="px-6 py-3 bg-primary text-white font-bold rounded-2xl hover:bg-primary-dark transition-all active:scale-95"
          >
            Selesai
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center p-6 sm:p-10 bg-white rounded-4xl border-[3px] border-border shadow-sm min-h-[550px] relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-[-50px] left-[-50px] w-40 h-40 bg-primary-container rounded-full blur-3xl opacity-50 pointer-events-none"></div>
      <div className="absolute bottom-[-50px] right-[-50px] w-40 h-40 bg-[#E8F8F2] rounded-full blur-3xl opacity-50 pointer-events-none"></div>

      {/* Progress Bar */}
      <div className="w-full max-w-md mb-8">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-bold text-gray-500">Benda {currentIndex + 1} dari {items.length}</span>
          <span className="text-sm font-bold text-primary">Skor: {score}</span>
        </div>
        <div className="h-3 w-full bg-gray-100 rounded-full overflow-hidden">
          <div 
            className="h-full bg-primary transition-all duration-500 ease-out"
            style={{ width: `${(currentIndex / items.length) * 100}%` }}
          ></div>
        </div>
      </div>

      {/* Item Display */}
      <div className="flex flex-col items-center mb-10 z-10">
        <div 
          className={`h-40 flex items-center justify-center mb-4 transition-transform duration-300 ${
            isWrong ? "translate-x-2 -translate-y-1 rotate-6 scale-110" : ""
          } ${
            isCorrect ? "scale-125 -translate-y-4" : "scale-100 hover:scale-105"
          }`}
          style={{
            animation: isWrong ? "shake 0.4s cubic-bezier(.36,.07,.19,.97) both" : "none",
          }}
        >
          <img 
            src={`/assets/m1-minigame/${currentItem.image}.png`} 
            alt={currentItem.name} 
            className="max-w-full max-h-full h-full object-contain drop-shadow-2xl" 
          />
        </div>
        <h3 className="text-2xl font-bold text-foreground text-center">
          {currentItem.name}
        </h3>
        
        {/* Feedback Message */}
        <div className="h-8 mt-2">
          {isCorrect && <span className="text-green-500 font-bold text-lg animate-bounce inline-block">✨ Benar Sekali! ✨</span>}
          {isWrong && <span className="text-red-500 font-bold text-lg">❌ Kurang Tepat, coba lagi!</span>}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full max-w-2xl z-10">
        <button
          onClick={() => handleGuess("kubus")}
          disabled={isCorrect}
          className={`flex flex-col items-center justify-center p-4 rounded-3xl border-[3px] transition-all duration-200 active:scale-95 ${
            isCorrect ? "opacity-50 cursor-not-allowed border-border bg-gray-50" : "border-border bg-white hover:border-[#0984E3] hover:bg-[#F0F9FF] hover:-translate-y-1 shadow-[0_4px_0_0_#e5e7eb] hover:shadow-[0_4px_0_0_#0984E3]"
          }`}
        >
          <svg className="w-10 h-10 mb-2 text-[#0984E3]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
            <polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline>
            <line x1="12" y1="22.08" x2="12" y2="12"></line>
          </svg>
          <span className="font-bold text-foreground">Ini Kubus!</span>
        </button>

        <button
          onClick={() => handleGuess("balok")}
          disabled={isCorrect}
          className={`flex flex-col items-center justify-center p-4 rounded-3xl border-[3px] transition-all duration-200 active:scale-95 ${
            isCorrect ? "opacity-50 cursor-not-allowed border-border bg-gray-50" : "border-border bg-white hover:border-[#00B894] hover:bg-[#E8F8F2] hover:-translate-y-1 shadow-[0_4px_0_0_#e5e7eb] hover:shadow-[0_4px_0_0_#00B894]"
          }`}
        >
          <svg className="w-10 h-10 mb-2 text-[#00B894]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M2 10a2 2 0 0 1 1-1.73l8-4.62a2 2 0 0 1 2 0l8 4.62A2 2 0 0 1 22 10v4a2 2 0 0 1-1 1.73l-8 4.62a2 2 0 0 1-2 0l-8-4.62A2 2 0 0 1 2 14v-4z"></path>
            <polyline points="2 10 12 15 22 10"></polyline>
            <line x1="12" y1="20.77" x2="12" y2="15"></line>
          </svg>
          <span className="font-bold text-foreground">Ini Balok!</span>
        </button>

        <button
          onClick={() => handleGuess("lainnya")}
          disabled={isCorrect}
          className={`flex flex-col items-center justify-center p-4 rounded-3xl border-[3px] transition-all duration-200 active:scale-95 ${
            isCorrect ? "opacity-50 cursor-not-allowed border-border bg-gray-50" : "border-border bg-white hover:border-[#D83A3A] hover:bg-[#FCE8E8] hover:-translate-y-1 shadow-[0_4px_0_0_#e5e7eb] hover:shadow-[0_4px_0_0_#D83A3A]"
          }`}
        >
          <svg className="w-10 h-10 mb-2 text-[#D83A3A]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="4.93" y1="4.93" x2="19.07" y2="19.07"></line>
          </svg>
          <span className="font-bold text-foreground">Bukan Keduanya</span>
        </button>
      </div>

      <style dangerouslySetInnerHTML={{__html: `
        @keyframes shake {
          10%, 90% { transform: translate3d(-1px, 0, 0); }
          20%, 80% { transform: translate3d(2px, 0, 0); }
          30%, 50%, 70% { transform: translate3d(-4px, 0, 0); }
          40%, 60% { transform: translate3d(4px, 0, 0); }
        }
      `}} />
    </div>
  );
}
