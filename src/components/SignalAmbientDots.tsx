import { useEffect, useRef } from "react";

/**
 * Ambient lavender dots that drift slowly across the screen,
 * creating a "signal being cast" atmosphere. Uses canvas for performance.
 */

interface Dot {
  x: number;
  y: number;
  r: number;
  vx: number;
  vy: number;
  alpha: number;
  pulseOffset: number;
}

export default function SignalAmbientDots() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const dotsRef = useRef<Dot[]>([]);
  const frameRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let w = 0;
    let h = 0;

    function resize() {
      w = window.innerWidth;
      h = window.innerHeight;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas!.width = w * dpr;
      canvas!.height = h * dpr;
      canvas!.style.width = `${w}px`;
      canvas!.style.height = `${h}px`;
      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    function initDots() {
      // Fewer dots on mobile for performance
      const count = w < 768 ? 28 : 50;
      dotsRef.current = Array.from({ length: count }, () => ({
        x: Math.random() * w,
        y: Math.random() * h,
        r: Math.random() * 2.5 + 1,
        vx: (Math.random() - 0.5) * 0.15,
        vy: (Math.random() - 0.5) * 0.12,
        alpha: Math.random() * 0.3 + 0.05,
        pulseOffset: Math.random() * Math.PI * 2,
      }));
    }

    resize();
    initDots();
    window.addEventListener("resize", resize);

    let time = 0;

    function draw() {
      if (!ctx) return;
      ctx.clearRect(0, 0, w, h);
      time += 0.008;

      const dots = dotsRef.current;
      for (let i = 0; i < dots.length; i++) {
        const d = dots[i];
        d.x += d.vx;
        d.y += d.vy;

        // Wrap around edges
        if (d.x < -10) d.x = w + 10;
        if (d.x > w + 10) d.x = -10;
        if (d.y < -10) d.y = h + 10;
        if (d.y > h + 10) d.y = -10;

        // Slow rhythmic pulse
        const pulse = Math.sin(time * 1.5 + d.pulseOffset) * 0.5 + 0.5;
        const alpha = d.alpha * (0.4 + pulse * 0.6);
        const radius = d.r * (0.85 + pulse * 0.15);

        // Lavender color: hsl(284, 30%, 64%) → rgb(175, 146, 182)
        ctx.beginPath();
        ctx.arc(d.x, d.y, radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(175, 146, 182, ${alpha})`;
        ctx.fill();

        // Soft glow on larger dots
        if (d.r > 2) {
          ctx.beginPath();
          ctx.arc(d.x, d.y, radius * 3, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(175, 146, 182, ${alpha * 0.08})`;
          ctx.fill();
        }
      }

      // Draw faint connection lines between nearby dots
      for (let i = 0; i < dots.length; i++) {
        for (let j = i + 1; j < dots.length; j++) {
          const dx = dots[i].x - dots[j].x;
          const dy = dots[i].y - dots[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          const maxDist = w < 768 ? 100 : 140;
          if (dist < maxDist) {
            const lineAlpha = (1 - dist / maxDist) * 0.04;
            ctx.beginPath();
            ctx.moveTo(dots[i].x, dots[i].y);
            ctx.lineTo(dots[j].x, dots[j].y);
            ctx.strokeStyle = `rgba(175, 146, 182, ${lineAlpha})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        }
      }

      frameRef.current = requestAnimationFrame(draw);
    }

    frameRef.current = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(frameRef.current);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 z-0 pointer-events-none"
      aria-hidden="true"
    />
  );
}
