"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, ArrowRight, Paintbrush, Undo2 } from "lucide-react";
import confetti from "canvas-confetti";

type Dimensions = { p: number; l: number; t: number };

type Item = {
  id: string;
  type: "kubus" | "balok";
  dimensions: Dimensions;
  color: string;
  name: string;
};

type FaceId = "depan" | "belakang" | "atas" | "bawah" | "kiri" | "kanan";

type FaceState = {
  id: FaceId;
  name: string;
  formula: string;
  correctArea: number;
  widthLabel: string;
  heightLabel: string;
  isCorrect: boolean;
};

// --- Helper Functions for Oblique 3D (Textbook Style) ---
const getObliqueVertices = (p: number, l: number, t: number, scale: number) => {
  // Front face (p x t)
  const V0 = { x: 0, y: 0 }; // bottom-left (Front)
  const V1 = { x: p * scale, y: 0 }; // bottom-right (Front)
  const V4 = { x: 0, y: -t * scale }; // top-left (Front)
  const V5 = { x: p * scale, y: -t * scale }; // top-right (Front)

  // Depth vector (l) - slanted at 30 degrees, scaled by 0.6 for realism
  const angle = Math.PI / 6; 
  const depthScale = 0.6;
  const dx = l * scale * depthScale * Math.cos(angle);
  const dy = -l * scale * depthScale * Math.sin(angle);

  // Back face
  const V3 = { x: V0.x + dx, y: V0.y + dy }; // bottom-left (Back)
  const V2 = { x: V1.x + dx, y: V1.y + dy }; // bottom-right (Back)
  const V7 = { x: V4.x + dx, y: V4.y + dy }; // top-left (Back)
  const V6 = { x: V5.x + dx, y: V5.y + dy }; // top-right (Back)

  return { V0, V1, V2, V3, V4, V5, V6, V7 };
};

const ObliqueShape = ({ p, l, t, color, isPainted, animatedPaint }: { p: number, l: number, t: number, color: string, isPainted: boolean, animatedPaint?: boolean }) => {
  // Normalize dimensions to fit nicely
  const maxDim = Math.max(p, l, t);
  const scale = 140 / maxDim; // Adjust so it fits in a ~300x300 box
  
  const v = getObliqueVertices(p, l, t, scale);
  
  // Calculate bounding box to center it
  const minX = Math.min(v.V0.x, v.V4.x, v.V3.x, v.V7.x);
  const maxX = Math.min(v.V1.x, v.V5.x, v.V2.x, v.V6.x); // Wait, minX should be min, maxX should be max
  const actualMinX = Math.min(v.V0.x, v.V4.x, v.V3.x, v.V7.x, v.V1.x, v.V2.x, v.V5.x, v.V6.x);
  const actualMaxX = Math.max(v.V0.x, v.V4.x, v.V3.x, v.V7.x, v.V1.x, v.V2.x, v.V5.x, v.V6.x);
  const minY = Math.min(v.V0.y, v.V1.y, v.V2.y, v.V3.y, v.V4.y, v.V5.y, v.V6.y, v.V7.y);
  const maxY = Math.max(v.V0.y, v.V1.y, v.V2.y, v.V3.y, v.V4.y, v.V5.y, v.V6.y, v.V7.y);
  
  const width = actualMaxX - actualMinX;
  const height = maxY - minY;
  const centerX = width / 2;
  const centerY = height / 2;

  const dx = 150 - actualMinX - centerX;
  const dy = 150 - minY - centerY;

  const translate = (pt: {x: number, y: number}) => `${pt.x + dx},${pt.y + dy}`;

  const topFace = `${translate(v.V4)} ${translate(v.V5)} ${translate(v.V6)} ${translate(v.V7)}`;
  const frontFace = `${translate(v.V0)} ${translate(v.V1)} ${translate(v.V5)} ${translate(v.V4)}`;
  const rightFace = `${translate(v.V1)} ${translate(v.V2)} ${translate(v.V6)} ${translate(v.V5)}`;

  const baseColor = isPainted ? color : "#E2E8F0";
  const darkerColor = isPainted ? adjustColor(color, -20) : "#CBD5E1";
  const lighterColor = isPainted ? adjustColor(color, 20) : "#F1F5F9";

  return (
    <svg width="100%" height="100%" viewBox="0 0 300 300" className="overflow-visible">
      {animatedPaint && (
        <defs>
          <clipPath id="paint-clip">
            <motion.rect 
              x="0" y="0" width="300" height="300"
              initial={{ y: -300 }}
              animate={{ y: 0 }}
              transition={{ duration: 1.5, ease: "easeInOut" }}
            />
          </clipPath>
        </defs>
      )}

      {/* Unpainted Base (if animating) */}
      {animatedPaint && (
        <g>
          <polygon points={topFace} fill="#F1F5F9" stroke="#94A3B8" strokeWidth="2" strokeLinejoin="round" />
          <polygon points={frontFace} fill="#E2E8F0" stroke="#94A3B8" strokeWidth="2" strokeLinejoin="round" />
          <polygon points={rightFace} fill="#CBD5E1" stroke="#94A3B8" strokeWidth="2" strokeLinejoin="round" />
        </g>
      )}

      <g clipPath={animatedPaint ? "url(#paint-clip)" : undefined}>
        <polygon points={topFace} fill={lighterColor} stroke={isPainted ? adjustColor(color, -40) : "#94A3B8"} strokeWidth="2" strokeLinejoin="round" />
        <polygon points={frontFace} fill={baseColor} stroke={isPainted ? adjustColor(color, -40) : "#94A3B8"} strokeWidth="2" strokeLinejoin="round" />
        <polygon points={rightFace} fill={darkerColor} stroke={isPainted ? adjustColor(color, -40) : "#94A3B8"} strokeWidth="2" strokeLinejoin="round" />
      </g>

      {/* Dimension Labels (only when not painted) */}
      {!isPainted && (
        <g className="text-sm font-bold fill-slate-600">
          <text x={translate(v.V0).split(',')[0]} y={translate(v.V0).split(',')[1]} dx={p*scale/2} dy={18} textAnchor="middle">{p}</text>
          <text x={translate(v.V1).split(',')[0]} y={translate(v.V1).split(',')[1]} dx={(v.V2.x - v.V1.x)/2 + 10} dy={(v.V2.y - v.V1.y)/2 + 10} textAnchor="start">{l}</text>
          <text x={translate(v.V0).split(',')[0]} y={translate(v.V0).split(',')[1]} dx={-12} dy={-t*scale/2} textAnchor="end">{t}</text>
        </g>
      )}

      {/* Paintbrush Animation */}
      {animatedPaint && (
        <motion.g
          initial={{ x: 150, y: -50, rotate: -45 }}
          animate={{ x: 150, y: 350, rotate: -45 }}
          transition={{ duration: 1.5, ease: "easeInOut" }}
        >
          <text x="0" y="0" fontSize="60" textAnchor="middle" dominantBaseline="middle">🖌️</text>
        </motion.g>
      )}
    </svg>
  );
};

