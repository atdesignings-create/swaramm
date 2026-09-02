/**
 * PitchCanvas.tsx — the live pitch curve.
 *
 * WHAT: Draws the last few seconds of the singer's pitch as a flowing line,
 *       with the target note as a soft guide band.
 * WHY:  Seeing the line drift above or below the band teaches pitch faster
 *       than any number can.
 * HOW:  Reads the shared history ref every animation frame; nothing is stored
 *       in React state, so the canvas never causes re-renders.
 */

import { useEffect, useRef } from "react";
import { midiToName } from "@/lib/swaram/music";

interface Props {
  historyRef: React.RefObject<number[]>;
  /** Target MIDI note to draw as the guide band (optional). */
  targetMidi?: number | null;
  className?: string;
}

export function PitchCanvas({ historyRef, targetMidi, className }: Props) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const targetRef = useRef<number | null | undefined>(targetMidi);
  targetRef.current = targetMidi;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    let raf = 0;

    const draw = () => {
      const dpr = window.devicePixelRatio || 1;
      const w = canvas.clientWidth;
      const h = canvas.clientHeight;
      if (canvas.width !== w * dpr || canvas.height !== h * dpr) {
        canvas.width = w * dpr;
        canvas.height = h * dpr;
      }
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, w, h);

      const history = historyRef.current ?? [];
      const target = targetRef.current;
      const values = history.filter((v) => Number.isFinite(v));
      const centre = target ?? (values.length ? values[values.length - 1] : 60);
      const span = 14; // semitones visible top-to-bottom
      const yFor = (midi: number) => h / 2 - ((midi - centre) / span) * h;

      const styles = getComputedStyle(canvas);
      const line = styles.getPropertyValue("--swaram-curve").trim() || "#0ea5a4";
      const band = styles.getPropertyValue("--swaram-band").trim() || "#99f6e4";
      const grid = styles.getPropertyValue("--swaram-grid").trim() || "#e2e8f0";

      // Guide lines every semitone around the centre.
      ctx.strokeStyle = grid;
      ctx.lineWidth = 1;
      for (let s = -6; s <= 6; s += 2) {
        const y = yFor(Math.round(centre) + s);
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(w, y);
        ctx.stroke();
      }

      // Target band = "in tune" zone (±35 cents).
      if (target != null) {
        const top = yFor(target + 0.35);
        const bottom = yFor(target - 0.35);
        ctx.fillStyle = band;
        ctx.globalAlpha = 0.35;
        ctx.fillRect(0, top, w, bottom - top);
        ctx.globalAlpha = 1;
        ctx.fillStyle = line;
        ctx.font = "600 12px system-ui, sans-serif";
        ctx.fillText(midiToName(target), 8, top - 6);
      }

      // The sung pitch curve.
      if (values.length > 1) {
        ctx.strokeStyle = line;
        ctx.lineWidth = 3;
        ctx.lineJoin = "round";
        ctx.lineCap = "round";
        ctx.beginPath();
        values.forEach((v, i) => {
          const x = (i / (values.length - 1)) * w;
          const y = yFor(v);
          if (i === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        });
        ctx.stroke();

        const lastY = yFor(values[values.length - 1]);
        ctx.fillStyle = line;
        ctx.beginPath();
        ctx.arc(w - 4, lastY, 5, 0, Math.PI * 2);
        ctx.fill();
      }

      raf = requestAnimationFrame(draw);
    };
    raf = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(raf);
  }, [historyRef]);

  return <canvas ref={canvasRef} className={className} aria-hidden />;
}
