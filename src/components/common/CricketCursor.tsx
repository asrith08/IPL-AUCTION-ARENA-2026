import React, { useEffect, useState } from "react";

export const CricketCursor: React.FC = () => {
  const [pos, setPos] = useState({ x: -100, y: -100 });
  const [isPointer, setIsPointer] = useState(false);
  const [isTouchDevice, setIsTouchDevice] = useState(false);

  useEffect(() => {
    // Check touch device
    if ("ontouchstart" in window || navigator.maxTouchPoints > 0) {
      setIsTouchDevice(true);
      return;
    }

    const handleMouseMove = (e: MouseEvent) => {
      setPos({ x: e.clientX, y: e.clientY });

      const target = e.target as HTMLElement | null;
      if (target) {
        const clickable =
          target.tagName === "BUTTON" ||
          target.tagName === "A" ||
          target.tagName === "INPUT" ||
          target.closest("button") ||
          target.closest("a") ||
          window.getComputedStyle(target).cursor === "pointer";
        setIsPointer(!!clickable);
      }
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  if (isTouchDevice) return null;

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed z-50 transition-transform duration-75 ease-out"
      style={{
        left: `${pos.x}px`,
        top: `${pos.y}px`,
        transform: `translate(-50%, -50%) scale(${isPointer ? 1.25 : 1.0})`,
      }}
    >
      {/* Cricket Ball */}
      <div className="relative h-6 w-6 rounded-full bg-gradient-to-br from-red-600 via-red-700 to-red-900 shadow-lg border border-red-950/60 flex items-center justify-center">
        {/* White Cricket Seam Stitching */}
        <div className="absolute inset-0 rounded-full border-t border-b border-dashed border-white/80 opacity-90 rotate-45 scale-90" />
      </div>
    </div>
  );
};
