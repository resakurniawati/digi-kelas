"use client";

import React, { useEffect, useRef, useState } from "react";

export default function CertificateViewer({ children }: { children: React.ReactNode }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);

  useEffect(() => {
    const handleResize = () => {
      if (containerRef.current) {
        const availableWidth = containerRef.current.clientWidth;
        // 1123px is our fixed A4 width
        if (availableWidth < 1123) {
          setScale(availableWidth / 1123);
        } else {
          setScale(1);
        }
      }
    };

    const resizeObserver = new ResizeObserver(handleResize);
    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }

    handleResize(); // Initial call

    return () => resizeObserver.disconnect();
  }, []);

  return (
    <div ref={containerRef} className="w-full flex justify-center print:block print:w-auto">
      <div 
        className="relative print:!w-auto print:!h-auto"
        style={{ 
          width: scale < 1 ? `${1123 * scale}px` : '1123px', 
          height: scale < 1 ? `${794 * scale}px` : '794px' 
        }}
      >
        <div
          className="absolute top-0 left-0 origin-top-left print:static print:!scale-100 print:!transform-none"
          style={{ 
            transform: `scale(${scale})`, 
            width: '1123px',
            height: '794px'
          }}
        >
          {children}
        </div>
      </div>
    </div>
  );
}
