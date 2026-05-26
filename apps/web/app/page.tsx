"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useTimerStore } from "@zenpomo/core";
import { X } from "lucide-react";

/* ─── Static cup illustrations ──────────────────────────────────── */

function HeroCup() {
  return (
    <svg viewBox="0 0 320 380" width="100%" style={{ maxWidth: 300 }}>
      {/* Steam */}
      <g opacity="0.5">
        <path d="M 120 90 Q 114 72 122 57 Q 130 40 122 24" stroke="#6F4E37" strokeWidth="1.8" fill="none" strokeLinecap="round"/>
        <path d="M 155 86 Q 149 65 158 50 Q 167 32 158 15" stroke="#6F4E37" strokeWidth="1.8" fill="none" strokeLinecap="round"/>
        <path d="M 190 90 Q 184 72 193 57 Q 201 40 193 24" stroke="#6F4E37" strokeWidth="1.8" fill="none" strokeLinecap="round"/>
      </g>
      <defs>
        <clipPath id="hero-clip">
          <path d="M 68 118 L 252 118 L 237 292 Q 235 307 220 307 L 100 307 Q 85 307 83 292 Z"/>
        </clipPath>
        <linearGradient id="hero-liquid" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#6B3A26"/>
          <stop offset="100%" stopColor="#3A1E10"/>
        </linearGradient>
      </defs>
      {/* Handle */}
      <path d="M 250 155 Q 294 155 294 197 Q 294 239 250 239" stroke="#2D4A3E" strokeWidth="4" fill="none" strokeLinecap="round"/>
      {/* Cup body */}
      <path d="M 68 118 L 252 118 L 237 292 Q 235 307 220 307 L 100 307 Q 85 307 83 292 Z" fill="#FDFAF5" stroke="#2D4A3E" strokeWidth="3.5"/>
      {/* Liquid */}
      <g clipPath="url(#hero-clip)">
        <rect x="60" y="185" width="210" height="140" fill="url(#hero-liquid)"/>
        <ellipse cx="160" cy="185" rx="87" ry="7" fill="#5C3A21"/>
        <ellipse cx="160" cy="183" rx="70" ry="3.5" fill="#8B5A2B" opacity="0.45"/>
      </g>
      {/* Rim */}
      <ellipse cx="160" cy="118" rx="92" ry="9" fill="none" stroke="#2D4A3E" strokeWidth="3.5"/>
      {/* Saucer shadow */}
      <ellipse cx="160" cy="327" rx="82" ry="7" fill="#2D4A3E" opacity="0.08"/>
    </svg>
  );
}

function CardCup({ fill, dark }: { fill: number; dark?: boolean }) {
  const stroke = dark ? "#FAFAF7" : "#2D4A3E";
  const cupFill = dark ? "#2A2018" : "#FDFAF5";
  const liquidY = 30 + (1 - fill) * 52;
  return (
    <svg viewBox="0 0 100 110" width="64" height="70">
      <defs>
        <clipPath id={`card-clip-${fill}`}>
          <path d="M 22 30 L 78 30 L 74 86 Q 73 90 69 90 L 31 90 Q 27 90 26 86 Z"/>
        </clipPath>
      </defs>
      <path d="M 22 30 L 78 30 L 74 86 Q 73 90 69 90 L 31 90 Q 27 90 26 86 Z" fill={cupFill} stroke={stroke} strokeWidth="1.8"/>
      <g clipPath={`url(#card-clip-${fill})`}>
        <rect x="18" y={liquidY} width="64" height="90" fill={dark ? "#5C3A21" : "#3A2412"}/>
        <ellipse cx="50" cy={liquidY} rx="26" ry="2.5" fill={dark ? "#8B5A2B" : "#5C3A21"} opacity="0.7"/>
      </g>
      <ellipse cx="50" cy="30" rx="28" ry="2.8" fill="none" stroke={stroke} strokeWidth="1.8"/>
    </svg>
  );
}