// Utility to darken/lighten hex color
const adjustColor = (color: string, amount: number) => {
  return '#' + color.replace(/^#/, '').replace(/../g, color => 
    ('0'+Math.min(255, Math.max(0, parseInt(color, 16) + amount)).toString(16)).substr(-2)
  );
};

export default function SurfaceAreaPainter({ data }: { data: { items: Item[] } }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isGameFinished, setIsGameFinished] = useState(false);
  
  const handleNext = () => {
    if (currentIndex < data.items.length - 1) {
      setCurrentIndex(prev => prev + 1);
    } else {
      setIsGameFinished(true);
    }
  };

  const handleRestart = () => {
    setCurrentIndex(0);
    setIsGameFinished(false);
  };

  if (isGameFinished) {
    return (
      <div className="flex flex-col items-center justify-center p-12 bg-white rounded-3xl shadow-sm border-[3px] border-border text-center max-w-5xl mx-auto min-h-[400px]">
        <h2 className="text-4xl font-black text-foreground mb-4">Tukang Cat Ahli! 🏆</h2>
        <p className="text-lg text-slate-500 mb-8 max-w-xl">
          Luar biasa! Kamu telah berhasil mengecat semua bangun ruang dengan memperhitungkan luas permukaannya secara akurat.
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
    <SurfaceAreaPainterGame 
      key={item.id} 
      item={item} 
      totalItems={data.items.length} 
      currentIndex={currentIndex} 
      onNext={handleNext} 
    />
  );
}

