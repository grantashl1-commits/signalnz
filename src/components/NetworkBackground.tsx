import { useEffect, useRef, useCallback } from "react";

interface NetworkNode {
  x: number;
  y: number;
  vx: number;
  vy: number;
  phase: number;
  brightness: number;
  targetBrightness: number;
}

interface NetworkBackgroundProps {
  opacity?: number;
  nodeCount?: number;
  className?: string;
}

export default function NetworkBackground({ opacity = 0.35, nodeCount = 50, className = "" }: NetworkBackgroundProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const nodesRef = useRef<NetworkNode[]>([]);
  const animRef = useRef<number>(0);
  const rippleRef = useRef<{ x: number; y: number; t: number; maxR: number }[]>([]);

  const initNodes = useCallback((w: number, h: number) => {
    const nodes: NetworkNode[] = [];
    for (let i = 0; i < nodeCount; i++) {
      nodes.push({
        x: Math.random() * w,
        y: Math.random() * h,
        vx: (Math.random() - 0.5) * 0.15,
        vy: (Math.random() - 0.5) * 0.15,
        phase: Math.random() * Math.PI * 2,
        brightness: 0.3 + Math.random() * 0.3,
        targetBrightness: 0.3 + Math.random() * 0.3,
      });
    }
    nodesRef.current = nodes;
  }, [nodeCount]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resize = () => {
      const rect = canvas.parentElement?.getBoundingClientRect();
      if (rect) {
        canvas.width = rect.width;
        canvas.height = rect.height;
        if (nodesRef.current.length === 0) {
          initNodes(rect.width, rect.height);
        }
      }
    };

    resize();
    window.addEventListener("resize", resize);

    const connectionDist = 150;
    const cyan = { r: 127, g: 255, b: 212 }; // #7FFFD4

    let signalTimer = 0;
    let signalNode = -1;
    let signalProgress = 0;

    const draw = (time: number) => {
      if (!canvas || !ctx) return;
      const w = canvas.width;
      const h = canvas.height;
      const nodes = nodesRef.current;

      ctx.clearRect(0, 0, w, h);

      // Update nodes
      for (const node of nodes) {
        node.x += node.vx;
        node.y += node.vy;
        if (node.x < 0 || node.x > w) node.vx *= -1;
        if (node.y < 0 || node.y > h) node.vy *= -1;
        node.x = Math.max(0, Math.min(w, node.x));
        node.y = Math.max(0, Math.min(h, node.y));

        // Pulse
        node.brightness = 0.3 + 0.25 * Math.sin(time * 0.001 + node.phase);
        node.brightness = Math.max(0, Math.min(1, node.brightness + (node.targetBrightness - node.brightness) * 0.05));
      }

      // Signal every 8 seconds
      signalTimer += 1 / 60;
      if (signalTimer > 8) {
        signalTimer = 0;
        signalNode = Math.floor(Math.random() * nodes.length);
        signalProgress = 0;
      }
      if (signalNode >= 0) {
        signalProgress = Math.min(1, signalProgress + 0.02);
        if (signalProgress >= 1) signalNode = -1;
      }

      // Draw connections
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const dx = nodes[i].x - nodes[j].x;
          const dy = nodes[i].y - nodes[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < connectionDist) {
            const alpha = (1 - dist / connectionDist) * 0.3;
            let lineAlpha = alpha;

            // Signal brightening
            if (signalNode >= 0 && (i === signalNode || j === signalNode)) {
              lineAlpha = Math.max(alpha, 0.6 * (1 - signalProgress));
            }

            ctx.beginPath();
            ctx.moveTo(nodes[i].x, nodes[i].y);
            ctx.lineTo(nodes[j].x, nodes[j].y);
            ctx.strokeStyle = `rgba(${cyan.r}, ${cyan.g}, ${cyan.b}, ${lineAlpha})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        }
      }

      // Draw nodes
      for (let i = 0; i < nodes.length; i++) {
        const node = nodes[i];
        let alpha = node.brightness;
        let radius = 1.5;

        if (signalNode === i) {
          alpha = Math.max(alpha, 0.9 * (1 - signalProgress));
          radius = 2.5;
        }

        ctx.beginPath();
        ctx.arc(node.x, node.y, radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${cyan.r}, ${cyan.g}, ${cyan.b}, ${alpha})`;
        ctx.fill();

        // Glow on bright nodes
        if (alpha > 0.5) {
          ctx.beginPath();
          ctx.arc(node.x, node.y, radius + 3, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(${cyan.r}, ${cyan.g}, ${cyan.b}, ${alpha * 0.15})`;
          ctx.fill();
        }
      }

      // Draw ripples
      const ripples = rippleRef.current;
      for (let i = ripples.length - 1; i >= 0; i--) {
        const rip = ripples[i];
        rip.t += 0.02;
        if (rip.t > 1) {
          ripples.splice(i, 1);
          continue;
        }
        const r = rip.t * rip.maxR;
        const alpha = (1 - rip.t) * 0.5;
        ctx.beginPath();
        ctx.arc(rip.x, rip.y, r, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(${cyan.r}, ${cyan.g}, ${cyan.b}, ${alpha})`;
        ctx.lineWidth = 1;
        ctx.stroke();

        // Brighten nearby nodes
        for (const node of nodes) {
          const dx = node.x - rip.x;
          const dy = node.y - rip.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (Math.abs(dist - r) < 30) {
            node.targetBrightness = Math.min(1, node.targetBrightness + 0.1);
          }
        }
      }

      animRef.current = requestAnimationFrame(draw);
    };

    animRef.current = requestAnimationFrame(draw);

    // Click to ripple
    const handleClick = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      rippleRef.current.push({ x, y, t: 0, maxR: 120 });
    };

    canvas.addEventListener("click", handleClick);

    return () => {
      cancelAnimationFrame(animRef.current);
      window.removeEventListener("resize", resize);
      canvas.removeEventListener("click", handleClick);
    };
  }, [initNodes]);

  return (
    <canvas
      ref={canvasRef}
      className={`absolute inset-0 pointer-events-auto ${className}`}
      style={{ opacity }}
    />
  );
}