function FocusCup() {
  return (
    <svg viewBox="0 0 320 360" width="200" height="225">
      <g opacity="0.35">
        <path d="M 125 82 Q 120 65 128 50" stroke="#6F4E37" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
        <path d="M 158 78 Q 153 60 161 45" stroke="#6F4E37" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
        <path d="M 191 82 Q 186 65 194 50" stroke="#6F4E37" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
      </g>
      <defs>
        <clipPath id="focus-clip">
          <path d="M 70 120 L 250 120 L 235 290 Q 233 305 218 305 L 102 305 Q 87 305 85 290 Z"/>
        </clipPath>
      </defs>
      <path d="M 248 155 Q 290 155 290 195 Q 290 235 248 235" stroke="#E8DFD0" strokeWidth="3.5" fill="none" strokeLinecap="round"/>
      <path d="M 70 120 L 250 120 L 235 290 Q 233 305 218 305 L 102 305 Q 87 305 85 290 Z" fill="#2A2218" stroke="#E8DFD0" strokeWidth="3.5"/>
      <g clipPath="url(#focus-clip)">
        <rect x="60" y="215" width="200" height="110" fill="#5C3A21"/>
        <ellipse cx="160" cy="215" rx="80" ry="6" fill="#8B5A2B" opacity="0.8"/>
      </g>
      <ellipse cx="160" cy="120" rx="90" ry="8" fill="none" stroke="#E8DFD0" strokeWidth="3.5"/>
    </svg>
  );
}

/* ─── Name entry modal ──────────────────────────────────────────── */

function NameModal({
  onSubmit,
  onClose,
}: {
  onSubmit: (name: string) => void;
  onClose: () => void;
}) {
  const [name, setName] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const t = name.trim();
    if (t) onSubmit(t);
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
      style={{
        position: "fixed", inset: 0, zIndex: 100,
        background: "rgba(45,74,62,0.45)",
        backdropFilter: "blur(6px)",
        display: "flex", alignItems: "center", justifyContent: "center",
        padding: 24,
      }}
    >
      <motion.div
        initial={{ scale: 0.94, y: 12, opacity: 0 }}
        animate={{ scale: 1, y: 0, opacity: 1 }}
        exit={{ scale: 0.96, y: 8, opacity: 0 }}
        transition={{ type: "spring", stiffness: 340, damping: 28 }}
        onClick={(e) => e.stopPropagation()}
        style={{
          background: "#F5EBD8",
          borderRadius: 24,
          padding: "40px 36px",
          width: "100%",
          maxWidth: 380,
          position: "relative",
        }}
      >
        <button
          onClick={onClose}
          style={{
            position: "absolute", top: 16, right: 16,
            background: "none", border: "none", cursor: "pointer",
            color: "#6F4E37", padding: 4,
          }}
        >
          <X size={16} />
        </button>

        <p style={{ fontSize: 11, letterSpacing: "0.2em", textTransform: "uppercase", color: "#6F4E37", marginBottom: 10 }}>
          Let's get started
        </p>
        <h2 style={{
          fontFamily: "'DM Serif Display', Georgia, serif",
          fontSize: 26, fontWeight: 400, color: "#2D4A3E",
          marginBottom: 24, lineHeight: 1.15,
        }}>
          What should we call you?
        </h2>

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <input
            autoFocus
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="your name"
            maxLength={32}
            style={{
              width: "100%",
              padding: "13px 16px",
              borderRadius: 12,
              border: "1.5px solid rgba(45,74,62,0.22)",
              background: "rgba(255,255,255,0.7)",
              fontSize: 15,
              color: "#2D4A3E",
              fontFamily: "inherit",
              outline: "none",
            }}
          />
          <button
            type="submit"
            disabled={!name.trim()}
            style={{
              padding: "13px 20px",
              borderRadius: 999,
              background: name.trim() ? "#2D4A3E" : "#D4A574",
              color: "#F5EBD8",
              fontSize: 14,
              fontWeight: 500,
              border: "none",
              cursor: name.trim() ? "pointer" : "default",
              transition: "background 0.2s",
              fontFamily: "inherit",
            }}
          >
            Brew my first cup →
          </button>
        </form>
      </motion.div>
    </motion.div>
  );
}

