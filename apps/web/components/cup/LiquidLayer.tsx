"use client";

import { useRef, useEffect } from "react";
import { useAnimationFrame } from "framer-motion";

interface BoundsConfig {
  liquidTopFull: number;
  liquidBottom: number;
  cupLeftTop: number;
  cupRightTop: number;
  cupLeftBot: number;
  cupRightBot: number;
}

function buildLiquidPath(
  topY: number,
  wavePhase: number,
  waveAmplitude: number,
  progress: number,
  b: BoundsConfig,
): string {
  if (progress <= 0) return "";

  const STEPS = 40;
  const frac0 = Math.max(0, Math.min(1, (topY - b.liquidTopFull) / (b.liquidBottom - b.liquidTopFull)));
  const left0  = b.cupLeftTop  + frac0 * (b.cupLeftBot  - b.cupLeftTop);
  const right0 = b.cupRightTop + frac0 * (b.cupRightBot - b.cupRightTop);
  const width  = right0 - left0;
  const pts: [number, number][] = [];

  for (let i = 0; i <= STEPS; i++) {
    const frac = i / STEPS;
    const x = left0 + frac * width;
    const y = topY + Math.sin(frac * Math.PI * 2.5 + wavePhase) * waveAmplitude;
    pts.push([x, y]);
  }

  const botLeft  = b.cupLeftTop  + (b.cupLeftBot  - b.cupLeftTop);
  const botRight = b.cupRightTop + (b.cupRightBot - b.cupRightTop);

  let d = `M ${botLeft.toFixed(1)},${b.liquidBottom}`;
  d += ` L ${pts[0][0].toFixed(1)},${pts[0][1].toFixed(1)}`;
  for (let i = 1; i < pts.length; i++) {
    const [x0, y0] = pts[i - 1];
    const [x1, y1] = pts[i];
    const cpX = (x0 + x1) / 2;
    d += ` Q ${x0.toFixed(1)},${y0.toFixed(1)} ${cpX.toFixed(1)},${((y0 + y1) / 2).toFixed(1)}`;
  }
  const last = pts[pts.length - 1];
  d += ` L ${last[0].toFixed(1)},${last[1].toFixed(1)}`;
  d += ` L ${botRight.toFixed(1)},${b.liquidBottom} Z`;
  return d;
}

interface LiquidLayerProps {
  progress: number;
  liquidColor: string;
  liquidColorDark: string;
  turbulence?: number;
  liquidTopFull?: number;
  liquidBottom?: number;
  cupLeftTop?: number;
  cupRightTop?: number;
  cupLeftBot?: number;
  cupRightBot?: number;
}

export function LiquidLayer({
  progress,
  liquidColor,
  liquidColorDark,
  turbulence = 0.3,
  liquidTopFull = 133,
  liquidBottom = 318,
  cupLeftTop = 84,
  cupRightTop = 276,
  cupLeftBot = 99,
  cupRightBot = 261,
}: LiquidLayerProps) {
  const pathRef     = useRef<SVGPathElement>(null);
  const phaseRef    = useRef(0);
  const progressRef = useRef(progress);
  const boundsRef   = useRef({ liquidTopFull, liquidBottom, cupLeftTop, cupRightTop, cupLeftBot, cupRightBot });
  const gradId      = "liquid-grad-v2";

  useEffect(() => { progressRef.current = progress; }, [progress]);
  useEffect(() => {
    boundsRef.current = { liquidTopFull, liquidBottom, cupLeftTop, cupRightTop, cupLeftBot, cupRightBot };
  }, [liquidTopFull, liquidBottom, cupLeftTop, cupRightTop, cupLeftBot, cupRightBot]);

  const waveAmplitude = 2 + turbulence * 7;

  useAnimationFrame((_t, delta) => {
    if (!pathRef.current) return;
    phaseRef.current += delta * 0.00065;
    const p = progressRef.current;
    const b = boundsRef.current;
    const topY = b.liquidBottom - p * (b.liquidBottom - b.liquidTopFull);
    const amp  = waveAmplitude * (0.3 + p * 0.7);
    const d    = buildLiquidPath(topY, phaseRef.current, amp, p, b);
    pathRef.current.setAttribute("d", d);
  });

  const b    = boundsRef.current;
  const topY = b.liquidBottom - progress * (b.liquidBottom - b.liquidTopFull);

  return (
    <g>
      <defs>
        <linearGradient id={gradId} x1="0" y1={liquidTopFull} x2="0" y2={liquidBottom} gradientUnits="userSpaceOnUse">
          <stop offset="0%"   stopColor={liquidColor}     stopOpacity="0.90" />
          <stop offset="100%" stopColor={liquidColorDark} stopOpacity="1" />
        </linearGradient>
      </defs>

      <rect
        x={cupLeftTop - 8}
        y={topY + 3}
        width={cupRightTop - cupLeftTop + 16}
        height={Math.max(0, liquidBottom - topY)}
        fill={`url(#${gradId})`}
      />

      <path
        ref={pathRef}
        d={buildLiquidPath(topY, 0, waveAmplitude, progress, b)}
        fill={`url(#${gradId})`}
      />

      {progress > 0.04 && (
        <ellipse
          cx={180}
          cy={topY + 6}
          rx={58}
          ry={4.5}
          fill="rgba(255,255,255,0.22)"
        />
      )}
    </g>
  );
}
