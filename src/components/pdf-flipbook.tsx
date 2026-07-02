"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import { TransformWrapper, TransformComponent } from "react-zoom-pan-pinch";
import "react-pdf/dist/Page/TextLayer.css";
import "react-pdf/dist/Page/AnnotationLayer.css";

pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  "pdfjs-dist/build/pdf.worker.min.mjs",
  import.meta.url,
).toString();

type FlipDirection = "forward" | "backward" | null;

export default function PdfFlipBook({ pdfUrl }: { pdfUrl: string }) {
  const [numPages, setNumPages] = useState<number>(0);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [flipDirection, setFlipDirection] = useState<FlipDirection>(null);
  const [isFlipping, setIsFlipping] = useState(false);
  const [containerWidth, setContainerWidth] = useState(0);
  const [containerHeight, setContainerHeight] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [pageAspectRatio, setPageAspectRatio] = useState<number | null>(null);
  
  const containerRef = useRef<HTMLDivElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);

  const isMobile = containerWidth > 0 && containerWidth < 768;
  const baseIndex = isMobile ? currentIndex : currentIndex - (currentIndex % 2);

  const canGoPrev = baseIndex > 0;
  const canGoNext = isMobile ? baseIndex + 1 < numPages : baseIndex + 2 < numPages;

  // Measure container width for responsive page sizing
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        setContainerWidth(entry.contentRect.width);
        setContainerHeight(entry.contentRect.height);
      }
    });
    observer.observe(container);
    return () => observer.disconnect();
  }, []);

  // Listen to fullscreen changes
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, []);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      wrapperRef.current?.requestFullscreen().catch((err) => {
        console.error(`Error attempting to enable fullscreen: ${err.message}`);
      });
    } else {
      document.exitFullscreen();
    }
  };

  const onDocumentLoadSuccess = useCallback(
    ({ numPages: total }: { numPages: number }) => {
      setNumPages(total);
      setCurrentIndex(0);
    },
    [],
  );

  const onPageLoadSuccess = useCallback((page: { originalWidth: number; originalHeight: number }) => {
    if (!pageAspectRatio) {
      setPageAspectRatio(page.originalWidth / page.originalHeight);
    }
  }, [pageAspectRatio]);

  const pageWidth = (() => {
    if (containerWidth === 0) return 350;
    
    // On md+ screens we show 2 pages side-by-side; on mobile single page
    const availableWidth = isMobile ? containerWidth - 40 : (containerWidth - 64) / 2;
    let targetWidth = availableWidth;

    // Limit width based on container height to prevent vertical cropping
    if (typeof window !== "undefined") {
      const assumedRatio = pageAspectRatio || (1 / 1.414); // Default to A4 ratio if unknown
      let availableHeight = 0;
      
      if (isFullscreen) {
        // In fullscreen, the container height is strictly set via flex-1
        availableHeight = containerHeight > 0 ? containerHeight - 64 : window.innerHeight - 100;
      } else {
        // Not fullscreen, we still want to constrain so it fits on screen,
        // but use container height if it's meaningful, otherwise window height.
        availableHeight = window.innerHeight * 0.75;
      }
      
      const maxWidthFromHeight = availableHeight * assumedRatio;
      targetWidth = Math.min(targetWidth, maxWidthFromHeight);
    }

    return targetWidth;
  })();

  const handleFlip = useCallback(
    (direction: "forward" | "backward") => {
      if (isFlipping) return;
      if (direction === "forward" && !canGoNext) return;
      if (direction === "backward" && !canGoPrev) return;

      setIsFlipping(true);
      setFlipDirection(direction);

      // After animation completes, update page and reset
      setTimeout(() => {
        setCurrentIndex((current) => {
          const step = isMobile ? 1 : 2;
          const base = isMobile ? current : current - (current % 2);
          if (direction === "forward") {
            return Math.min(base + step, numPages - 1);
          }
          return Math.max(base - step, 0);
        });
        setFlipDirection(null);
        setIsFlipping(false);
      }, 500);
    },
    [isFlipping, canGoNext, canGoPrev, numPages, isMobile],
  );

  const jumpToPage = useCallback(
    (pageIndex: number) => {
      if (isFlipping) return;
      if (pageIndex === (isMobile ? currentIndex : currentIndex - (currentIndex % 2))) return;

      setIsFlipping(true);
      const currentBase = isMobile ? currentIndex : currentIndex - (currentIndex % 2);
      setFlipDirection(pageIndex > currentBase ? "forward" : "backward");

      setTimeout(() => {
        setCurrentIndex(pageIndex);
        setFlipDirection(null);
        setIsFlipping(false);
      }, 500);
    },
    [isFlipping, currentIndex, isMobile],
  );

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight" || e.key === "ArrowDown") {
        e.preventDefault();
        handleFlip("forward");
      } else if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
        e.preventDefault();
        handleFlip("backward");
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleFlip]);

  // Swipe navigation
  const touchStartX = useRef<number | null>(null);
  const touchEndX = useRef<number | null>(null);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.changedTouches[0].screenX;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.changedTouches[0].screenX;
  };

  const handleTouchEnd = () => {
    if (touchStartX.current !== null && touchEndX.current !== null) {
      const diff = touchStartX.current - touchEndX.current;
      if (diff > 50) {
        handleFlip("forward");
      } else if (diff < -50) {
        handleFlip("backward");
      }
    }
    touchStartX.current = null;
    touchEndX.current = null;
  };

  const leftPageNum = baseIndex + 1;
  const rightPageNum = baseIndex + 2;
  const hasLeftPage = leftPageNum <= numPages;
  const hasRightPage = rightPageNum <= numPages;

  return (
    <div 
      ref={wrapperRef} 
      className={`flex flex-col gap-4 ${isFullscreen ? 'bg-white p-4 md:p-8 overflow-y-auto w-full h-full' : ''}`}
    >
      {/* Book viewer */}
      <div
        ref={containerRef}
        className={`relative rounded-4xl border-[3px] border-border bg-[#d9ecff] shadow-sm overflow-hidden ${isFullscreen ? 'flex-1 flex flex-col justify-center' : ''}`}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <button
          onClick={toggleFullscreen}
          className="absolute top-4 right-4 z-10 flex size-10 items-center justify-center rounded-full bg-white/80 backdrop-blur-sm shadow-md border-2 border-border hover:bg-white text-primary transition-all active:scale-95"
          aria-label={isFullscreen ? "Keluar layar penuh" : "Layar penuh"}
          title={isFullscreen ? "Keluar layar penuh" : "Layar penuh"}
        >
          {isFullscreen ? (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M8 3v3a2 2 0 0 1-2 2H3m18 0h-3a2 2 0 0 1-2-2V3m0 18v-3a2 2 0 0 1 2-2h3M3 16h3a2 2 0 0 1 2 2v3" />
            </svg>
          ) : (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3" />
            </svg>
          )}
        </button>

        <Document
          file={pdfUrl}
          onLoadSuccess={onDocumentLoadSuccess}
          loading={
            <div className="flex min-h-[400px] items-center justify-center">
              <div className="flex flex-col items-center gap-4">
                <div className="flex size-16 items-center justify-center rounded-3xl bg-white shadow-sm">
                  <svg
                    width="32"
                    height="32"
                    viewBox="0 0 24 24"
                    fill="none"
                    className="animate-pulse"
                  >
                    <path
                      d="M8 3h7l4 4v14H8a3 3 0 0 1-3-3V6a3 3 0 0 1 3-3Z"
                      fill="#F0F9FF"
                      stroke="#0984E3"
                      strokeWidth="2"
                    />
                    <path
                      d="M14 3v5h5"
                      stroke="#0984E3"
                      strokeWidth="2"
                    />
                  </svg>
                </div>
                <p className="text-sm font-bold text-primary">
                  Memuat dokumen...
                </p>
              </div>
            </div>
          }
          error={
            <div className="flex min-h-[400px] flex-col items-center justify-center gap-3">
              <div className="flex size-16 items-center justify-center rounded-3xl bg-[#ffe5e5]">
                <svg
                  width="32"
                  height="32"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#ef4444"
                  strokeWidth="2"
                  strokeLinecap="round"
                >
                  <circle cx="12" cy="12" r="10" />
                  <line x1="15" y1="9" x2="9" y2="15" />
                  <line x1="9" y1="9" x2="15" y2="15" />
                </svg>
              </div>
              <p className="text-base font-bold text-foreground">
                Gagal memuat PDF
              </p>
              <p className="text-sm font-semibold text-gray-500">
                Pastikan file PDF tersedia dan coba muat ulang halaman.
              </p>
            </div>
          }
        >
          <TransformWrapper
            initialScale={1}
            minScale={0.7}
            maxScale={4}
            centerOnInit={true}
            wheel={{ step: 0.1 }}
          >
            {({ zoomIn, zoomOut, resetTransform }) => (
              <>
                <div className="absolute top-4 left-4 z-10 flex flex-col gap-2">
                  <button
                    onClick={(e) => { e.preventDefault(); e.stopPropagation(); zoomIn(); }}
                    className="flex size-10 items-center justify-center rounded-full bg-white/80 backdrop-blur-sm shadow-md border-2 border-border hover:bg-white text-primary transition-all active:scale-95 text-xl font-bold"
                    aria-label="Perbesar"
                    title="Perbesar"
                  >
                    +
                  </button>
                  <button
                    onClick={(e) => { e.preventDefault(); e.stopPropagation(); zoomOut(); }}
                    className="flex size-10 items-center justify-center rounded-full bg-white/80 backdrop-blur-sm shadow-md border-2 border-border hover:bg-white text-primary transition-all active:scale-95 text-xl font-bold"
                    aria-label="Perkecil"
                    title="Perkecil"
                  >
                    -
                  </button>
                  <button
                    onClick={(e) => { e.preventDefault(); e.stopPropagation(); resetTransform(); }}
                    className="flex size-10 items-center justify-center rounded-full bg-white/80 backdrop-blur-sm shadow-md border-2 border-border hover:bg-white text-primary transition-all active:scale-95"
                    aria-label="Reset Zoom"
                    title="Reset Zoom"
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
                      <path d="M3 3v5h5" />
                    </svg>
                  </button>
                </div>
                <TransformComponent wrapperClass="!w-full !h-full" contentClass="!w-full !h-full flex justify-center items-center">
                  <div className="relative mx-auto flex items-center justify-center">
                    {/* Book spine */}
                    <div className="pointer-events-none absolute inset-y-4 left-1/2 hidden w-[6px] -translate-x-1/2 rounded-full bg-[#8fc9f5] shadow-inner md:block" />

                    {/* Pages spread */}
                    <div
                      className={`grid gap-3 md:grid-cols-2 md:gap-0 ${
                        flipDirection === "forward"
                          ? "animate-flip-forward"
                          : flipDirection === "backward"
                            ? "animate-flip-backward"
                            : ""
                      }`}
                    >
                      {/* Left page (Or single page on mobile) */}
                      {hasLeftPage ? (
                        <div className="flex justify-center overflow-hidden rounded-3xl border-2 border-border bg-white shadow-sm md:rounded-r-xl">
                          <div className="relative">
                            <Page
                              pageNumber={leftPageNum}
                              width={pageWidth}
                              onLoadSuccess={onPageLoadSuccess}
                              renderTextLayer={true}
                              renderAnnotationLayer={true}
                            />
                            {/* Page number overlay */}
                            <div className="absolute bottom-3 left-3 rounded-full bg-primary-container px-3 py-1 text-xs font-bold text-primary shadow-sm">
                              {leftPageNum}
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="hidden min-h-[430px] flex-1 rounded-3xl border-2 border-dashed border-border bg-primary-container md:block" />
                      )}

                      {/* Right page (hidden on mobile) */}
                      {!isMobile && (
                        hasRightPage ? (
                          <div className="flex justify-center overflow-hidden rounded-3xl border-2 border-border bg-white shadow-sm md:rounded-l-xl">
                            <div className="relative">
                              <Page
                                pageNumber={rightPageNum}
                                width={pageWidth}
                                onLoadSuccess={onPageLoadSuccess}
                                renderTextLayer={true}
                                renderAnnotationLayer={true}
                              />
                              {/* Page number overlay */}
                              <div className="absolute bottom-3 right-3 rounded-full bg-primary-container px-3 py-1 text-xs font-bold text-primary shadow-sm">
                                {rightPageNum}
                              </div>
                            </div>
                          </div>
                        ) : (
                          <div className="hidden min-h-[430px] flex-1 rounded-3xl border-2 border-dashed border-border bg-primary-container md:block" />
                        )
                      )}
                    </div>
                  </div>
                </TransformComponent>
              </>
            )}
          </TransformWrapper>
        </Document>
      </div>

      {/* Controls */}
      <div className={`grid gap-3 bg-white shadow-sm items-center mx-auto transition-all ${isFullscreen ? 'grid-cols-[auto_1fr_auto] rounded-full p-2 border-2 border-border max-w-fit gap-4 sm:gap-6' : 'sm:grid-cols-[1fr_auto_1fr] rounded-4xl border-[3px] border-border p-4 w-full'}`}>
        <button
          type="button"
          disabled={!canGoPrev || isFlipping}
          onClick={() => handleFlip("backward")}
          className={`flex items-center justify-center font-bold text-primary transition-all duration-200 hover:bg-white active:scale-[0.97] disabled:bg-gray-100 disabled:text-gray-400 disabled:active:scale-100 ${isFullscreen ? 'size-10 rounded-full border-2 border-border bg-primary-container text-xl' : 'min-h-12 rounded-2.5xl border-2 border-border bg-primary-container px-5 py-3 text-base'}`}
          title="Halaman Sebelumnya"
        >
          {isFullscreen ? '←' : '← Halaman Sebelumnya'}
        </button>

        <div className="flex flex-wrap justify-center gap-2">
          {numPages > 0 &&
            Array.from({ length: isMobile ? numPages : Math.ceil(numPages / 2) }).map(
              (_, index) => {
                const pageIndex = isMobile ? index : index * 2;
                const isActive = isMobile
                  ? currentIndex === pageIndex
                  : currentIndex - (currentIndex % 2) === pageIndex;
                return (
                  <button
                    key={index}
                    type="button"
                    onClick={() => jumpToPage(pageIndex)}
                    disabled={isFlipping}
                    className={`size-4 shrink-0 rounded-full border-2 transition-all duration-200 ${
                      isActive
                        ? "border-primary bg-primary scale-110"
                        : "border-border bg-primary-container hover:border-primary"
                    }`}
                    aria-label={isMobile ? `Buka halaman ${pageIndex + 1}` : `Buka halaman ${pageIndex + 1}-${Math.min(pageIndex + 2, numPages)}`}
                  />
                );
              },
            )}
        </div>

        <button
          type="button"
          disabled={!canGoNext || isFlipping}
          onClick={() => handleFlip("forward")}
          className={`flex items-center justify-center font-bold text-white transition-all duration-200 hover:bg-accent-dark active:scale-[0.97] disabled:bg-gray-300 disabled:text-gray-500 disabled:active:scale-100 ${isFullscreen ? 'size-10 rounded-full bg-accent text-xl' : 'min-h-12 rounded-2.5xl bg-accent px-5 py-3 text-base'}`}
          title="Halaman Berikutnya"
        >
          {isFullscreen ? '→' : 'Halaman Berikutnya →'}
        </button>
      </div>

      {/* Keyboard & Swipe hint */}
      {!isFullscreen && (
        <div className="rounded-2.5xl border-2 border-dashed border-border bg-white p-3 text-center transition-opacity">
          <p className="text-xs font-bold leading-relaxed text-gray-500">
            💡 Gunakan tombol{" "}
            <kbd className="rounded-lg bg-primary-container px-2 py-0.5 text-primary">
              ← →
            </kbd>{" "}
            pada keyboard, atau {isMobile ? "geser (swipe)" : "klik tombol di atas"} untuk membalik halaman.
          </p>
        </div>
      )}
    </div>
  );
}

