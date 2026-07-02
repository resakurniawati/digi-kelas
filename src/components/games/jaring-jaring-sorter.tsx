"use client";

import { useState } from "react";
import Link from "next/link";
import clsx from "clsx";

interface Face {
  x: number;
  y: number;
  w: number;
  h: number;
}

interface Item {
  id: string;
  isValid: boolean;
  squares?: [number, number][]; // Array of [x, y] coordinates
  faces?: Face[];
}

export default function JaringJaringSorter({ data }: { data: { items: Item[] } }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [isWrong, setIsWrong] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [gameOver, setGameOver] = useState(false);

  const items = data.items;
  const currentItem = items[currentIndex];

  const handleGuess = (guessIsValid: boolean) => {
    if (guessIsValid === currentItem.isValid) {
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
      }, 600);
    }
  };

  const restartGame = () => {
    setCurrentIndex(0);
    setScore(0);
    setGameOver(false);
    setIsCorrect(false);
    setIsWrong(false);
  };

  const renderNet = (squares?: [number, number][], faces?: Face[]) => {
    let rects = faces;
    if (!rects && squares) {
      rects = squares.map(s => ({ x: s[0], y: s[1], w: 1, h: 1 }));
    }
    
    if (!rects || rects.length === 0) return null;

    const minX = Math.min(...rects.map((r) => r.x));
    const maxX = Math.max(...rects.map((r) => r.x + r.w));
    const minY = Math.min(...rects.map((r) => r.y));
    const maxY = Math.max(...rects.map((r) => r.y + r.h));

    const gridW = maxX - minX;
    const gridH = maxY - minY;

    const maxDimension = Math.max(gridW, gridH);
    const scale = Math.min(40, 220 / maxDimension); 
    const padding = 15;
    const width = gridW * scale + padding * 2;
    const height = gridH * scale + padding * 2;

    return (
      <svg
        width={width}
        height={height}
        viewBox={`0 0 ${width} ${height}`}
        className="drop-shadow-md"
      >
        {rects.map((rect, i) => {
          const x = (rect.x - minX) * scale + padding;
          const y = (rect.y - minY) * scale + padding;
          const w = rect.w * scale;
          const h = rect.h * scale;
          return (
            <rect
              key={i}
              x={x}
              y={y}
              width={w}
              height={h}
              fill="#DDF7EC"
              stroke="#0FA958"
              strokeWidth="3"
              rx="4"
              className={clsx(
                "transition-all duration-300",
                isCorrect ? "fill-green-300 stroke-green-600" : "",
                isWrong ? "fill-red-200 stroke-red-500" : ""
              )}
            />
          );
        })}
      </svg>
    );
  };

  if (gameOver) {
    return (
      <div className="flex flex-col items-center justify-center p-8 bg-white rounded-4xl border-[3px] border-border shadow-sm min-h-[500px]">
        <div className="text-8xl mb-6">🎉</div>
        <h2 className="text-3xl font-bold text-foreground mb-2">Permainan Selesai!</h2>
        <p className="text-gray-500 font-semibold mb-8 text-center max-w-md">
          Hebat! Kamu berhasil menganalisis semua jaring-jaring dengan benar.
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
      <div className="w-full max-w-md mb-8 z-10">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-bold text-gray-500">Pola {currentIndex + 1} dari {items.length}</span>
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
      <div className="flex flex-col items-center mb-10 z-10 min-h-[200px] justify-center">
        <div 
          className={clsx(
            "transition-all duration-300 flex items-center justify-center p-6 rounded-3xl",
            isWrong && "animate-shake bg-red-50",
            isCorrect && "scale-110 bg-green-50",
            !isWrong && !isCorrect && "bg-gray-50"
          )}
        >
          {renderNet(currentItem.squares, currentItem.faces)}
        </div>
      </div>

      {/* Controls */}
      <div className="grid grid-cols-2 gap-4 w-full max-w-md z-10">
        <button
          onClick={() => handleGuess(true)}
          disabled={isCorrect || isWrong}
          className={`flex flex-col items-center justify-center p-4 rounded-3xl border-[3px] transition-all duration-200 active:scale-95 ${
            isCorrect || isWrong ? "opacity-50 cursor-not-allowed border-border bg-gray-50" : "border-border bg-white hover:border-[#00B894] hover:bg-[#E8F8F2] hover:-translate-y-1 shadow-[0_4px_0_0_#e5e7eb] hover:shadow-[0_4px_0_0_#00B894]"
          }`}
        >
          <svg className="w-10 h-10 mb-2 text-[#00B894]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12"></polyline>
          </svg>
          <span className="font-bold text-foreground text-center">Bisa Dilipat</span>
        </button>
        <button
          onClick={() => handleGuess(false)}
          disabled={isCorrect || isWrong}
          className={`flex flex-col items-center justify-center p-4 rounded-3xl border-[3px] transition-all duration-200 active:scale-95 ${
            isCorrect || isWrong ? "opacity-50 cursor-not-allowed border-border bg-gray-50" : "border-border bg-white hover:border-[#D83A3A] hover:bg-[#FCE8E8] hover:-translate-y-1 shadow-[0_4px_0_0_#e5e7eb] hover:shadow-[0_4px_0_0_#D83A3A]"
          }`}
        >
          <svg className="w-10 h-10 mb-2 text-[#D83A3A]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
          <span className="font-bold text-foreground text-center">Tidak Bisa</span>
        </button>
      </div>
      
      {/* Feedback Message */}
      <div className="mt-6 h-8 flex items-center justify-center z-10">
        {isWrong && (
          <p className="text-red-500 font-bold animate-bounce flex items-center gap-2">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
            Coba perhatikan lagi polanya!
          </p>
        )}
        {isCorrect && (
          <p className="text-green-500 font-bold animate-pulse flex items-center gap-2">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
            Tebakan yang tepat!
          </p>
        )}
      </div>

      <style jsx global>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-8px); }
          50% { transform: translateX(8px); }
          75% { transform: translateX(-8px); }
        }
        .animate-shake {
          animation: shake 0.4s cubic-bezier(.36,.07,.19,.97) both;
        }
      `}</style>
    </div>
  );
}