/* ─── Page ──────────────────────────────────────────────────────── */

const S: Record<string, React.CSSProperties> = {
  // typography
  label:  { fontSize: 11, letterSpacing: "0.22em", textTransform: "uppercase" as const, color: "#6F4E37" },
  h1:     { fontFamily: "'DM Serif Display', Georgia, serif", fontSize: "clamp(34px,5vw,46px)", fontWeight: 400, color: "#2D4A3E", lineHeight: 1.06, letterSpacing: "-0.02em", margin: 0 },
  h2:     { fontFamily: "'DM Serif Display', Georgia, serif", fontSize: "clamp(22px,3vw,28px)", fontWeight: 400, color: "#2D4A3E", lineHeight: 1.15, margin: 0 },
  body:   { fontSize: 15, lineHeight: 1.65, color: "#5A4A38", margin: 0 },
  small:  { fontSize: 13, lineHeight: 1.6, color: "#5A4A38", margin: 0 },
  muted:  { fontSize: 12, color: "#6F4E37" },
  // buttons
  btnPrimary: {
    padding: "11px 22px", fontSize: 14, fontWeight: 500,
    background: "#2D4A3E", color: "#F5EBD8",
    border: "none", borderRadius: 999, cursor: "pointer",
    fontFamily: "inherit", letterSpacing: "0.01em",
    transition: "opacity 0.15s",
  },
  btnOutline: {
    padding: "11px 22px", fontSize: 14,
    background: "transparent", color: "#2D4A3E",
    border: "1.5px solid rgba(45,74,62,0.3)", borderRadius: 999,
    cursor: "pointer", fontFamily: "inherit",
    transition: "border-color 0.15s",
  },
};

