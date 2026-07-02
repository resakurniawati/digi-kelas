"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, ArrowRight, Focus, Combine } from "lucide-react";
import confetti from "canvas-confetti";

type Dimensions = { p: number; l: number; t: number };
type ShapeDef = { type: string; dimensions: Dimensions; color: string };

type Item = {
  id: string;
  name: string;
  shapeA: ShapeDef;
  shapeB: ShapeDef;
  overlap: { p: number; l: number };
  offset: { x: number; z: number };
};

const getObliqueVertices = (p: number, l: number, t: number, scale: number, sx = 0, sy = 0) => {
  const V0 = { x: sx, y: sy };
  const V1 = { x: sx + p * scale, y: sy };
  const V4 = { x: sx, y: sy - t * scale };
  const V5 = { x: sx + p * scale, y: sy - t * scale };

  const angle = Math.PI / 6;
  const depthScale = 0.6;
  const dx = l * scale * depthScale * Math.cos(angle);
  const dy = -l * scale * depthScale * Math.sin(angle);

  const V3 = { x: V0.x + dx, y: V0.y + dy };
  const V2 = { x: V1.x + dx, y: V1.y + dy };
  const V7 = { x: V4.x + dx, y: V4.y + dy };
  const V6 = { x: V5.x + dx, y: V5.y + dy };

  return { V0, V1, V2, V3, V4, V5, V6, V7 };
};

const adjustColor = (color: string, amount: number) => {
  return '#' + color.replace(/^#/, '').replace(/../g, c => 
    ('0'+Math.min(255, Math.max(0, parseInt(c, 16) + amount)).toString(16)).substr(-2)
  );
};

// Calculate surface area (Luas Permukaan) of a single block
const calcArea = (d: Dimensions) => 2 * (d.p * d.l + d.p * d.t + d.l * d.t);

export default function CompositeShapeArchitect({ data }: { data: { items: Item[] } }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isGameFinished, setIsGameFinished] = useState(false);
  
  const handleNext = () => {
    if (currentIndex === data.items.length - 1) {
      setIsGameFinished(true);
    } else {
      setCurrentIndex(prev => prev + 1);
    }
  };

  const handleRestart = () => {
    setCurrentIndex(0);
    setIsGameFinished(false);
  };

  if (isGameFinished) {
    return (
      <div className="flex flex-col items-center justify-center p-12 bg-white rounded-3xl shadow-sm border-[3px] border-border text-center max-w-5xl mx-auto min-h-[400px]">
        <h2 className="text-4xl font-black text-foreground mb-4">Misi Selesai! 🏆</h2>
        <p className="text-lg text-slate-500 mb-8 max-w-xl">
          Kamu telah berhasil menjadi Arsitek Blok yang handal! Kini kamu sudah memahami cara menghitung luas permukaan bangun gabungan dengan mengeliminasi sisi yang berhimpitan.
        </p>
        <div className="flex gap-4">
          <button
            onClick={handleRestart}
            className="px-6 py-3 bg-slate-100 text-slate-700 font-bold rounded-2xl border-2 border-slate-200 hover:bg-slate-200 transition-all"
          >
            Ulangi Permainan
          </button>
        </div>
      </div>
    );
  }

  const item = data.items[currentIndex];

  return (
    <CompositeShapeGame 
      key={item.id} 
      item={item} 
      totalItems={data.items.length} 
      currentIndex={currentIndex} 
      onNext={handleNext} 
    />
  );
}

