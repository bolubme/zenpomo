"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useSpring, useTransform } from "framer-motion";
import { LiquidLayer } from "./LiquidLayer";
import { SteamAnimation } from "./SteamAnimation";
import type { TimerStatus, CupStyle } from "@zenpomo/core";

const LIQUID_COLOR      = "#C08A5A";
const LIQUID_COLOR_DARK = "#7A5030";
const STEAM_COLOR       = "rgba(210,190,170,0.6)";
const CUP_FILL          = "#F5EDE0";
const CUP_STROKE        = "#D4B896";

interface CupConfig {
  clipPathD?: string;
  bodyD?: string;
  handleStrokeD?: string;
  handleFillD?: string;
  rimY: number;
  rimLineX1?: number;
  rimLineX2?: number;
  saucer?: { cx: number; cy: number; rx: number; ry: number };
  isCircle?: boolean;
  circleR?: number;
  circleCX?: number;
  circleCY?: number;
  hasGlassHighlight?: boolean;
  noSteam?: boolean;
  hasLid?: boolean;
  svgTransform?: string;
  svgScale?: number;
  bodyFillRule?: "nonzero" | "evenodd";
  lidD?: string;
  sleeveRect?: { x: number; y: number; width: number; height: number };
  liquidTopFull: number;
  liquidBottom: number;
  cupLeftTop: number;
  cupRightTop: number;
  cupLeftBot: number;
  cupRightBot: number;
}