export default function HomePage() {
  const [showModal, setShowModal] = useState(false);
  const username    = useTimerStore((s) => s.username);
  const setUsername = useTimerStore((s) => s.setUsername);
  const router      = useRouter();

  function handleBrewClick() {
    if (username) router.push("/timer");
    else setShowModal(true);
  }

  function handleNameSubmit(name: string) {
    setUsername(name);
    router.push("/timer");
  }

  return (
    <div style={{ background: "#FAFAF7", minHeight: "100dvh", fontFamily: "'Inter', system-ui, sans-serif", color: "#2D4A3E" }}>

      {/* ── Nav ───────────────────────────────────────────────── */}
      <nav style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "18px 32px", borderBottom: "0.5px solid rgba(45,74,62,0.1)",
        position: "sticky", top: 0, background: "#FAFAF7", zIndex: 50,
      }}>
        {/* Logo */}
        <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
          <svg viewBox="0 0 40 40" width="24" height="24" style={{ display: "block", flexShrink: 0 }}>
            <circle cx="20" cy="20" r="16" fill="none" stroke="#2D4A3E" strokeWidth="2"/>
            <path d="M 20 5 A 15 15 0 0 1 20 35" fill="#2D4A3E"/>
            <circle cx="20" cy="13" r="3" fill="#FAFAF7"/>
            <circle cx="20" cy="27" r="3" fill="#2D4A3E"/>
          </svg>
          <span style={{ fontSize: 15, fontWeight: 500, letterSpacing: "-0.01em" }}>
            <span style={{ color: "#2D4A3E" }}>Zen</span>
            <span style={{ color: "#D4A574" }}>Pomo</span>
          </span>
        </div>

        {/* Links — hidden on mobile */}
        <div style={{ display: "flex", gap: 28, fontSize: 13, color: "#5A4A38" }} className="hidden md:flex">
          <span style={{ cursor: "pointer" }}>Focus timer</span>
          <span style={{ cursor: "pointer" }}>Sessions</span>
          <span style={{ cursor: "pointer" }}>How it works</span>
        </div>

        {/* CTA */}
        <button onClick={handleBrewClick} style={S.btnPrimary}>
          Start brewing
        </button>
      </nav>

      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "0 32px" }}>

        {/* ── Hero ─────────────────────────────────────────────── */}
        <section style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 48, alignItems: "center", padding: "64px 0 72px" }} className="hero-grid">
          {/* Left */}
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            <p style={S.label}>A focus timer</p>
            <h1 style={S.h1}>
              Sip your way<br/>through deep work.
            </h1>
            <p style={{ ...S.body, maxWidth: 380 }}>
              Your session is a cup of coffee. As the minutes pass, the coffee level drops.
              No numbers shouting at you — just a quiet cup, slowly emptying.
            </p>
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 4 }}>
              <button onClick={handleBrewClick} style={S.btnPrimary}>
                Start a session
              </button>
              <button
                onClick={() => document.getElementById("how-it-works")?.scrollIntoView({ behavior: "smooth" })}
                style={S.btnOutline}
              >
                How it works
              </button>
            </div>
            <div style={{ display: "flex", gap: 24, paddingTop: 20, borderTop: "0.5px solid rgba(45,74,62,0.12)", flexWrap: "wrap" }}>
              <span style={S.muted}><strong style={{ color: "#2D4A3E", fontWeight: 500 }}>12,400+</strong> brews this week</span>
              <span style={S.muted}><strong style={{ color: "#2D4A3E", fontWeight: 500 }}>3.2M</strong> minutes focused</span>
            </div>
          </div>

          {/* Right — hero cup */}
          <div style={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
              style={{ width: "100%", maxWidth: 300 }}
            >
              <HeroCup />
            </motion.div>
          </div>
        </section>

        {/* ── Session cards ────────────────────────────────────── */}
        <section style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 16, paddingBottom: 56 }} className="cards-grid">
          {[
            { fill: 0.95, label: "Espresso",  duration: "15 minutes", desc: "A quick shot. For one email, one decision, one stuck idea.",      dark: false, preset: "espresso"   },
            { fill: 0.55, label: "Pour over", duration: "25 minutes", desc: "The classic. One pomodoro, one cup, one focused task.",           dark: true,  preset: "pour_over" },
            { fill: 0.2,  label: "Cold brew", duration: "90 minutes", desc: "A long, slow flow state. For writing, code, and thinking.",       dark: false, preset: "cold_brew"  },
          ].map(({ fill, label, duration, desc, dark, preset }) => (
            <motion.div
              key={label}
              whileHover={{ y: -3 }}
              transition={{ type: "spring", stiffness: 280, damping: 22 }}
              onClick={() => handleBrewClick()}
              style={{
                background: dark ? "#2D4A3E" : "#FFFFFF",
                borderRadius: 20,
                padding: "28px 24px",
                border: dark ? "none" : "0.5px solid rgba(45,74,62,0.1)",
                cursor: "pointer",
                boxShadow: dark ? "0 12px 40px rgba(45,74,62,0.18)" : "0 2px 12px rgba(45,74,62,0.06)",
              }}
            >
              <div style={{ display: "flex", justifyContent: "center", marginBottom: 20 }}>
                <CardCup fill={fill} dark={dark} />
              </div>
              <p style={{ ...S.label, textAlign: "center", marginBottom: 8, color: dark ? "#D4A574" : "#6F4E37" }}>
                {label}
              </p>
              <p style={{
                fontFamily: "'DM Serif Display', Georgia, serif",
                fontSize: 22, fontWeight: 400, textAlign: "center",
                color: dark ? "#F5EBD8" : "#2D4A3E",
                marginBottom: 8,
              }}>
                {duration}
              </p>
              <p style={{ ...S.small, textAlign: "center", color: dark ? "#D4A574" : "#5A4A38" }}>
                {desc}
              </p>
            </motion.div>
          ))}
        </section>

        {/* ── Focus mode preview ───────────────────────────────── */}
        <section style={{ marginBottom: 56 }}>
          <p style={{ ...S.label, marginBottom: 14 }}>Focus mode preview</p>
          <div style={{
            background: "#1A1A1A",
            borderRadius: 20,
            padding: "52px 24px 48px",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 32,
            minHeight: 360,
            justifyContent: "center",
            position: "relative",
            overflow: "hidden",
          }}>
            {/* Subtle vignette glow */}
            <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse 60% 50% at 50% 40%, rgba(92,58,33,0.18) 0%, transparent 70%)", pointerEvents: "none" }}/>

            <div style={{ position: "absolute", top: 18, left: 24, fontSize: 11, letterSpacing: "0.2em", textTransform: "uppercase" as const, color: "#4A3828" }}>
              pour over · in session
            </div>
            <div style={{ position: "absolute", top: 16, right: 24, fontSize: 11, color: "#4A3828", letterSpacing: "0.1em" }}>
              25:00
            </div>

            <FocusCup />

            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
              <div style={{ width: 44, height: 44, borderRadius: "50%", border: "1.5px solid rgba(232,223,208,0.25)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
                <span style={{ color: "#E8DFD0", fontSize: 14, marginLeft: 2 }}>▶</span>
              </div>
              <span style={{ fontSize: 10, letterSpacing: "0.2em", textTransform: "uppercase" as const, color: "#4A3828" }}>
                space to start
              </span>
            </div>
          </div>
          <p style={{ fontSize: 12, color: "#6F4E37", textAlign: "center", marginTop: 14, lineHeight: 1.7 }}>
            The cup fills the screen. No clock, no progress bar, no notifications.<br/>
            Just coffee, slowly going down.
          </p>
        </section>

        {/* ── How it works ─────────────────────────────────────── */}
        <section id="how-it-works" style={{ marginBottom: 56 }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 0 }} className="how-grid">
            {[
              { step: "01", verb: "Choose", title: "Pick your brew", body: "Espresso for sprints. Pour over for focused tasks. Cold brew for the long game." },
              { step: "02", verb: "Sip",    title: "Watch it drop",   body: "The coffee recedes. Steam fades. Your peripheral vision tells you where you are." },
              { step: "03", verb: "Empty",  title: "Take a break",    body: "Cup's empty. A soft chime, then refill. Track your daily brews over time." },
            ].map(({ step, verb, title, body }, i) => (
              <div
                key={step}
                style={{
                  padding: "28px 0",
                  borderLeft: i > 0 ? "0.5px solid rgba(45,74,62,0.1)" : "none",
                  paddingLeft: i > 0 ? 28 : 0,
                  paddingRight: i < 2 ? 28 : 0,
                }}
              >
                <p style={{ ...S.label, marginBottom: 10 }}>{step} · {verb}</p>
                <p style={{ fontSize: 14, fontWeight: 500, color: "#2D4A3E", marginBottom: 6 }}>{title}</p>
                <p style={S.small}>{body}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── CTA banner ───────────────────────────────────────── */}
        <section style={{ marginBottom: 64 }}>
          <div style={{
            background: "#E8F0EC",
            borderRadius: 20,
            padding: "36px 40px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 24,
            flexWrap: "wrap",
          }}>
            <div>
              <p style={{ ...S.h2, marginBottom: 8 }}>Your first cup is on us.</p>
              <p style={S.small}>Free forever. Start a session and get focusing in seconds.</p>
            </div>
            <button onClick={handleBrewClick} style={{ ...S.btnPrimary, padding: "13px 28px", fontSize: 14, whiteSpace: "nowrap" as const }}>
              Brew your first cup →
            </button>
          </div>
        </section>
      </div>

      {/* ── Mobile responsive overrides ──────────────────────── */}
      <style>{`
        @media (max-width: 700px) {
          .hero-grid  { grid-template-columns: 1fr !important; }
          .cards-grid { grid-template-columns: 1fr !important; }
          .how-grid   { grid-template-columns: 1fr !important; }
          .how-grid > div { border-left: none !important; padding-left: 0 !important; border-top: 0.5px solid rgba(45,74,62,0.1); padding-top: 24px !important; }
          .how-grid > div:first-child { border-top: none; padding-top: 28px !important; }
        }
      `}</style>

      {/* ── Name entry modal ─────────────────────────────────── */}
      <AnimatePresence>
        {showModal && (
          <NameModal
            onSubmit={handleNameSubmit}
            onClose={() => setShowModal(false)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
