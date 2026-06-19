import { useEffect, useMemo } from "react";

const COLORS = [
  "#0B5FFF",
  "#00A3FF",
  "#F5B800",
  "#FF6B6B",
  "#22C55E",
  "#A855F7",
];

export function Confetti({ count = 120 }: { count?: number }) {
  const pieces = useMemo(
    () =>
      Array.from({ length: count }).map((_, i) => ({
        id: i,
        left: Math.random() * 100,
        delay: Math.random() * 1.5,
        duration: 3 + Math.random() * 3,
        color: COLORS[i % COLORS.length],
        size: 6 + Math.random() * 8,
        rotate: Math.random() * 360,
      })),
    [count],
  );

  useEffect(() => {
    document.body.style.overflowX = "hidden";
    return () => {
      document.body.style.overflowX = "";
    };
  }, []);

  return (
    <div className="pointer-events-none fixed inset-0 z-50 overflow-hidden">
      {pieces.map((p) => (
        <span
          key={p.id}
          style={{
            position: "absolute",
            top: "-10vh",
            left: `${p.left}%`,
            width: p.size,
            height: p.size * 0.45,
            background: p.color,
            transform: `rotate(${p.rotate}deg)`,
            borderRadius: 2,
            animation: `confetti-fall ${p.duration}s linear ${p.delay}s forwards`,
          }}
        />
      ))}
    </div>
  );
}