function SurfaceAreaPainterGame({ item, totalItems, currentIndex, onNext }: { item: Item; totalItems: number; currentIndex: number; onNext: () => void }) {
  const [view, setView] = useState<"3d" | "net" | "win">("3d");
  const [faces, setFaces] = useState<FaceState[]>(() => {
    const { p, l, t } = item.dimensions;
    return [
      { id: "atas", name: "Sisi Atas", formula: "p × l", correctArea: p * l, widthLabel: "p", heightLabel: "l", isCorrect: false },
      { id: "bawah", name: "Sisi Bawah", formula: "p × l", correctArea: p * l, widthLabel: "p", heightLabel: "l", isCorrect: false },
      { id: "depan", name: "Sisi Depan", formula: "p × t", correctArea: p * t, widthLabel: "p", heightLabel: "t", isCorrect: false },
      { id: "belakang", name: "Sisi Belakang", formula: "p × t", correctArea: p * t, widthLabel: "p", heightLabel: "t", isCorrect: false },
      { id: "kanan", name: "Sisi Kanan", formula: "l × t", correctArea: l * t, widthLabel: "l", heightLabel: "t", isCorrect: false },
      { id: "kiri", name: "Sisi Kiri", formula: "l × t", correctArea: l * t, widthLabel: "l", heightLabel: "t", isCorrect: false },
    ];
  });
  const [selectedFace, setSelectedFace] = useState<FaceId | null>(null);
  const [inputValue, setInputValue] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [totalInputValue, setTotalInputValue] = useState("");
  const [isTotalCorrect, setIsTotalCorrect] = useState(false);

  const allFacesCorrect = faces.every(f => f.isCorrect);

  const handleFaceSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFace) return;
    
    const face = faces.find(f => f.id === selectedFace);
    if (!face) return;

    if (parseInt(inputValue) === face.correctArea) {
      setFaces(prev => prev.map(f => f.id === selectedFace ? { ...f, isCorrect: true } : f));
      setSelectedFace(null);
      setInputValue("");
      setErrorMsg("");
    } else {
      setErrorMsg("Luas belum tepat, coba hitung lagi!");
    }
  };

  const handleTotalSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const expectedTotal = faces.reduce((sum, f) => sum + f.correctArea, 0);
    if (parseInt(totalInputValue) === expectedTotal) {
      setIsTotalCorrect(true);
      setErrorMsg("");
      setView("win");
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: [item.color, '#ffffff', '#FFD700']
      });
    } else {
      setErrorMsg("Total luas permukaan belum tepat.");
    }
  };

  // handleNext is now passed via props and called in the win view

  // Render Net (Jaring-Jaring)
  const renderNet = () => {
    const { p, l, t } = item.dimensions;
    const totalW = p + 2 * l;
    const totalH = 2 * t + 2 * l;
    
    // Calculate a nice scale to fit in 400x400 SVG
    const maxDim = Math.max(totalW, totalH);
    const scale = 300 / maxDim;
    
    const offsetW = (400 - (totalW * scale)) / 2;
    const offsetH = (400 - (totalH * scale)) / 2;

    const getFaceProps = (id: FaceId, x: number, y: number, w: number, h: number) => {
      const face = faces.find(f => f.id === id);
      const isSelected = selectedFace === id;
      const isCorrect = face?.isCorrect;
      
      return {
        x: offsetW + x * scale,
        y: offsetH + y * scale,
        width: w * scale,
        height: h * scale,
        onClick: () => { if (!isCorrect) { setSelectedFace(id); setInputValue(""); setErrorMsg(""); } },
        fill: isCorrect ? item.color : (isSelected ? "#DBEAFE" : "#F1F5F9"),
        stroke: isSelected ? "#3B82F6" : (isCorrect ? adjustColor(item.color, -30) : "#94A3B8"),
        strokeWidth: isSelected ? 4 : 2,
        className: `transition-all duration-300 ${isCorrect ? "cursor-default" : "cursor-pointer hover:brightness-95"}`,
      };
    };

    const renderText = (id: FaceId, x: number, y: number, w: number, h: number) => {
      const face = faces.find(f => f.id === id);
      const isCorrect = face?.isCorrect;
      const cx = offsetW + (x + w/2) * scale;
      const cy = offsetH + (y + h/2) * scale;
      
      return (
        <text 
          x={cx} 
          y={cy} 
          textAnchor="middle" 
          dominantBaseline="middle"
          className={`font-bold ${isCorrect ? 'text-white fill-white text-xl' : 'text-slate-500 fill-slate-500 text-sm pointer-events-none'}`}
        >
          {isCorrect ? face?.correctArea : id}
        </text>
      );
    };

    return (
      <div className="w-full h-full relative">
        <svg width="100%" height="100%" viewBox="0 0 400 400">
          {/* Faces */}
          <rect {...getFaceProps("belakang", l, 0, p, t)} />
          <rect {...getFaceProps("atas", l, t, p, l)} />
          <rect {...getFaceProps("kiri", 0, t+l, l, t)} />
          <rect {...getFaceProps("depan", l, t+l, p, t)} />
          <rect {...getFaceProps("kanan", l+p, t+l, l, t)} />
          <rect {...getFaceProps("bawah", l, t+l+t, p, l)} />

          {/* Labels */}
          {renderText("belakang", l, 0, p, t)}
          {renderText("atas", l, t, p, l)}
          {renderText("kiri", 0, t+l, l, t)}
          {renderText("depan", l, t+l, p, t)}
          {renderText("kanan", l+p, t+l, l, t)}
          {renderText("bawah", l, t+l+t, p, l)}
        </svg>
      </div>
    );
  };

  return (
    <div className="flex flex-col md:flex-row gap-6 w-full max-w-5xl mx-auto bg-white rounded-3xl p-6 shadow-sm border-[3px] border-border">
      
      {/* Visual Area */}
      <div className="flex-1 min-h-[400px] flex flex-col items-center justify-center bg-slate-50 rounded-2xl border-2 border-slate-200 relative overflow-hidden">
        <AnimatePresence mode="wait">
          {view === "3d" && (
            <motion.div key="3d" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 1.1 }} className="w-full h-full flex flex-col items-center justify-center">
              <ObliqueShape p={item.dimensions.p} l={item.dimensions.l} t={item.dimensions.t} color={item.color} isPainted={false} />
              <button 
                onClick={() => setView("net")}
                className="absolute bottom-6 px-6 py-3 bg-primary text-primary-foreground font-bold rounded-2xl shadow-[0_4px_0_0_rgba(0,0,0,0.1)] hover:translate-y-1 hover:shadow-none transition-all"
              >
                Buka Jaring-jaring ✂️
              </button>
            </motion.div>
          )}

          {view === "net" && (
            <motion.div key="net" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 1.1 }} className="w-full h-full">
              {renderNet()}
              <button 
                onClick={() => setView("3d")}
                className="absolute top-4 left-4 p-2 bg-white text-slate-500 font-bold rounded-xl shadow-sm border-2 border-slate-200 hover:bg-slate-100 transition-all flex items-center gap-2"
              >
                <Undo2 className="size-4" /> 3D
              </button>
            </motion.div>
          )}

          {view === "win" && (
            <motion.div key="win" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="w-full h-full flex flex-col items-center justify-center">
              <ObliqueShape p={item.dimensions.p} l={item.dimensions.l} t={item.dimensions.t} color={item.color} isPainted={true} animatedPaint={true} />
              <div className="absolute top-8 left-1/2 -translate-x-1/2 bg-white/90 backdrop-blur-sm px-6 py-3 rounded-2xl border-2 border-border shadow-lg text-center">
                <p className="font-bold text-lg text-foreground">Selesai Dicat! 🎨</p>
                <p className="font-semibold text-primary">Luas Total: {faces.reduce((s, f) => s + f.correctArea, 0)}</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Control Area */}
      <div className="flex-1 flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-black text-foreground">{item.name}</h2>
            <p className="text-slate-500 font-medium">Ukuran: {item.dimensions.p} × {item.dimensions.l} × {item.dimensions.t}</p>
          </div>
          <div className="px-3 py-1 bg-slate-100 rounded-lg text-sm font-bold text-slate-600">
            {currentIndex + 1} / {totalItems}
          </div>
        </div>

        <hr className="border-slate-200" />

        {view === "3d" && (
          <div className="flex-1 flex items-center justify-center text-center p-8">
            <div className="space-y-4">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
                <Paintbrush className="size-8 text-blue-500" />
              </div>
              <p className="text-slate-600 font-medium">
                Klik tombol <strong className="text-primary">Buka Jaring-jaring</strong> untuk mulai menghitung luas tiap sisi yang akan dicat.
              </p>
            </div>
          </div>
        )}

        {view === "net" && !allFacesCorrect && (
          <div className="flex-1 flex flex-col">
            <h3 className="font-bold text-lg mb-4 text-foreground">Hitung Luas Tiap Sisi</h3>
            <p className="text-sm text-slate-500 mb-6">Klik pada sisi yang ingin dihitung luasnya.</p>
            
            {selectedFace ? (
              <form onSubmit={handleFaceSubmit} className="bg-blue-50 p-6 rounded-2xl border-2 border-blue-200 animate-in fade-in slide-in-from-bottom-4">
                <div className="flex justify-between items-center mb-4">
                  <h4 className="font-bold text-blue-800 capitalize">Sisi {selectedFace}</h4>
                  <button type="button" onClick={() => {setSelectedFace(null); setErrorMsg("");}} className="text-blue-400 hover:text-blue-600">Tutup</button>
                </div>
                <div className="flex items-center gap-4 mb-4">
                  <div className="flex-1 bg-white p-3 rounded-xl border border-blue-100 text-center font-mono font-bold text-blue-600">
                    {faces.find(f => f.id === selectedFace)?.widthLabel} × {faces.find(f => f.id === selectedFace)?.heightLabel}
                  </div>
                  <span className="font-bold text-slate-400">=</span>
                  <div className="flex-1 bg-white p-3 rounded-xl border border-blue-100 text-center font-mono font-bold text-blue-600">
                    {item.dimensions[faces.find(f => f.id === selectedFace)?.widthLabel as keyof Dimensions]} × {item.dimensions[faces.find(f => f.id === selectedFace)?.heightLabel as keyof Dimensions]}
                  </div>
                </div>
                <div className="flex gap-3">
                  <input
                    type="number"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    placeholder="Hasil..."
                    className="flex-1 px-4 py-3 rounded-xl border-2 border-blue-200 focus:border-blue-500 outline-none font-bold text-lg"
                    autoFocus
                  />
                  <button type="submit" className="px-6 py-3 bg-blue-500 text-white font-bold rounded-xl shadow-[0_4px_0_0_#2563eb] hover:translate-y-1 hover:shadow-none transition-all">
                    Cek
                  </button>
                </div>
                {errorMsg && <p className="text-red-500 text-sm font-bold mt-3 text-center">{errorMsg}</p>}
              </form>
            ) : (
              <div className="grid grid-cols-2 gap-3 mt-auto">
                {faces.map(f => (
                  <div key={f.id} className={`p-3 rounded-xl border-2 flex justify-between items-center ${f.isCorrect ? 'bg-green-50 border-green-200' : 'bg-slate-50 border-slate-200'}`}>
                    <span className={`font-semibold capitalize ${f.isCorrect ? 'text-green-700' : 'text-slate-500'}`}>{f.id}</span>
                    {f.isCorrect ? (
                      <span className="font-black text-green-600 flex items-center gap-1"><Check className="size-4"/> {f.correctArea}</span>
                    ) : (
                      <span className="text-slate-300 text-sm">--</span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {view === "net" && allFacesCorrect && (
          <form onSubmit={handleTotalSubmit} className="flex-1 flex flex-col justify-center animate-in fade-in zoom-in-95">
            <div className="bg-green-50 p-6 rounded-2xl border-2 border-green-200 text-center">
              <div className="w-16 h-16 bg-green-100 text-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <Check className="size-8" />
              </div>
              <h3 className="font-bold text-xl text-green-800 mb-2">Semua Sisi Terhitung!</h3>
              <p className="text-green-600 font-medium mb-6">Sekarang jumlahkan semuanya untuk mendapatkan Total Luas Permukaan.</p>
              
              <div className="flex gap-3">
                <input
                  type="number"
                  value={totalInputValue}
                  onChange={(e) => setTotalInputValue(e.target.value)}
                  placeholder="Total Luas..."
                  className="flex-1 px-4 py-3 rounded-xl border-2 border-green-300 focus:border-green-500 outline-none font-bold text-lg text-center"
                  autoFocus
                />
                <button type="submit" className="px-6 py-3 bg-green-500 text-white font-bold rounded-xl shadow-[0_4px_0_0_#16a34a] hover:translate-y-1 hover:shadow-none transition-all">
                  Cat Sekarang!
                </button>
              </div>
              {errorMsg && <p className="text-red-500 text-sm font-bold mt-3">{errorMsg}</p>}
            </div>
          </form>
        )}

        {view === "win" && (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-8 animate-in slide-in-from-right-8">
            <h3 className="text-3xl font-black text-foreground mb-4">Luar Biasa! 🎉</h3>
            <p className="text-slate-600 font-medium mb-8">
              Kamu berhasil menghitung luas permukaan dengan tepat sehingga catnya cukup untuk seluruh bagian.
            </p>
            <button
              onClick={onNext}
              className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-primary text-white font-bold text-lg rounded-2xl shadow-[0_4px_0_0_rgba(0,0,0,0.1)] hover:translate-y-1 hover:shadow-none transition-all"
            >
              {currentIndex === totalItems - 1 ? "Selesaikan Permainan" : "Lanjut ke Bangun Berikutnya"} <ArrowRight className="size-5" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