export const CUP_CONFIGS: Record<CupStyle, CupConfig> = {
  classic: {
    clipPathD:     "M 84 133 L 276 133 L 260 318 Q 258 332 244 332 L 116 332 Q 100 332 99 318 Z",
    bodyD:         "M 80 130 L 280 130 L 263 320 Q 261 335 245 335 L 115 335 Q 99 335 97 320 Z",
    handleStrokeD: "M 278 170 Q 335 170 335 215 Q 335 260 278 260",
    handleFillD:   "M 278 170 Q 335 170 335 215 Q 335 260 278 260 L 278 248 Q 318 248 318 215 Q 318 182 278 182 Z",
    rimY: 130, rimLineX1: 82, rimLineX2: 278,
    liquidTopFull: 133, liquidBottom: 318,
    cupLeftTop: 84, cupRightTop: 276, cupLeftBot: 99, cupRightBot: 261,
  },
  espresso: {
    clipPathD:     "M 117 192 L 241 192 L 232 300 Q 230 310 218 310 L 142 310 Q 130 310 128 300 Z",
    bodyD:         "M 113 188 L 245 188 L 236 304 Q 234 318 220 318 L 140 318 Q 126 318 124 304 Z",
    handleStrokeD: "M 241 208 Q 278 208 278 244 Q 278 280 241 280",
    handleFillD:   "M 241 208 Q 278 208 278 244 Q 278 280 241 280 L 241 270 Q 265 270 265 244 Q 265 218 241 218 Z",
    rimY: 188, rimLineX1: 115, rimLineX2: 242,
    saucer: { cx: 180, cy: 330, rx: 108, ry: 7 },
    liquidTopFull: 192, liquidBottom: 300,
    cupLeftTop: 117, cupRightTop: 241, cupLeftBot: 128, cupRightBot: 232,
  },
  takeaway: {
    clipPathD:  "M 93 118 L 104 326 Q 104 333 116 333 L 244 333 Q 256 333 256 326 L 267 118 Z",
    bodyD:      "M 88 115 L 97 330 Q 97 340 112 340 L 248 340 Q 263 340 263 330 L 272 115 Z",
    rimY: 98,
    noSteam: true,
    hasLid: true,
    lidD: "M 82 97 L 278 97 L 282 115 L 78 115 Z",
    sleeveRect: { x: 102, y: 198, width: 156, height: 62 },
    liquidTopFull: 118, liquidBottom: 326,
    cupLeftTop: 93, cupRightTop: 267, cupLeftBot: 104, cupRightBot: 256,
  },
  cappuccino: {
    clipPathD:     "M 52 115 Q 52 112 59 112 L 301 112 Q 308 112 308 115 L 290 286 Q 280 304 246 304 L 114 304 Q 80 304 70 286 Z",
    bodyD:         "M 45 108 Q 45 100 55 100 L 305 100 Q 315 100 315 108 L 295 290 Q 283 312 247 312 L 113 312 Q 77 312 65 290 Z",
    handleStrokeD: "M 295 148 Q 350 148 350 190 Q 350 232 295 232",
    handleFillD:   "M 295 148 Q 350 148 350 190 Q 350 232 295 232 L 295 220 Q 337 220 337 190 Q 337 160 295 160 Z",
    rimY: 100, rimLineX1: 48, rimLineX2: 312,
    saucer: { cx: 180, cy: 324, rx: 157, ry: 10 },
    liquidTopFull: 112, liquidBottom: 286,
    cupLeftTop: 52, cupRightTop: 308, cupLeftBot: 70, cupRightBot: 290,
  },
  glass: {
    clipPathD: "M 123 80 L 123 336 L 237 336 L 237 80 Z",
    bodyD:     "M 118 75 L 118 338 Q 118 348 130 348 L 230 348 Q 242 348 242 338 L 242 75 Z",
    rimY: 75, rimLineX1: 120, rimLineX2: 240,
    noSteam: true,
    hasGlassHighlight: true,
    liquidTopFull: 80, liquidBottom: 336,
    cupLeftTop: 123, cupRightTop: 237, cupLeftBot: 123, cupRightBot: 237,
  },
  minimal: {
    isCircle: true, circleR: 110, circleCX: 180, circleCY: 230,
    noSteam: true,
    rimY: 120,
    liquidTopFull: 122, liquidBottom: 338,
    cupLeftTop: 70, cupRightTop: 290, cupLeftBot: 70, cupRightBot: 290,
  },
  teacup: {
    // SVG paths are in original 24×24 space; transform="translate(47,74) scale(14)" maps into 360×400
    // Cup body top:  y=4 → 130   Interior top: y=6 → 158   Interior bottom: y=17 → 312
    // Interior left: x=4 → 103   Interior right: x=17 → 285
    clipPathD: "M17,6 L4,6 L4,10.5 L4.00410301,10.7331372 C4.12684948,14.2150508 6.98819022,17 10.5,17 C14.0118587,17 16.8731526,14.2150508 16.9958971,10.7331372 L17,10.5 L17,6 Z",
    bodyD: "M17,4 C18.1046,4 19,4.89543 19,6 L19,8.03544 C20.6961,8.27806 22,9.73676 22,11.5 C22,13.433 20.433,15 18.5,15 L17.7124,15 C16.9252,16.259 15.8175,17.2971 14.5036,18 L17,18 C17.5523,18 18,18.4477 18,19 C18,19.5523 17.5523,20 17,20 L4,20 C3.44772,20 3,19.5523 3,19 C3,18.4477 3.44772,18 4,18 L6.49645,18 C3.8205,16.5686 2,13.7469 2,10.5 L2,6 C2,4.89543 2.89543,4 4,4 L17,4 Z M17,6 L4,6 L4,10.5 L4.00410301,10.7331372 C4.12684948,14.2150508 6.98819022,17 10.5,17 C14.0118587,17 16.8731526,14.2150508 16.9958971,10.7331372 L17,10.5 L17,6 Z M19,10.0854 L19,10.5 C19,11.3681 18.8699,12.2058 18.6281,12.9946 C19.3965,12.9296 20,12.2853 20,11.5 C20,10.8971385 19.6443456,10.3773538 19.1313988,10.1390083 L19,10.0854 Z",
    svgTransform: "translate(47,74) scale(14)",
    svgScale: 14,
    bodyFillRule: "nonzero",
    rimY: 130,
    liquidTopFull: 158, liquidBottom: 308,
    cupLeftTop: 103, cupRightTop: 285, cupLeftBot: 103, cupRightBot: 285,
  },
};

// ─── Sub-components ───────────────────────────────────────────────────────────

