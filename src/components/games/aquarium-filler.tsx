"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import clsx from "clsx";

interface Item {
  id: string;
  l: number;
  w: number;
  h: number;
  unit: string;
}

const cos30 = Math.cos(Math.PI / 6);
const sin30 = Math.sin(Math.PI / 6);

export default function AquariumFiller({ data }: { data: { items: Item[] } }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);

  const [inputValue, setInputValue] = useState("");
  const [waterLevel, setWaterLevel] = useState(0);
  const [currentWaterLevel, setCurrentWaterLevel] = useState(0);
  const [status, setStatus] = useState<"idle" | "correct" | "overflow" | "underflow">("idle");

  const items = data.items;
  const currentItem = items[currentIndex];



  useEffect(() => {
    if (waterLevel === currentWaterLevel) return;
    
    let start: number | null = null;
    const initialLevel = currentWaterLevel;
    const duration = 2000;

    let frame: number;
    const animate = (time: number) => {
      if (!start) start = time;
      const progress = Math.min(1, (time - start) / duration);
      // Ease in-out
      const easeProgress = progress < 0.5 ? 2 * progress * progress : 1 - Math.pow(-2 * progress + 2, 2) / 2;
      
      if (progress >= 1) {
        setCurrentWaterLevel(waterLevel);
        return;
      }
      setCurrentWaterLevel(initialLevel + (waterLevel - initialLevel) * easeProgress);
      frame = requestAnimationFrame(animate);
    };
    frame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frame);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [waterLevel]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (status !== "idle") return;

    const answer = parseInt(inputValue);
    if (isNaN(answer)) return;

    const correctVolume = currentItem.l * currentItem.w * currentItem.h;
    
    if (answer === correctVolume) {
      setWaterLevel(currentItem.h);
      setStatus("correct");
      setScore(s => s + 1);
      setTimeout(() => {
        if (currentIndex + 1 < items.length) {
          setCurrentIndex(i => i + 1);
          setInputValue("");
          setWaterLevel(0);
          setCurrentWaterLevel(0);
          setStatus("idle");
        } else {
          setGameOver(true);
        }
      }, 2500);
    } else if (answer > correctVolume) {
      // Overflow!
      setWaterLevel(currentItem.h + (currentItem.h * 0.2)); 
      setStatus("overflow");
      setTimeout(() => setStatus("idle"), 2500);
    } else {
      // Underflow
      const ratio = answer / correctVolume;
      // Ensure it's visibly underfilled but proportional
      setWaterLevel(Math.max(0.1, currentItem.h * ratio));
      setStatus("underflow");
      setTimeout(() => setStatus("idle"), 2500);
    }
  };

  const restartGame = () => {
    setCurrentIndex(0);
    setScore(0);
    setGameOver(false);
    setInputValue("");
    setWaterLevel(0);
    setCurrentWaterLevel(0);
    setStatus("idle");
  };

  const renderAquarium = () => {
    const { l, w, h } = currentItem;
    // Base scale so it fits nicely
    const maxDim = Math.max(l, w, h);
    const scale = 180 / maxDim;

    const project = (x: number, y: number, z: number) => {
      const px = (x - z) * cos30 * scale;
      const py = (-(x + z) * sin30 - y) * scale;
      return { x: px, y: py };
    };

    const getPts = (yLevel: number) => [
      project(0, 0, 0), // 0: Front Bottom
      project(l, 0, 0), // 1: Right Bottom
      project(l, 0, w), // 2: Back Bottom
      project(0, 0, w), // 3: Left Bottom
      project(0, yLevel, 0), // 4: Front Top
      project(l, yLevel, 0), // 5: Right Top
      project(l, yLevel, w), // 6: Back Top
      project(0, yLevel, w), // 7: Left Top
    ];

    const box = getPts(h);
    const water = getPts(currentWaterLevel);

    const toStr = (pts: {x: number, y: number}[]) => pts.map(p => `${p.x},${p.y}`).join(" ");

    // We must translate the SVG content to the center since coords can be negative
    // Y min is box[6].y (top back), Y max is box[0].y (front bottom)
    // X min is box[3].x (left), X max is box[1].x (right)
    const bounds = {
      minX: box[3].x,
      maxX: box[1].x,
      minY: box[6].y - 30, // extra for overflow
      maxY: box[0].y + 10
    };
    const viewBoxWidth = bounds.maxX - bounds.minX + 40;
    const viewBoxHeight = bounds.maxY - bounds.minY + 40;
    const offsetX = -bounds.minX + 20;
    const offsetY = -bounds.minY + 20;

    return (
      <svg
        width="100%"
        height="300"
        viewBox={`0 0 ${viewBoxWidth} ${viewBoxHeight}`}
        className="drop-shadow-xl overflow-visible transition-all duration-500"
      >
        <g transform={`translate(${offsetX}, ${offsetY})`}>
          {/* Glass Back Walls */}
          <polygon points={toStr([box[3], box[2], box[6], box[7]])} fill="#f0f9ff" opacity={0.6} />
          <polygon points={toStr([box[1], box[2], box[6], box[5]])} fill="#e0f2fe" opacity={0.6} />
          <polygon points={toStr([box[0], box[1], box[2], box[3]])} fill="#bae6fd" opacity={0.6} />

          {/* Water */}
          <g className="water-group">
            <polygon points={toStr([water[3], water[2], water[6], water[7]])} fill="#0284c7" />
            <polygon points={toStr([water[1], water[2], water[6], water[5]])} fill="#0369a1" />
            <polygon points={toStr([water[4], water[5], water[6], water[7]])} fill="#38bdf8" opacity={0.9} />
            <polygon points={toStr([water[0], water[3], water[7], water[4]])} fill="#0ea5e9" opacity={0.8} />
            <polygon points={toStr([water[0], water[1], water[5], water[4]])} fill="#0284c7" opacity={0.8} />
          </g>

          {/* Pouring Stream */}
          <g 
            className="transition-all duration-300"
            style={{ opacity: status !== "idle" ? 1 : 0 }}
          >
            {/* Outer splash container for organic feel */}
            <path
              d={`M ${project(l/2, h + (maxDim * 1.5), w/2).x} ${project(l/2, h + (maxDim * 1.5), w/2).y} L ${project(l/2, currentWaterLevel, w/2).x} ${project(l/2, currentWaterLevel, w/2).y}`}
              stroke="#38bdf8"
              strokeWidth="12"
              strokeLinecap="round"
              strokeDasharray="15 20"
              className={status !== "idle" ? "animate-pour" : ""}
            />
            <path
              d={`M ${project(l/2, h + (maxDim * 1.5), w/2).x} ${project(l/2, h + (maxDim * 1.5), w/2).y} L ${project(l/2, currentWaterLevel, w/2).x} ${project(l/2, currentWaterLevel, w/2).y}`}
              stroke="#0284c7"
              strokeWidth="6"
              strokeLinecap="round"
              strokeDasharray="8 25"
              className={status !== "idle" ? "animate-pour-fast" : ""}
            />
            {/* Splash at the surface */}
            <ellipse 
              cx={project(l/2, currentWaterLevel, w/2).x} 
              cy={project(l/2, currentWaterLevel, w/2).y} 
              rx="18" ry="6" 
              fill="#e0f2fe" 
              opacity="0.8" 
              className={status !== "idle" ? "animate-splash" : ""}
            />
            <ellipse 
              cx={project(l/2, currentWaterLevel, w/2).x} 
              cy={project(l/2, currentWaterLevel, w/2).y} 
              rx="10" ry="3" 
              fill="#bae6fd" 
              opacity="0.9" 
              className={status !== "idle" ? "animate-splash-inner" : ""}
            />
          </g>

          {/* Overflow Drops */}
          {status === "overflow" && (
            <g>
              {[...Array(15)].map((_, i) => {
                const dropX = project(l/2 + (Math.random() - 0.5) * l, h, w/2 + (Math.random() - 0.5) * w).x + (Math.random() > 0.5 ? 20 + Math.random()*15 : -20 - Math.random()*15);
                const dropY = box[6].y + Math.random() * 30;
                return (
                  <g key={i} transform={`translate(${dropX}, ${dropY})`}>
                    <g 
                      className="overflow-drop"
                      style={{
                        animationDelay: `${Math.random() * 0.5}s`,
                        animationDuration: `${0.6 + Math.random() * 0.4}s`
                      }}
                    >
                      <path 
                        d="M0,0 C4,0 4,8 0,12 C-4,8 -4,0 0,0 Z"
                        fill="#0ea5e9"
                        transform={`scale(${Math.random() * 0.7 + 0.3})`}
                      />
                    </g>
                  </g>
                );
              })}
            </g>
          )}

          {/* Glass Front Walls */}
          <polygon points={toStr([box[0], box[3], box[7], box[4]])} fill="#7dd3fc" opacity={0.2} />
          <polygon points={toStr([box[0], box[1], box[5], box[4]])} fill="#38bdf8" opacity={0.2} />

          {/* Edges */}
          <g stroke="#0284c7" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" opacity={0.5}>
            <line x1={box[0].x} y1={box[0].y} x2={box[1].x} y2={box[1].y} />
            <line x1={box[1].x} y1={box[1].y} x2={box[2].x} y2={box[2].y} />
            <line x1={box[2].x} y1={box[2].y} x2={box[3].x} y2={box[3].y} />
            <line x1={box[3].x} y1={box[3].y} x2={box[0].x} y2={box[0].y} />
            
            <line x1={box[4].x} y1={box[4].y} x2={box[5].x} y2={box[5].y} />
            <line x1={box[5].x} y1={box[5].y} x2={box[6].x} y2={box[6].y} />
            <line x1={box[6].x} y1={box[6].y} x2={box[7].x} y2={box[7].y} />
            <line x1={box[7].x} y1={box[7].y} x2={box[4].x} y2={box[4].y} />
            
            <line x1={box[0].x} y1={box[0].y} x2={box[4].x} y2={box[4].y} />
            <line x1={box[1].x} y1={box[1].y} x2={box[5].x} y2={box[5].y} />
            <line x1={box[2].x} y1={box[2].y} x2={box[6].x} y2={box[6].y} />
            <line x1={box[3].x} y1={box[3].y} x2={box[7].x} y2={box[7].y} />
          </g>
          
          {/* Dimension Labels */}
          {/* Length */}
          <text x={(box[0].x + box[1].x)/2 + 10} y={(box[0].y + box[1].y)/2 + 25} fontSize="14" fontWeight="bold" fill="#0369a1" textAnchor="middle">
            {l} {currentItem.unit}
          </text>
          {/* Width */}
          <text x={(box[0].x + box[3].x)/2 - 15} y={(box[0].y + box[3].y)/2 + 20} fontSize="14" fontWeight="bold" fill="#0369a1" textAnchor="middle">
            {w} {currentItem.unit}
          </text>
          {/* Height */}
          <text x={box[1].x + 15} y={(box[1].y + box[5].y)/2} fontSize="14" fontWeight="bold" fill="#0369a1" textAnchor="start">
            {h} {currentItem.unit}
          </text>
        </g>
      </svg>
    );
  };

  if (gameOver) {
    return (
      <div className="flex flex-col items-center justify-center p-8 bg-white rounded-4xl border-[3px] border-border shadow-sm min-h-[500px]">
        <div className="text-8xl mb-6 animate-bounce">🌊</div>
        <h2 className="text-3xl font-bold text-foreground mb-2">Hebat Sekali!</h2>
        <p className="text-gray-500 font-semibold mb-8 text-center max-w-md">
          Kamu berhasil menghitung dan mengisi penuh semua akuarium!
          Skor akhirmu: <span className="text-[#0284c7] font-bold text-xl">{score}</span> / {items.length}.
        </p>
        <div className="flex gap-4">
          <button
            onClick={restartGame}
            className="px-6 py-3 bg-[#e0f2fe] text-[#0369a1] border-2 border-[#bae6fd] font-bold rounded-2xl hover:bg-white transition-all active:scale-95"
          >
            Main Lagi
          </button>
          <Link
            href="/"
            className="px-6 py-3 bg-[#0284c7] text-white font-bold rounded-2xl hover:bg-[#0369a1] transition-all active:scale-95 shadow-[0_4px_0_0_#075985]"
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
      <div className="absolute top-[-50px] left-[-50px] w-64 h-64 bg-[#e0f2fe] rounded-full blur-3xl opacity-50 pointer-events-none"></div>
      <div className="absolute bottom-[-50px] right-[-50px] w-64 h-64 bg-[#dbeafe] rounded-full blur-3xl opacity-50 pointer-events-none"></div>

      {/* Progress Bar */}
      <div className="w-full max-w-md mb-4 z-10">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-bold text-gray-500">Akuarium {currentIndex + 1} dari {items.length}</span>
          <span className="text-sm font-bold text-[#0284c7]">Skor: {score}</span>
        </div>
        <div className="h-3 w-full bg-gray-100 rounded-full overflow-hidden">
          <div 
            className="h-full bg-[#0ea5e9] transition-all duration-500 ease-out"
            style={{ width: `${(currentIndex / items.length) * 100}%` }}
          ></div>
        </div>
      </div>

      {/* Visual Aquarium */}
      <div className="w-full max-w-lg mb-6 z-10 flex flex-col items-center">
        {renderAquarium()}
      </div>

      {/* Status Feedback */}
      <div className="h-10 flex items-center justify-center z-10 mb-2 w-full max-w-md">
        {status === "correct" && (
          <p className="text-green-500 font-bold animate-bounce text-lg">Penuh Sempurna! 💦</p>
        )}
        {status === "overflow" && (
          <p className="text-red-500 font-bold animate-shake text-lg">Yah, airnya tumpah! 🌊</p>
        )}
        {status === "underflow" && (
          <p className="text-orange-500 font-bold text-lg">Airnya kurang penuh! 💧</p>
        )}
        {status === "idle" && (
          <p className="text-gray-400 font-medium text-sm text-center">Penuhi akuarium dengan air!</p>
        )}
      </div>

      {/* Input Controls */}
      <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-4 w-full max-w-md z-10">
        <div className="relative flex-1">
          <input
            type="number"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            disabled={status === "correct"}
            placeholder="Volume..."
            className="w-full h-14 px-4 pr-12 rounded-2xl border-[3px] border-border bg-gray-50 focus:bg-white focus:border-[#0284c7] focus:ring-4 focus:ring-[#e0f2fe] transition-all text-xl font-bold text-center outline-none"
          />
          <span className="absolute right-4 top-1/2 -translate-y-1/2 font-bold text-gray-400">
            {currentItem.unit}³
          </span>
        </div>
        <button
          type="submit"
          disabled={status === "correct" || !inputValue}
          className={clsx(
            "h-14 px-8 rounded-2xl font-bold text-lg transition-all flex items-center justify-center gap-2",
            status === "correct" || !inputValue 
              ? "bg-gray-200 text-gray-400 border-2 border-transparent cursor-not-allowed" 
              : "bg-[#0ea5e9] text-white border-b-4 border-[#0284c7] active:border-b-0 active:translate-y-1 hover:bg-[#0284c7]"
          )}
        >
          Isi Air
        </button>
      </form>

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
        @keyframes pour {
          0% { opacity: 0; stroke-dashoffset: 100; }
          10% { opacity: 1; stroke-dashoffset: 0; }
          90% { opacity: 1; stroke-dashoffset: -400; }
          100% { opacity: 0; stroke-dashoffset: -500; }
        }
        .animate-pour {
          animation: pour 2.5s linear forwards;
        }
        @keyframes pourFast {
          0% { opacity: 0; stroke-dashoffset: 200; }
          10% { opacity: 1; stroke-dashoffset: 0; }
          90% { opacity: 1; stroke-dashoffset: -600; }
          100% { opacity: 0; stroke-dashoffset: -800; }
        }
        .animate-pour-fast {
          animation: pourFast 2.5s linear forwards;
        }
        @keyframes splash {
          0% { transform: scale(0); opacity: 0; }
          10% { transform: scale(1); opacity: 0.8; }
          80% { transform: scale(1.5); opacity: 0.5; }
          100% { transform: scale(2); opacity: 0; }
        }
        .animate-splash {
          animation: splash 2.5s ease-out forwards;
          transform-origin: center;
        }
        @keyframes splashInner {
          0% { transform: scale(0); opacity: 0; }
          10% { transform: scale(0.5); opacity: 0.9; }
          80% { transform: scale(1); opacity: 0.6; }
          100% { transform: scale(1.2); opacity: 0; }
        }
        .animate-splash-inner {
          animation: splashInner 2.5s ease-out forwards;
          transform-origin: center;
        }
        @keyframes overflowDrops {
          0% { transform: translateY(-10px); opacity: 0; }
          10% { transform: translateY(0); opacity: 1; }
          100% { transform: translateY(120px); opacity: 0; }
        }
        .overflow-drop {
          animation: overflowDrops 1s cubic-bezier(0.4, 0, 1, 1) infinite;
        }
      `}</style>
    </div>
  );
}
