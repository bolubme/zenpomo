"use client";

import { motion } from "framer-motion";

interface SteamAnimationProps {
  intensity: number;
  steamColor: string;
  rimY?: number;
}

interface WispConfig {
  x: number;
  delay: number;
  duration: number;
  amplitude: number;
}

// Wisps spread across cup interior (x 84–276), rising above rim at y=130
const WISPS: WispConfig[] = [
  { x: 140, delay: 0,   duration: 2.8, amplitude:  14 },
  { x: 180, delay: 0.9, duration: 3.2, amplitude: -18 },
  { x: 220, delay: 1.7, duration: 2.5, amplitude:  12 },
];

function SteamWisp({ config, intensity, steamColor }: { config: WispConfig; intensity: number; steamColor: string }) {
  if (intensity < 0.05) return null;

  const opacity = Math.min(1, intensity * 1.4) * 0.78;
  const { x, amplitude: amp } = config;

  return (
    <motion.g
      initial={{ opacity: 0 }}
      animate={{ opacity }}
      transition={{ duration: 1.2 }}
    >
      <motion.path
        d={`M ${x},122 Q ${x + amp},95 ${x - amp * 0.4},68 Q ${x + amp * 0.6},42 ${x},18`}
        stroke={steamColor}
        strokeWidth="5"
        strokeLinecap="round"
        fill="none"
        initial={{ pathLength: 0, opacity: 0 }}
        animate={{
          pathLength: [0, 1, 1],
          opacity:    [0, opacity, 0],
          y:          [0, -20],
        }}
        transition={{
          duration:  config.duration,
          delay:     config.delay,
          repeat:    Infinity,
          ease:      "easeInOut",
          times:     [0, 0.6, 1],
        }}
      />
    </motion.g>
  );
}

export function SteamAnimation({ intensity, steamColor, rimY = 122 }: SteamAnimationProps) {
  const offsetY = rimY - 122;
  return (
    <g aria-hidden="true" transform={offsetY !== 0 ? `translate(0,${offsetY})` : undefined}>
      {WISPS.map((w, i) => (
        <SteamWisp key={i} config={w} intensity={intensity} steamColor={steamColor} />
      ))}
    </g>
  );
}