function PourStream({ active, rimY = 133 }: { active: boolean; rimY?: number }) {
  const streamH = rimY + 30;
  return (
    <motion.g aria-hidden="true">
      <motion.rect
        x="168" y="-30" width="14" rx="7"
        fill={LIQUID_COLOR} fillOpacity="0.85"
        initial={{ height: 0, opacity: 0 }}
        animate={active ? { height: [0, streamH], opacity: [0, 0.9, 0.85] } : { height: 0, opacity: 0 }}
        transition={{ duration: 0.55, ease: "easeIn" }}
      />
      {active && (
        <motion.ellipse
          cx="175" cy={rimY + 2} rx="4" ry="4"
          fill={LIQUID_COLOR} fillOpacity="0.4"
          animate={{ rx: [4, 50], ry: [4, 14], opacity: [0.4, 0] }}
          transition={{ duration: 0.5, delay: 0.5, ease: "easeOut" }}
        />
      )}
    </motion.g>
  );
}

function CompletionParticles({ active, rimY = 130 }: { active: boolean; rimY?: number }) {
  if (!active) return null;
  const dy = rimY - 130;
  const particles = [
    { cx: 150, cy: 120 + dy, dx: -28, dy: -70 },
    { cx: 180, cy: 110 + dy, dx:   0, dy: -82 },
    { cx: 210, cy: 120 + dy, dx:  28, dy: -70 },
    { cx: 162, cy: 125 + dy, dx: -18, dy: -76 },
    { cx: 198, cy: 125 + dy, dx:  22, dy: -74 },
  ];
  return (
    <g aria-hidden="true">
      {particles.map((p, i) => (
        <motion.circle
          key={i}
          cx={p.cx} cy={p.cy} r="5"
          fill="#C4A882"
          initial={{ opacity: 1, cx: p.cx, cy: p.cy, r: 5 }}
          animate={{ opacity: [1, 0], cx: p.cx + p.dx, cy: p.cy + p.dy, r: [5, 2] }}
          transition={{ duration: 1.4, delay: i * 0.08, ease: "easeOut" }}
        />
      ))}
    </g>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

interface CoffeeCupProps {
  liquidLevel: number;
  status: TimerStatus;
  isRefilling: boolean;
  onRefillComplete?: () => void;
  cupStyle?: CupStyle;
}

export function CoffeeCup({
  liquidLevel,
  status,
  isRefilling,
  onRefillComplete,
  cupStyle = "classic",
}: CoffeeCupProps) {
  const cfg        = CUP_CONFIGS[cupStyle];
  const isRunning  = status === "running";
  const isCompleted = status === "completed";

  const springLevel = useSpring(liquidLevel, { stiffness: 28, damping: 14, mass: 1.2 });
  useEffect(() => { springLevel.set(liquidLevel); }, [liquidLevel, springLevel]);

  const steamTransform = useTransform(
    springLevel,
    [0, 0.2, 1],
    [0, isRunning ? 0.25 : 0.15, isRunning ? 1 : 0.55]
  );
  const [steamIntensity, setSteamIntensity] = useState(() => steamTransform.get());
  useEffect(() => steamTransform.on("change", setSteamIntensity), [steamTransform]);

  const refillTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => {
    if (isRefilling) {
      refillTimer.current = setTimeout(() => onRefillComplete?.(), 1500);
    }
    return () => { if (refillTimer.current) clearTimeout(refillTimer.current); };
  }, [isRefilling, onRefillComplete]);

  const turbulence = isRefilling ? 0.8 : isRunning ? 0.35 : 0.15;

  return (
    <motion.div
      animate={isRunning ? { scale: [1, 1.006, 1] } : { scale: 1 }}
      transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
      style={{ display: "flex", justifyContent: "center", alignItems: "center", width: "100%" }}
      aria-label={`Coffee cup — ${Math.round(liquidLevel * 100)}% remaining`}
      role="img"
    >
      <svg
        viewBox="0 0 360 400"
        style={{ width: "100%", overflow: "visible", display: "block" }}
        aria-hidden="true"
      >
        <defs>
          <clipPath id="cup-interior-clip">
            {cfg.isCircle
              ? <circle cx={cfg.circleCX} cy={cfg.circleCY} r={cfg.circleR} />
              : <path d={cfg.clipPathD} transform={cfg.svgTransform} />
            }
          </clipPath>
        </defs>

        {!cfg.noSteam && <SteamAnimation intensity={steamIntensity} steamColor={STEAM_COLOR} rimY={cfg.rimY} />}
        <PourStream active={isRefilling} rimY={cfg.rimY} />

        {/* Body fill */}
        {cfg.isCircle
          ? <circle cx={cfg.circleCX} cy={cfg.circleCY} r={(cfg.circleR ?? 110) + 2} fill={CUP_FILL} />
          : <path d={cfg.bodyD} fill={CUP_FILL} fillRule={cfg.bodyFillRule} transform={cfg.svgTransform} />
        }

        {/* Handle fill */}
        {cfg.handleFillD && <path d={cfg.handleFillD} fill={CUP_FILL} />}

        {/* Saucer (behind liquid) */}
        {cfg.saucer && (
          <ellipse
            cx={cfg.saucer.cx} cy={cfg.saucer.cy}
            rx={cfg.saucer.rx} ry={cfg.saucer.ry}
            fill={CUP_FILL} stroke={CUP_STROKE} strokeWidth="2"
          />
        )}

        {/* Liquid — clipped to cup interior */}
        <g clipPath="url(#cup-interior-clip)">
          <LiquidLayer
            progress={liquidLevel}
            liquidColor={LIQUID_COLOR}
            liquidColorDark={LIQUID_COLOR_DARK}
            turbulence={turbulence}
            liquidTopFull={cfg.liquidTopFull}
            liquidBottom={cfg.liquidBottom}
            cupLeftTop={cfg.cupLeftTop}
            cupRightTop={cfg.cupRightTop}
            cupLeftBot={cfg.cupLeftBot}
            cupRightBot={cfg.cupRightBot}
          />
        </g>

        {/* Body outline on top */}
        {cfg.isCircle
          ? <circle cx={cfg.circleCX} cy={cfg.circleCY} r={(cfg.circleR ?? 110) + 2} fill="none" stroke={CUP_STROKE} strokeWidth="3" />
          : <path d={cfg.bodyD} fill="none" stroke={CUP_STROKE}
              strokeWidth={cfg.svgScale ? 3 / cfg.svgScale : 3}
              fillRule={cfg.bodyFillRule}
              transform={cfg.svgTransform}
            />
        }

        {/* Handle outline */}
        {cfg.handleStrokeD && (
          <path d={cfg.handleStrokeD} fill="none" stroke={CUP_STROKE} strokeWidth="3" strokeLinecap="round" />
        )}

        {/* Rim highlight */}
        {cfg.rimLineX1 !== undefined && (
          <line
            x1={cfg.rimLineX1} y1={cfg.rimY}
            x2={cfg.rimLineX2} y2={cfg.rimY}
            stroke={CUP_STROKE} strokeWidth="2.5" strokeLinecap="round"
          />
        )}

        {/* Takeaway lid */}
        {cfg.hasLid && cfg.lidD && (
          <>
            <path d={cfg.lidD} fill={CUP_FILL} stroke={CUP_STROKE} strokeWidth="2.5" />
            {/* Drinking hole */}
            <path d="M 163 97 L 197 97 L 197 90 Q 194 84 180 84 Q 166 84 163 90 Z"
              fill={CUP_STROKE} opacity="0.45" />
          </>
        )}

        {/* Takeaway sleeve label */}
        {cfg.sleeveRect && (
          <>
            <rect
              x={cfg.sleeveRect.x} y={cfg.sleeveRect.y}
              width={cfg.sleeveRect.width} height={cfg.sleeveRect.height}
              fill="none" stroke={CUP_STROKE} strokeWidth="1.5" rx="2"
            />
            <text
              x="180" y={cfg.sleeveRect.y + cfg.sleeveRect.height / 2 + 5}
              textAnchor="middle" fontSize="14" fontWeight="600"
              fill={CUP_STROKE} opacity="0.55"
              fontFamily="Inter, system-ui, sans-serif"
              letterSpacing="3"
            >
              FOCUS
            </text>
          </>
        )}

        {/* Glass highlight */}
        {cfg.hasGlassHighlight && (
          <line x1="130" y1="85" x2="130" y2="325"
            stroke="white" strokeWidth="3" strokeLinecap="round" opacity="0.5" />
        )}

        <CompletionParticles active={isCompleted} rimY={cfg.rimY} />
      </svg>
    </motion.div>
  );
}
