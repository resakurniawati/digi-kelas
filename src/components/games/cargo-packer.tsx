"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, ArrowRight, Package } from "lucide-react";
import confetti from "canvas-confetti";

type Dimensions = { p: number; l: number; t: number };

type Item = {
  id: string;
  name: string;
  container: Dimensions;
  box: Dimensions;
  color: string;
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

export default function CargoPacker({ data }: { data: { items: Item[] } }) {
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
        <h2 className="text-4xl font-black text-foreground mb-4">Master Kargo! 🏆</h2>
        <p className="text-lg text-slate-500 mb-8 max-w-xl">
          Kamu telah berhasil mengoptimalkan seluruh ruang kargo dengan sempurna! Kemampuan menghitung volume dan tata ruangmu sudah setingkat ahli.
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
    <CargoPackerGame 
      key={item.id} 
      item={item} 
      totalItems={data.items.length} 
      currentIndex={currentIndex} 
      onNext={handleNext} 
    />
  );
}

function CargoPackerGame({ item, totalItems, currentIndex, onNext }: { item: Item; totalItems: number; currentIndex: number; onNext: () => void }) {
  const [inputValue, setInputValue] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [isAnimating, setIsAnimating] = useState(false);
  const [isWin, setIsWin] = useState(false);
  const [animatedBoxes, setAnimatedBoxes] = useState<any[]>([]);

  const nx = Math.floor(item.container.p / item.box.p);
  const nz = Math.floor(item.container.l / item.box.l);
  const ny = Math.floor(item.container.t / item.box.t);
  const correctAmount = nx * nz * ny;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseInt(inputValue);
    
    if (isNaN(val) || val <= 0) {
      setErrorMsg("Masukkan angka yang valid.");
      return;
    }

    if (val === correctAmount) {
      setErrorMsg("");
      triggerAnimation(val, true);
    } else {
      setErrorMsg("");
      triggerAnimation(val, false);
    }
  };

  const triggerAnimation = (amount: number, isCorrect: boolean) => {
    setIsAnimating(true);
    setIsWin(false);
    
    const boxes = [];
    const maxRender = Math.min(amount, 100); // cap for performance

    for (let i = 0; i < maxRender; i++) {
      if (i < correctAmount) {
        // Fits inside exactly
        const iy = Math.floor(i / (nx * nz));
        const rem = i % (nx * nz);
        const iz = Math.floor(rem / nx);
        const ix = rem % nx;
        boxes.push({ id: i, ix, iy, iz, isSpill: false });
      } else {
        // Spill over
        const ix = Math.random() * nx;
        const iz = Math.random() * nz;
        const iy = ny + Math.random() * 2; 
        const rot = Math.random() * 20 - 10;
        boxes.push({ id: i, ix, iy, iz, isSpill: true, rot });
      }
    }

    // Sort drawing order: back to front, bottom to top, left to right
    boxes.sort((a, b) => {
      if (a.isSpill !== b.isSpill) return a.isSpill ? 1 : -1;
      if (a.iz !== b.iz) return b.iz - a.iz;
      if (a.iy !== b.iy) return a.iy - b.iy;
      return a.ix - b.ix;
    });

    setAnimatedBoxes(boxes);

    // If correct, show win state after animation completes
    if (isCorrect) {
      setTimeout(() => {
        setIsWin(true);
        confetti({ particleCount: 150, spread: 80, origin: { y: 0.6 } });
      }, maxRender * 50 + 800);
    } else {
      setTimeout(() => {
        setErrorMsg(amount > correctAmount ? "Terlalu banyak! Kotaknya meluber keluar kargo." : "Masih ada ruang kosong yang tersisa. Coba hitung lagi.");
        setIsAnimating(false);
      }, maxRender * 50 + 800);
    }
  };

  // SVG Render Logic
  const maxDim = Math.max(item.container.p, item.container.l, item.container.t);
  const scale = 180 / maxDim;

  const renderShape = (v: any, color: string, isTranslucent = false, opacity = 1) => {
    const tr = (pt: {x: number, y: number}) => `${pt.x},${pt.y}`;
    
    const topFace = `${tr(v.V4)} ${tr(v.V5)} ${tr(v.V6)} ${tr(v.V7)}`;
    const frontFace = `${tr(v.V0)} ${tr(v.V1)} ${tr(v.V5)} ${tr(v.V4)}`;
    const rightFace = `${tr(v.V1)} ${tr(v.V2)} ${tr(v.V6)} ${tr(v.V5)}`;
    
    // For container, we want to see inside. We draw the back faces first!
    if (isTranslucent) {
      const backFace = `${tr(v.V3)} ${tr(v.V2)} ${tr(v.V6)} ${tr(v.V7)}`;
      const leftFace = `${tr(v.V0)} ${tr(v.V3)} ${tr(v.V7)} ${tr(v.V4)}`;
      const bottomFace = `${tr(v.V0)} ${tr(v.V1)} ${tr(v.V2)} ${tr(v.V3)}`;
      
      return (
        <g opacity={opacity}>
          {/* Inner back walls */}
          <polygon points={backFace} fill="#f8fafc" stroke="#e2e8f0" strokeWidth="2" strokeLinejoin="round" />
          <polygon points={leftFace} fill="#f1f5f9" stroke="#e2e8f0" strokeWidth="2" strokeLinejoin="round" />
          <polygon points={bottomFace} fill="#e2e8f0" stroke="#cbd5e1" strokeWidth="2" strokeLinejoin="round" />
          
          {/* We DON'T draw front and top to keep it open! Just the wireframe for front */}
          <polyline points={`${tr(v.V4)} ${tr(v.V5)} ${tr(v.V1)} ${tr(v.V0)}`} fill="none" stroke="#94a3b8" strokeWidth="2" strokeDasharray="6" />
          <polyline points={`${tr(v.V5)} ${tr(v.V6)} ${tr(v.V2)}`} fill="none" stroke="#94a3b8" strokeWidth="2" strokeDasharray="6" />
        </g>
      );
    }

    return (
      <g opacity={opacity}>
        <polygon points={topFace} fill={adjustColor(color, 20)} stroke={adjustColor(color, -40)} strokeWidth="1" strokeLinejoin="round" />
        <polygon points={frontFace} fill={color} stroke={adjustColor(color, -40)} strokeWidth="1" strokeLinejoin="round" />
        <polygon points={rightFace} fill={adjustColor(color, -20)} stroke={adjustColor(color, -40)} strokeWidth="1" strokeLinejoin="round" />
      </g>
    );
  };

  const vContainer = getObliqueVertices(item.container.p, item.container.l, item.container.t, scale, 0, 0);

  // Center SVG
  const actualMinX = Math.min(vContainer.V3.x, vContainer.V4.x, vContainer.V0.x);
  const actualMaxX = Math.max(vContainer.V1.x, vContainer.V2.x);
  const minY = Math.min(vContainer.V4.y, vContainer.V5.y, vContainer.V6.y, vContainer.V7.y);
  const maxY = Math.max(vContainer.V0.y, vContainer.V1.y, vContainer.V2.y, vContainer.V3.y);
  
  const dx = 200 - (actualMaxX - actualMinX) / 2 - actualMinX;
  const dy = 200 - (maxY - minY) / 2 - minY;

  // Single small box for the preview
  const vSmallBox = getObliqueVertices(item.box.p, item.box.l, item.box.t, scale, 0, 0);

  return (
    <div className="flex flex-col md:flex-row gap-6 w-full max-w-5xl mx-auto bg-white rounded-3xl p-6 shadow-sm border-[3px] border-border">
      
      {/* Visual Area */}
      <div className="flex-1 min-h-[400px] flex flex-col items-center justify-center bg-slate-50 rounded-2xl border-2 border-slate-200 relative overflow-hidden">
        <svg width="100%" height="100%" viewBox="0 0 400 400" className="overflow-visible">
          <g transform={`translate(${dx}, ${dy + 40})`}>
            {/* Draw the Open Container first */}
            {renderShape(vContainer, "#e2e8f0", true, 1)}

            {/* Draw all the animated boxes */}
            <AnimatePresence>
              {animatedBoxes.map((b, i) => {
                const angle = Math.PI / 6;
                const depthScale = 0.6;
                const sx = (b.ix * item.box.p * scale) + (b.iz * item.box.l * scale * depthScale * Math.cos(angle));
                const sy = (-b.iy * item.box.t * scale) - (b.iz * item.box.l * scale * depthScale * Math.sin(angle));
                const vB = getObliqueVertices(item.box.p, item.box.l, item.box.t, scale, sx, sy);

                return (
                  <motion.g
                    key={`box-${b.id}`}
                    initial={{ y: -400, opacity: 0 }}
                    animate={{ y: 0, opacity: 1, rotate: b.isSpill ? b.rot : 0 }}
                    transition={{ delay: i * 0.05, type: "spring", stiffness: 100, damping: 15 }}
                  >
                    {renderShape(vB, item.color)}
                  </motion.g>
                );
              })}
            </AnimatePresence>

            {/* If we wanted to draw the front transparent wall, we could do it here, but leaving it completely open is better */}
          </g>
        </svg>

        {/* Small Box Preview at the corner */}
        <div className="absolute top-4 right-4 bg-white p-3 rounded-xl shadow-sm border-2 border-slate-200 text-center">
          <span className="text-xs font-bold text-slate-500 mb-1 block">Kotak Produk</span>
          <svg width="60" height="60" viewBox="-10 -40 80 80" className="overflow-visible mx-auto mb-1">
             {renderShape(vSmallBox, item.color)}
          </svg>
          <span className="text-xs font-bold text-slate-700">{item.box.p}×{item.box.l}×{item.box.t}</span>
        </div>
      </div>

      {/* Control Area */}
      <div className="flex-1 flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-black text-foreground">{item.name}</h2>
            <p className="text-slate-500 font-medium">Berapa banyak kotak kecil yang bisa masuk?</p>
          </div>
          <div className="px-3 py-1 bg-slate-100 rounded-lg text-sm font-bold text-slate-600">
            {currentIndex + 1} / {totalItems}
          </div>
        </div>

        <hr className="border-slate-200" />

        <div className="flex-1 flex flex-col">
          {!isWin ? (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-slate-100 rounded-xl border-2 border-slate-200">
                  <p className="text-sm font-bold text-slate-500 mb-1">Kardus Besar (Kargo)</p>
                  <p className="font-mono text-lg font-black text-slate-700">{item.container.p} × {item.container.l} × {item.container.t}</p>
                </div>
                <div className="p-4 bg-blue-50 rounded-xl border-2 border-blue-200">
                  <p className="text-sm font-bold text-blue-500 mb-1">Kotak Produk</p>
                  <p className="font-mono text-lg font-black text-blue-700">{item.box.p} × {item.box.l} × {item.box.t}</p>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-2">Total Kotak Produk yang Muat:</label>
                <div className="flex gap-3">
                  <input
                    type="number"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    disabled={isAnimating && !errorMsg}
                    className="flex-1 px-4 py-3 rounded-xl border-2 border-slate-300 focus:border-primary outline-none font-bold text-lg"
                    placeholder="Masukkan angka..."
                  />
                  <button 
                    type="submit" 
                    disabled={isAnimating && !errorMsg}
                    className="px-6 py-3 bg-primary text-white font-bold rounded-xl shadow-[0_4px_0_0_rgba(0,0,0,0.1)] hover:translate-y-1 hover:shadow-none transition-all disabled:opacity-50 flex items-center gap-2"
                  >
                    <Package className="size-5" /> Isi Kargo
                  </button>
                </div>
                {errorMsg && <p className="text-red-500 text-sm font-bold mt-3 animate-in fade-in">{errorMsg}</p>}
              </div>

            </form>
          ) : (
             <div className="flex-1 flex flex-col items-center justify-center text-center p-6 animate-in slide-in-from-bottom-4">
                <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Check className="size-8" />
                </div>
                <h3 className="text-2xl font-black text-foreground mb-4">Tepat Sekali! 🎉</h3>
                <p className="text-slate-600 font-medium mb-4">
                  Kargo berhasil diisi penuh dengan <strong className="text-primary">{correctAmount} kotak</strong> tanpa menyisakan ruang sedikitpun!
                </p>
                
                {/* Math breakdown */}
                <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl w-full text-sm font-mono text-slate-600 text-left mb-6">
                  <div className="flex justify-between">
                    <span>Sisi Panjang (P): {item.container.p} / {item.box.p}</span> <span>= <strong>{nx}</strong> kotak</span>
                  </div>
                  <div className="flex justify-between mt-1">
                    <span>Sisi Lebar (L): {item.container.l} / {item.box.l}</span> <span>= <strong>{nz}</strong> kotak</span>
                  </div>
                  <div className="flex justify-between mt-1">
                    <span>Sisi Tinggi (T): {item.container.t} / {item.box.t}</span> <span>= <strong>{ny}</strong> kotak</span>
                  </div>
                  <hr className="my-2 border-slate-300" />
                  <div className="flex justify-between text-black font-black">
                    <span>Total Kotak:</span> <span>{nx} × {nz} × {ny} = {correctAmount}</span>
                  </div>
                </div>

                <button
                  onClick={() => {
                    setInputValue("");
                    setAnimatedBoxes([]);
                    onNext();
                  }}
                  className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-primary text-white font-bold text-lg rounded-2xl shadow-[0_4px_0_0_rgba(0,0,0,0.1)] hover:translate-y-1 hover:shadow-none transition-all"
                >
                  {currentIndex === totalItems - 1 ? "Selesaikan Permainan" : "Kargo Berikutnya"} <ArrowRight className="size-5" />
                </button>
              </div>
          )}
        </div>
      </div>
    </div>
  );
}