function CompositeShapeGame({ item, totalItems, currentIndex, onNext }: { item: Item; totalItems: number; currentIndex: number; onNext: () => void }) {
  const [isSeparated, setIsSeparated] = useState(false);
  
  const [areaA, setAreaA] = useState("");
  const [areaB, setAreaB] = useState("");
  const [areaOverlap, setAreaOverlap] = useState("");
  const [totalArea, setTotalArea] = useState("");
  
  const [errorMsg, setErrorMsg] = useState("");
  const [isWin, setIsWin] = useState(false);

  const correctA = calcArea(item.shapeA.dimensions);
  const correctB = calcArea(item.shapeB.dimensions);
  const correctOverlap = item.overlap.p * item.overlap.l;
  const correctTotal = correctA + correctB - (2 * correctOverlap);

  const isA_correct = parseInt(areaA) === correctA;
  const isB_correct = parseInt(areaB) === correctB;
  const isOverlap_correct = parseInt(areaOverlap) === correctOverlap;
  const allPartsCorrect = isA_correct && isB_correct && isOverlap_correct;

  const handleSubmitParts = (e: React.FormEvent) => {
    e.preventDefault();
    if (allPartsCorrect) {
      setErrorMsg("");
    } else {
      setErrorMsg("Ada perhitungan luas yang belum tepat. Coba cek lagi!");
    }
  };

  const handleSubmitTotal = (e: React.FormEvent) => {
    e.preventDefault();
    if (parseInt(totalArea) === correctTotal) {
      setErrorMsg("");
      setIsWin(true);
      setIsSeparated(false); // recombine
      confetti({ particleCount: 150, spread: 80, origin: { y: 0.6 } });
    } else {
      setErrorMsg("Total Luas Permukaan Gabungan salah.");
    }
  };

  // SVG Rendering Logic
  const maxDim = Math.max(item.shapeA.dimensions.p, item.shapeB.dimensions.p + item.offset.x, item.shapeA.dimensions.l, item.shapeA.dimensions.t + item.shapeB.dimensions.t);
  const scale = 140 / maxDim;

  // A coordinates
  const vA = getObliqueVertices(item.shapeA.dimensions.p, item.shapeA.dimensions.l, item.shapeA.dimensions.t, scale, 0, 0);
  
  // B starting coordinates (Top of A, offset x and z)
  const angle = Math.PI / 6;
  const depthScale = 0.6;
  const bStartX = item.offset.x * scale + item.offset.z * scale * depthScale * Math.cos(angle);
  const bStartY = -item.shapeA.dimensions.t * scale - item.offset.z * scale * depthScale * Math.sin(angle);
  const vB = getObliqueVertices(item.shapeB.dimensions.p, item.shapeB.dimensions.l, item.shapeB.dimensions.t, scale, bStartX, bStartY);

  // Overlap Rect coordinates (Top face of overlap region)
  const vO = getObliqueVertices(item.overlap.p, item.overlap.l, 0, scale, bStartX, bStartY);

  // Center SVG
  const actualMinX = Math.min(vA.V3.x, vA.V4.x, vA.V0.x);
  const actualMaxX = Math.max(vA.V1.x, vA.V2.x, vB.V1.x, vB.V2.x);
  const minY = Math.min(vB.V4.y, vB.V5.y, vB.V6.y, vB.V7.y);
  const maxY = Math.max(vA.V0.y, vA.V1.y, vA.V2.y, vA.V3.y);
  
  const dx = 200 - (actualMaxX - actualMinX) / 2 - actualMinX;
  const dy = 200 - (maxY - minY) / 2 - minY;

  const tr = (pt: {x: number, y: number}) => `${pt.x + dx},${pt.y + dy}`;

  const renderShape = (v: any, color: string, isTranslucent: boolean) => {
    const topFace = `${tr(v.V4)} ${tr(v.V5)} ${tr(v.V6)} ${tr(v.V7)}`;
    const frontFace = `${tr(v.V0)} ${tr(v.V1)} ${tr(v.V5)} ${tr(v.V4)}`;
    const rightFace = `${tr(v.V1)} ${tr(v.V2)} ${tr(v.V6)} ${tr(v.V5)}`;
    
    return (
      <g opacity={isTranslucent ? 0.6 : 1} className="transition-opacity duration-700">
        <polygon points={topFace} fill={adjustColor(color, 20)} stroke={adjustColor(color, -40)} strokeWidth="2" strokeLinejoin="round" />
        <polygon points={frontFace} fill={color} stroke={adjustColor(color, -40)} strokeWidth="2" strokeLinejoin="round" />
        <polygon points={rightFace} fill={adjustColor(color, -20)} stroke={adjustColor(color, -40)} strokeWidth="2" strokeLinejoin="round" />
      </g>
    );
  };

  const renderOverlap = () => {
    const topFace = `${tr(vO.V4)} ${tr(vO.V5)} ${tr(vO.V6)} ${tr(vO.V7)}`;
    return (
      <polygon points={topFace} fill="#ef4444" opacity="0.8" stroke="#b91c1c" strokeWidth="2" strokeDasharray="4" className="animate-pulse" />
    );
  };

  return (
    <div className="flex flex-col md:flex-row gap-6 w-full max-w-5xl mx-auto bg-white rounded-3xl p-6 shadow-sm border-[3px] border-border">
      
      {/* Visual Area */}
      <div className="flex-1 min-h-[400px] flex flex-col items-center justify-center bg-slate-50 rounded-2xl border-2 border-slate-200 relative overflow-hidden">
        <svg width="100%" height="100%" viewBox="0 0 400 400" className="overflow-visible">
          {/* Shape A */}
          <g>
            {renderShape(vA, item.shapeA.color, isSeparated)}
            {isSeparated && renderOverlap()}
          </g>

          {/* Shape B (Animated translation) */}
          <motion.g 
            initial={false}
            animate={{ 
              x: isSeparated ? 60 : 0, 
              y: isSeparated ? -60 : 0 
            }}
            transition={{ type: "spring", stiffness: 80, damping: 15 }}
          >
            {renderShape(vB, item.shapeB.color, isSeparated)}
            {/* Draw overlap on bottom of B as well */}
            {isSeparated && (
              <polygon 
                points={`${tr(vO.V0)} ${tr(vO.V1)} ${tr(vO.V2)} ${tr(vO.V3)}`} 
                fill="#ef4444" opacity="0.8" stroke="#b91c1c" strokeWidth="2" strokeDasharray="4" className="animate-pulse"
              />
            )}
          </motion.g>
        </svg>

        {!isSeparated && !isWin && (
          <button 
            onClick={() => setIsSeparated(true)}
            className="absolute bottom-6 px-6 py-3 bg-primary text-primary-foreground font-bold rounded-2xl shadow-[0_4px_0_0_rgba(0,0,0,0.1)] hover:translate-y-1 hover:shadow-none transition-all flex items-center gap-2"
          >
            <Combine className="size-5" /> Pisahkan Bangun
          </button>
        )}
      </div>

      {/* Control Area */}
      <div className="flex-1 flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-black text-foreground">{item.name}</h2>
            <p className="text-slate-500 font-medium">Bongkar bangun untuk melihat sisi dalamnya.</p>
          </div>
          <div className="px-3 py-1 bg-slate-100 rounded-lg text-sm font-bold text-slate-600">
            {currentIndex + 1} / {totalItems}
          </div>
        </div>

        <hr className="border-slate-200" />

        {!isSeparated && !isWin ? (
           <div className="flex-1 flex flex-col items-center justify-center text-center p-6 text-slate-500">
             <Focus className="size-12 text-slate-300 mb-4" />
             <p className="font-medium">Tekan tombol <strong className="text-primary">Pisahkan Bangun</strong> untuk mulai menghitung luas masing-masing bagian.</p>
           </div>
        ) : (
          <div className="flex-1 flex flex-col animate-in fade-in slide-in-from-right-4">
            {!allPartsCorrect ? (
              <form onSubmit={handleSubmitParts} className="space-y-4">
                <p className="font-bold text-slate-700">1. Hitung Luas Permukaan tiap bagian dan Daerah Berhimpitan (merah).</p>
                
                <div className="p-4 rounded-xl border-2 border-slate-200 bg-slate-50 flex items-center justify-between gap-4">
                  <div>
                    <p className="font-bold" style={{ color: item.shapeA.color }}>Bangun A ({item.shapeA.type})</p>
                    <p className="text-sm font-medium text-slate-500">{item.shapeA.dimensions.p} × {item.shapeA.dimensions.l} × {item.shapeA.dimensions.t}</p>
                  </div>
                  <input
                    type="number"
                    value={areaA}
                    onChange={(e) => setAreaA(e.target.value)}
                    disabled={isA_correct}
                    className={`w-24 px-3 py-2 rounded-lg border-2 font-bold text-center outline-none ${isA_correct ? 'bg-green-100 border-green-400 text-green-700' : 'bg-white border-slate-300 focus:border-primary'}`}
                    placeholder="Luas..."
                  />
                </div>

                <div className="p-4 rounded-xl border-2 border-slate-200 bg-slate-50 flex items-center justify-between gap-4">
                  <div>
                    <p className="font-bold" style={{ color: item.shapeB.color }}>Bangun B ({item.shapeB.type})</p>
                    <p className="text-sm font-medium text-slate-500">{item.shapeB.dimensions.p} × {item.shapeB.dimensions.l} × {item.shapeB.dimensions.t}</p>
                  </div>
                  <input
                    type="number"
                    value={areaB}
                    onChange={(e) => setAreaB(e.target.value)}
                    disabled={isB_correct}
                    className={`w-24 px-3 py-2 rounded-lg border-2 font-bold text-center outline-none ${isB_correct ? 'bg-green-100 border-green-400 text-green-700' : 'bg-white border-slate-300 focus:border-primary'}`}
                    placeholder="Luas..."
                  />
                </div>

                <div className="p-4 rounded-xl border-2 border-red-200 bg-red-50 flex items-center justify-between gap-4">
                  <div>
                    <p className="font-bold text-red-600">Daerah Berhimpitan</p>
                    <p className="text-sm font-medium text-red-400">P = {item.overlap.p}, L = {item.overlap.l}</p>
                  </div>
                  <input
                    type="number"
                    value={areaOverlap}
                    onChange={(e) => setAreaOverlap(e.target.value)}
                    disabled={isOverlap_correct}
                    className={`w-24 px-3 py-2 rounded-lg border-2 font-bold text-center outline-none ${isOverlap_correct ? 'bg-green-100 border-green-400 text-green-700' : 'bg-white border-red-300 focus:border-red-500'}`}
                    placeholder="Luas..."
                  />
                </div>

                {errorMsg && <p className="text-red-500 text-sm font-bold text-center">{errorMsg}</p>}

                <button type="submit" className="w-full py-3 bg-primary text-white font-bold rounded-xl shadow-[0_4px_0_0_rgba(0,0,0,0.1)] hover:translate-y-1 hover:shadow-none transition-all">
                  Cek Jawaban
                </button>
              </form>
            ) : !isWin ? (
              <form onSubmit={handleSubmitTotal} className="space-y-4 animate-in fade-in zoom-in-95">
                <div className="p-6 rounded-2xl border-2 border-green-200 bg-green-50 text-center">
                  <div className="w-12 h-12 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Check className="size-6" />
                  </div>
                  <h3 className="font-bold text-green-800 mb-2">Semua bagian benar!</h3>
                  
                  {/* Summary of inputs */}
                  <div className="bg-white p-3 rounded-xl mb-4 border border-green-200 flex justify-around text-sm shadow-sm">
                    <div className="flex flex-col">
                      <span className="text-slate-500 font-medium text-xs">Luas A</span>
                      <span className="font-bold text-slate-700 text-base">{areaA}</span>
                    </div>
                    <div className="w-px bg-green-200 mx-1"></div>
                    <div className="flex flex-col">
                      <span className="text-slate-500 font-medium text-xs">Luas B</span>
                      <span className="font-bold text-slate-700 text-base">{areaB}</span>
                    </div>
                    <div className="w-px bg-green-200 mx-1"></div>
                    <div className="flex flex-col">
                      <span className="text-red-400 font-medium text-xs">Berhimpitan</span>
                      <span className="font-bold text-red-600 text-base">{areaOverlap}</span>
                    </div>
                  </div>

                  <p className="text-sm font-medium text-green-700 mb-4">
                    Sekarang, hitung Total Luas Permukaan Gabungan:<br/>
                    <span className="bg-white px-3 py-1.5 rounded-lg border border-green-200 inline-block mt-2 font-mono shadow-sm">
                      <span className="text-slate-700">{areaA}</span> + <span className="text-slate-700">{areaB}</span> - (2 × <span className="text-red-600">{areaOverlap}</span>)
                    </span>
                  </p>
                  
                  <div className="flex gap-3">
                    <input
                      type="number"
                      value={totalArea}
                      onChange={(e) => setTotalArea(e.target.value)}
                      placeholder="Total..."
                      className="flex-1 px-4 py-3 rounded-xl border-2 border-green-300 focus:border-green-500 outline-none font-bold text-lg text-center"
                      autoFocus
                    />
                    <button type="submit" className="px-6 py-3 bg-green-600 text-white font-bold rounded-xl shadow-[0_4px_0_0_#16a34a] hover:translate-y-1 hover:shadow-none transition-all">
                      Selesai!
                    </button>
                  </div>
                  {errorMsg && <p className="text-red-500 text-sm font-bold mt-3">{errorMsg}</p>}
                </div>
              </form>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-center p-6 animate-in slide-in-from-bottom-4">
                <h3 className="text-2xl font-black text-foreground mb-4">Tepat Sekali! 🎉</h3>
                <p className="text-slate-600 font-medium mb-8">
                  Ingat, sisi yang berhimpitan tidak dihitung dalam luas permukaan karena tertutup oleh bangun lain. Luar biasa!
                </p>
                <button
                  onClick={onNext}
                  className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-primary text-white font-bold text-lg rounded-2xl shadow-[0_4px_0_0_rgba(0,0,0,0.1)] hover:translate-y-1 hover:shadow-none transition-all"
                >
                  {currentIndex === totalItems - 1 ? "Selesaikan Permainan" : "Bangun Berikutnya"} <ArrowRight className="size-5" />
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
