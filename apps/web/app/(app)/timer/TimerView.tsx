"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { useTimer } from "@/lib/hooks/useTimer";
import { useTimerStore, formatTime } from "@zenpomo/core";
import type { FocusPreset, Soundscape, MusicTrack, LocalSession, CupStyle } from "@zenpomo/core";
import { CUP_STYLE_LABELS } from "@zenpomo/core";
import { CoffeeCup, CUP_CONFIGS } from "@/components/cup/CoffeeCup";
import { AmbientPlayer } from "@/components/audio/AmbientPlayer";
import { MusicPlayer } from "@/components/audio/MusicPlayer";
import { RotateCcw, Maximize2, Moon, Sun } from "lucide-react";

type Tab = "session" | "journal" | "settings";

// ─── Static config ────────────────────────────────────────────────────────────

const BREW_OPTIONS: { id: FocusPreset; name: string; mins: number }[] = [
  { id: "espresso",     name: "Espresso",     mins: 15 },
  { id: "pour_over",    name: "Pour over",    mins: 25 },
  { id: "french_press", name: "French press", mins: 45 },
  { id: "cold_brew",    name: "Cold brew",    mins: 90 },
];

const MUSIC_OPTIONS: { id: MusicTrack; label: string; desc: string }[] = [
  { id: "lofi",    label: "Lo-fi",   desc: "Chill hop beats" },
  { id: "ambient", label: "Ambient", desc: "Meditation & focus" },
  { id: "piano",   label: "Piano",   desc: "Orchestral piano" },
  { id: "jazz",    label: "Jazz",    desc: "Lounge jazz" },
  { id: "focus",   label: "Focus",   desc: "Cinematic focus" },
  { id: "groove",  label: "Groove",  desc: "Live ambient stream" },
  { id: "drone",   label: "Drone",   desc: "Atmospheric drone" },
];

const AMBIENCE_OPTIONS: { id: Soundscape; label: string; symbol: string }[] = [
  { id: "cafe",      label: "Café",     symbol: "♫" },
  { id: "rain",      label: "Rain",     symbol: "≋" },
  { id: "fireplace", label: "Fire",     symbol: "✦" },
  { id: "ocean",     label: "Ocean",    symbol: "〜" },
  { id: "forest",    label: "Forest",   symbol: "✿" },
  { id: "storm",     label: "Storm",    symbol: "⌁" },
  { id: "keyboard",  label: "Keys",     symbol: "⊹" },
  { id: "night",     label: "Night",    symbol: "◑" },
  { id: "none",      label: "Silent",   symbol: "○" },
];

// ─── Small helpers ────────────────────────────────────────────────────────────

function MiniCup({ filled, inProgress }: { filled: boolean; inProgress?: boolean }) {
  return (
    <svg width="14" height="16" viewBox="0 0 14 16" style={{ display: "block" }}>
      <path
        d="M 1 3 L 11 3 L 9.5 12 Q 9 14 7 14 L 5 14 Q 3 14 2.5 12 Z"
        fill={filled ? "var(--brew-accent)" : inProgress ? "rgba(196,168,130,0.3)" : "none"}
        stroke={filled ? "var(--brew-accent)" : "#DDD0C0"}
        strokeWidth="1"
        strokeDasharray={!filled && !inProgress ? "2 1.5" : "none"}
      />
      <path d="M 9.5 5 Q 13 5 13 8 Q 13 11 9.5 11" fill="none" stroke={filled ? "var(--brew-accent)" : "#DDD0C0"} strokeWidth="1" strokeLinecap="round" />
    </svg>
  );
}

function ZenPomoLogo() {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
      <svg viewBox="0 0 40 40" width="24" height="24" style={{ display: "block", flexShrink: 0 }}>
        <circle cx="20" cy="20" r="16" fill="none" stroke="var(--brew-text)" strokeWidth="2"/>
        <path d="M 20 5 A 15 15 0 0 1 20 35" fill="var(--brew-text)"/>
        <circle cx="20" cy="13" r="3" fill="var(--brew-bg)"/>
        <circle cx="20" cy="27" r="3" fill="var(--brew-text)"/>
      </svg>
      <span style={{ fontSize: 15, fontWeight: 500, letterSpacing: "-0.01em", lineHeight: 1 }}>
        <span style={{ color: "var(--brew-text)" }}>Zen</span>
        <span style={{ color: "var(--brew-accent)" }}>Pomo</span>
      </span>
    </div>
  );
}

function PanelLabel({ children }: { children: string }) {
  return (
    <p style={{ fontSize: 9, letterSpacing: "0.14em", textTransform: "uppercase", color: "var(--brew-text-3)", marginBottom: 12, fontWeight: 500 }}>
      {children}
    </p>
  );
}

// ─── Journal panel ────────────────────────────────────────────────────────────

function StatCard({ value, label }: { value: string | number; label: string }) {
  return (
    <div style={{ flex: 1, padding: "16px 14px", background: "var(--brew-surface)", border: "1px solid var(--brew-border)", borderRadius: 12 }}>
      <p style={{ fontFamily: "'DM Serif Display', Georgia, serif", fontSize: 28, color: "var(--brew-text)", lineHeight: 1 }}>{value}</p>
      <p style={{ fontSize: 10, color: "var(--brew-text-3)", marginTop: 5, letterSpacing: "0.05em" }}>{label}</p>
    </div>
  );
}

function JournalPanel({ sessions }: { sessions: LocalSession[] }) {
  const today     = new Date().toDateString();
  const yesterday = new Date(Date.now() - 86400000).toDateString();

  const todaySessions = sessions.filter(s => new Date(s.completedAt).toDateString() === today);
  const todayMins     = Math.round(todaySessions.reduce((sum, s) => sum + s.durationSeconds, 0) / 60);
  const allTimeMins   = Math.round(sessions.reduce((sum, s) => sum + s.durationSeconds, 0) / 60);

  type Group = { label: string; items: LocalSession[]; totalMins: number };
  const groups: Group[]          = [];
  const seen: Record<string, number> = {};

  for (const s of [...sessions].reverse()) {
    const key = new Date(s.completedAt).toDateString();
    if (seen[key] === undefined) {
      seen[key] = groups.length;
      const label = key === today ? "Today"
        : key === yesterday ? "Yesterday"
        : new Date(s.completedAt).toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric" });
      groups.push({ label, items: [], totalMins: 0 });
    }
    const g = groups[seen[key]];
    g.items.push(s);
    g.totalMins += Math.round(s.durationSeconds / 60);
  }

  if (sessions.length === 0) {
    return (
      <div style={{ textAlign: "center", paddingTop: 80, maxWidth: 400, margin: "0 auto" }}>
        <p style={{ fontFamily: "'DM Serif Display', Georgia, serif", fontSize: 36, fontStyle: "italic", color: "var(--brew-text)", lineHeight: 1 }}>
          no sessions yet
        </p>
        <p style={{ fontSize: 13, color: "var(--brew-text-3)", marginTop: 10 }}>
          start your first brew to track your journey
        </p>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 540, margin: "0 auto", padding: "40px 24px 60px" }}>
      <p style={{ fontFamily: "'DM Serif Display', Georgia, serif", fontSize: 38, fontStyle: "italic", color: "var(--brew-text)", lineHeight: 1 }}>
        your journey
      </p>
      <p style={{ fontSize: 12, color: "var(--brew-text-3)", marginTop: 6, marginBottom: 36 }}>focus sessions & time</p>

      <div style={{ display: "flex", gap: 12, marginBottom: 44 }}>
        <StatCard value={todaySessions.length} label="today's brews" />
        <StatCard value={`${todayMins}m`} label="focused today" />
        <StatCard value={`${allTimeMins}m`} label="all time" />
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>
        {groups.map((g) => (
          <div key={g.label}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 8 }}>
              <span style={{ fontSize: 10, letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--brew-text-3)" }}>{g.label}</span>
              <span style={{ fontSize: 11, color: "var(--brew-accent)" }}>{g.totalMins} min · {g.items.length} {g.items.length === 1 ? "brew" : "brews"}</span>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
              {g.items.map((s, i) => (
                <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 14px", background: "var(--brew-surface)", borderRadius: 10, border: "1px solid var(--brew-border)" }}>
                  <span style={{ fontSize: 12, color: "var(--brew-text-2)" }}>
                    {new Date(s.completedAt).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true })}
                  </span>
                  <span style={{ fontSize: 12, color: "var(--brew-text)", fontWeight: 500 }}>
                    {Math.round(s.durationSeconds / 60)} min
                  </span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Settings panel ───────────────────────────────────────────────────────────

function SettingsPanel({
  username, setUsername, sessions, clearSessions,
  presetDurations, setPresetDuration,
  cupStyle, setCupStyle,
}: {
  username: string;
  setUsername: (n: string) => void;
  sessions: LocalSession[];
  clearSessions: () => void;
  presetDurations: Record<FocusPreset, number>;
  setPresetDuration: (preset: FocusPreset, seconds: number) => void;
  cupStyle: CupStyle;
  setCupStyle: (s: CupStyle) => void;
}) {
  const router          = useRouter();
  const [name, setName] = useState(username);
  const [saved, setSaved]           = useState(false);
  const [confirmClear, setConfirm]  = useState(false);

  function save() {
    const t = name.trim();
    if (!t) return;
    setUsername(t);
    setSaved(true);
    setTimeout(() => setSaved(false), 2200);
  }

  function handleClear() {
    if (!confirmClear) { setConfirm(true); return; }
    clearSessions();
    setConfirm(false);
  }

  const field: React.CSSProperties = {
    width: "100%",
    border: "1px solid var(--brew-border)",
    borderRadius: 10,
    padding: "11px 14px",
    fontSize: 13,
    color: "var(--brew-text)",
    background: "var(--brew-surface)",
    outline: "none",
    fontFamily: "Inter, system-ui, sans-serif",
  };

  const sectionTitle: React.CSSProperties = {
    fontSize: 10,
    letterSpacing: "0.12em",
    textTransform: "uppercase",
    color: "var(--brew-text-3)",
    marginBottom: 12,
    fontWeight: 500,
  };

  return (
    <div style={{ maxWidth: 420, margin: "0 auto", padding: "40px 24px 60px" }}>
      <p style={{ fontFamily: "'DM Serif Display', Georgia, serif", fontSize: 38, fontStyle: "italic", color: "var(--brew-text)", lineHeight: 1 }}>
        settings
      </p>
      <p style={{ fontSize: 12, color: "var(--brew-text-3)", marginTop: 6, marginBottom: 40 }}>your ritual, your way</p>

      {/* Name */}
      <section style={{ marginBottom: 32 }}>
        <p style={sectionTitle}>Display name</p>
        <div style={{ display: "flex", gap: 10 }}>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && save()}
            maxLength={32}
            placeholder="Your name"
            style={{ ...field, flex: 1 }}
            onFocus={(e) => { e.target.style.borderColor = "var(--brew-accent)"; }}
            onBlur={(e)  => { e.target.style.borderColor = "var(--brew-border)"; }}
          />
          <button
            onClick={save}
            disabled={!name.trim()}
            style={{
              padding: "0 20px",
              borderRadius: 10,
              border: "none",
              background: "var(--brew-cta)",
              color: "var(--brew-cta-fg)",
              fontSize: 12,
              fontWeight: 500,
              cursor: name.trim() ? "pointer" : "default",
              opacity: name.trim() ? 1 : 0.4,
              whiteSpace: "nowrap",
              transition: "opacity 0.15s",
            }}
          >
            {saved ? "✓ Saved" : "Save"}
          </button>
        </div>
      </section>

      {/* Cup style */}
      <section style={{ marginBottom: 32 }}>
        <p style={sectionTitle}>Cup style</p>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8 }}>
          {(Object.keys(CUP_STYLE_LABELS) as CupStyle[]).map((id) => {
            const cfg = CUP_CONFIGS[id];
            const active = cupStyle === id;
            return (
              <button
                key={id}
                onClick={() => setCupStyle(id)}
                style={{
                  display: "flex", flexDirection: "column", alignItems: "center",
                  padding: "10px 6px 8px",
                  border: `1.5px solid ${active ? "var(--brew-accent)" : "var(--brew-border)"}`,
                  background: active ? "rgba(196,168,130,0.1)" : "var(--brew-surface)",
                  borderRadius: 10, cursor: "pointer",
                  transition: "all 0.15s",
                }}
              >
                <svg viewBox="0 0 360 400" width="66" height="74" style={{ display: "block", overflow: "visible" }}>
                  <defs>
                    <clipPath id={`preview-clip-${id}`}>
                      {cfg.isCircle
                        ? <circle cx={cfg.circleCX} cy={cfg.circleCY} r={cfg.circleR} />
                        : <path d={cfg.clipPathD} transform={cfg.svgTransform} />
                      }
                    </clipPath>
                  </defs>

                  {/* Saucer behind */}
                  {cfg.saucer && <ellipse cx={cfg.saucer.cx} cy={cfg.saucer.cy} rx={cfg.saucer.rx} ry={cfg.saucer.ry} fill="#F5EDE0" stroke="var(--brew-accent-2)" strokeWidth="5" />}

                  {/* Handle fill (non-transform cups only) */}
                  {cfg.handleFillD && <path d={cfg.handleFillD} fill="#F5EDE0" />}

                  {/* Body fill */}
                  {cfg.isCircle
                    ? <circle cx={cfg.circleCX} cy={cfg.circleCY} r={(cfg.circleR ?? 110) + 2} fill="#F5EDE0" />
                    : <path d={cfg.bodyD} fill="#F5EDE0" fillRule={cfg.bodyFillRule} transform={cfg.svgTransform} />
                  }

                  {/* Liquid fill — clipped */}
                  <g clipPath={`url(#preview-clip-${id})`}>
                    <rect
                      x={cfg.cupLeftTop - 8}
                      y={cfg.liquidTopFull + (cfg.liquidBottom - cfg.liquidTopFull) * 0.35}
                      width={cfg.cupRightTop - cfg.cupLeftTop + 16}
                      height={(cfg.liquidBottom - cfg.liquidTopFull) * 0.65}
                      fill="rgba(192,138,90,0.45)"
                    />
                  </g>

                  {/* Outline on top */}
                  {cfg.isCircle
                    ? <circle cx={cfg.circleCX} cy={cfg.circleCY} r={(cfg.circleR ?? 110) + 2} fill="none" stroke="var(--brew-accent-2)" strokeWidth="6" />
                    : <path d={cfg.bodyD} fill="none" stroke="var(--brew-accent-2)"
                        strokeWidth={cfg.svgScale ? 6 / cfg.svgScale : 6}
                        fillRule={cfg.bodyFillRule} transform={cfg.svgTransform}
                      />
                  }
                  {cfg.handleStrokeD && <path d={cfg.handleStrokeD} fill="none" stroke="var(--brew-accent-2)" strokeWidth="6" strokeLinecap="round" />}
                  {cfg.hasLid && cfg.lidD && <path d={cfg.lidD} fill="#F5EDE0" stroke="var(--brew-accent-2)" strokeWidth="5" />}
                </svg>
                <span style={{
                  fontSize: 10, marginTop: 5, fontWeight: active ? 600 : 400,
                  color: active ? "var(--brew-text)" : "var(--brew-text-2)",
                }}>
                  {CUP_STYLE_LABELS[id]}
                </span>
              </button>
            );
          })}
        </div>
      </section>

      {/* Brew durations */}
      <section style={{ marginBottom: 32 }}>
        <p style={sectionTitle}>Brew durations</p>
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          {BREW_OPTIONS.map((opt) => {
            const currentMins = Math.round(presetDurations[opt.id] / 60);
            return (
              <div key={opt.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 14px", background: "var(--brew-surface)", borderRadius: 10, border: "1px solid var(--brew-border)" }}>
                <span style={{ fontSize: 12, color: "var(--brew-text)", fontWeight: 500 }}>{opt.name}</span>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <button
                    onClick={() => {
                      const next = Math.max(5, currentMins - 5);
                      setPresetDuration(opt.id, next * 60);
                    }}
                    style={{ width: 26, height: 26, borderRadius: 6, border: "1px solid var(--brew-border)", background: "var(--brew-bg)", color: "var(--brew-text-2)", fontSize: 15, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", lineHeight: 1 }}
                  >−</button>
                  <span style={{ fontSize: 12, color: "var(--brew-text)", minWidth: 44, textAlign: "center", fontVariantNumeric: "tabular-nums" }}>
                    {currentMins} min
                  </span>
                  <button
                    onClick={() => {
                      const next = Math.min(180, currentMins + 5);
                      setPresetDuration(opt.id, next * 60);
                    }}
                    style={{ width: 26, height: 26, borderRadius: 6, border: "1px solid var(--brew-border)", background: "var(--brew-bg)", color: "var(--brew-text-2)", fontSize: 15, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", lineHeight: 1 }}
                  >+</button>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Shortcuts */}
      <section style={{ marginBottom: 32 }}>
        <p style={sectionTitle}>Keyboard shortcuts</p>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {[["Space", "Start / Pause"], ["R", "Reset timer"]].map(([k, d]) => (
            <div key={k} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 14px", background: "var(--brew-surface)", borderRadius: 10, border: "1px solid var(--brew-border)" }}>
              <span style={{ fontSize: 12, color: "var(--brew-text-2)" }}>{d}</span>
              <kbd style={{ fontSize: 10, fontFamily: "monospace", background: "var(--brew-bg)", border: "1px solid var(--brew-border)", borderRadius: 6, padding: "2px 8px", color: "var(--brew-text)", boxShadow: "0 1px 0 var(--brew-border)" }}>{k}</kbd>
            </div>
          ))}
        </div>
      </section>

      {/* History */}
      <section style={{ marginBottom: 40 }}>
        <p style={sectionTitle}>Session history</p>
        <div style={{ padding: "14px 14px", background: "var(--brew-surface)", borderRadius: 10, border: "1px solid var(--brew-border)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={{ fontSize: 12, color: "var(--brew-text-2)" }}>{sessions.length} session{sessions.length !== 1 ? "s" : ""} recorded</span>
          <button
            onClick={handleClear}
            style={{
              fontSize: 11,
              border: "none",
              background: "none",
              cursor: "pointer",
              color: confirmClear ? "#D9534F" : "var(--brew-text-3)",
              fontWeight: confirmClear ? 600 : 400,
              padding: "4px 8px",
              borderRadius: 6,
              transition: "color 0.15s",
            }}
          >
            {confirmClear ? "Confirm — delete all" : "Clear history"}
          </button>
        </div>
        {confirmClear && (
          <button onClick={() => setConfirm(false)} style={{ marginTop: 6, fontSize: 11, color: "var(--brew-text-3)", background: "none", border: "none", cursor: "pointer" }}>
            Cancel
          </button>
        )}
      </section>

      {/* Change user */}
      <button
        onClick={() => { setUsername(""); router.push("/"); }}
        style={{ fontSize: 12, color: "var(--brew-text-3)", background: "none", border: "none", cursor: "pointer", letterSpacing: "0.02em", textDecoration: "underline", textUnderlineOffset: 3 }}
      >
        Sign out / change name
      </button>
    </div>
  );
}

// ─── Main view ────────────────────────────────────────────────────────────────

export function TimerView() {
  const timer  = useTimer();
  const router = useRouter();
  const store  = useTimerStore();

  const {
    preset, setPreset,
    presetDurations, setPresetDuration,
    status, markRefillComplete,
    soundscape, setSoundscape, soundVolume, setSoundVolume,
    music, setMusic, musicVolume, setMusicVolume,
    intention, setIntention,
    username, setUsername,
    sessions, clearSessions,
    cupStyle, setCupStyle,
    darkMode, toggleDarkMode,
    secondsRemaining, totalDuration,
  } = store;

  useEffect(() => {
    document.documentElement.dataset.dark = darkMode ? "true" : "false";
  }, [darkMode]);

  const [activeTab,       setActiveTab]       = useState<Tab>("session");
  const [focusMode,       setFocusMode]       = useState(false);
  const [mobileDrawer,    setMobileDrawer]    = useState(false);

  const isRunning   = status === "running";
  const isCompleted = status === "completed";
  const isRefilling = status === "refilling";
  const isActive    = isRunning || status === "paused";
  const disabled    = isCompleted || isRefilling;

  const dismissTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => {
    if (isCompleted) {
      dismissTimer.current = setTimeout(() => { timer.reset(); setFocusMode(false); }, 4000);
    }
    return () => { if (dismissTimer.current) clearTimeout(dismissTimer.current); };
  }, [isCompleted]); // eslint-disable-line react-hooks/exhaustive-deps

  // Escape exits focus mode
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setFocusMode(false);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const totalMins    = Math.round(totalDuration / 60);
  const today        = new Date().toDateString();
  const todaySessions = sessions.filter(s => new Date(s.completedAt).toDateString() === today);
  const showSlots    = Math.max(4, todaySessions.length + 1);

  const statusLabel = isCompleted ? "done"
    : isRefilling ? "brewing…"
    : isRunning   ? "focusing"
    : status === "paused" ? "paused"
    : "ready";

  const statusColor = isRunning ? "#7DAB6B" : status === "paused" ? "var(--brew-accent)" : "#DDD0C0";

  const isSession = activeTab === "session";

  return (
    <>
      <style>{`
        :root {
          --brew-bg:      #FAFAF7;
          --brew-surface: #FFFFFF;
          --brew-border:  #E0DAD2;
          --brew-text:    #2D4A3E;
          --brew-text-2:  #5F7A6E;
          --brew-text-3:  #8A9E96;
          --brew-accent:  #D4A574;
          --brew-accent-2:#C4906A;
          --brew-cta:     #2D4A3E;
          --brew-cta-fg:  #F5EBD8;
          --brew-tint:    rgba(45,74,62,0.07);
          --brew-shadow:  rgba(45,74,62,0.18);
        }
        [data-dark="true"] {
          --brew-bg:      #1A1A1A;
          --brew-surface: #242424;
          --brew-border:  #2E2E2E;
          --brew-text:    #F5EBD8;
          --brew-text-2:  #B0A090;
          --brew-text-3:  #907060;
          --brew-accent:  #D4A574;
          --brew-accent-2:#8A6040;
          --brew-cta:     #D4A574;
          --brew-cta-fg:  #1A1A1A;
          --brew-tint:    rgba(245,235,216,0.08);
          --brew-shadow:  rgba(0,0,0,0.5);
        }
        .timer-root {
          position: fixed;
          inset: 0;
          z-index: 50;
          background: var(--brew-bg);
          display: grid;
          grid-template-rows: 56px 1fr;
          overflow: hidden;
        }
        .timer-body {
          display: grid;
          overflow: hidden;
          transition: grid-template-columns 0.25s ease;
        }
        .timer-body.session-tab {
          grid-template-columns: 220px 1fr 220px;
        }
        .timer-body.other-tab {
          grid-template-columns: 1fr;
        }
        .timer-left {
          padding: 28px 20px 24px;
          border-right: 1px solid var(--brew-border);
          overflow-y: auto;
          display: flex;
          flex-direction: column;
          gap: 28px;
        }
        .timer-center {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 24px 32px;
          overflow: hidden;
        }
        .timer-full {
          overflow-y: auto;
          display: flex;
          justify-content: center;
        }
        .timer-right {
          padding: 28px 20px 24px;
          border-left: 1px solid var(--brew-border);
          overflow-y: auto;
          display: flex;
          flex-direction: column;
          gap: 28px;
        }
        .mobile-drawer-trigger { display: none; }
        @media (max-width: 820px) {
          .timer-body.session-tab {
            grid-template-columns: 1fr;
            grid-template-rows: 1fr;
            overflow: hidden;
          }
          .timer-center {
            overflow: visible;
            justify-content: center;
            padding: 20px 24px 32px;
            min-height: 0;
          }
          .timer-left,
          .timer-right { display: none; }
          .mobile-drawer-trigger { display: flex; }
          .timer-root header { padding: 0 16px; }
          .header-cups { display: none !important; }
          .nav-tab { padding: 6px 12px !important; }
        }
        @media (max-width: 500px) {
          .timer-root header { padding: 0 12px; }
          .header-logo span { display: none; }
          .nav-tab { padding: 6px 8px !important; }
        }
      `}</style>

      <AmbientPlayer />
      <MusicPlayer />

      {/* ── Focus mode overlay ──────────────────────────────── */}
      <AnimatePresence>
        {focusMode && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.35, ease: "easeOut" }}
            style={{
              position: "fixed", inset: 0, zIndex: 200,
              background: "var(--brew-bg)",
              display: "flex", flexDirection: "column",
              alignItems: "center", justifyContent: "center",
              overflowY: "auto",
              padding: "60px 20px 32px",
            }}
          >
            {/* Exit button */}
            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.55 }}
              whileHover={{ opacity: 1 }}
              whileTap={{ scale: 0.92 }}
              onClick={() => setFocusMode(false)}
              style={{
                position: "absolute", top: 20, right: 20,
                background: "var(--brew-surface)", border: "1px solid var(--brew-border)",
                borderRadius: 999, cursor: "pointer",
                display: "flex", alignItems: "center", gap: 5,
                color: "var(--brew-text-2)", fontSize: 11, letterSpacing: "0.06em",
                padding: "6px 14px",
              }}
            >
              <span style={{ fontSize: 14, lineHeight: 1 }}>✕</span>
              <span>exit</span>
            </motion.button>

            {/* Ambient glow */}
            <div aria-hidden="true" style={{
              position: "absolute", top: "50%", left: "50%",
              transform: "translate(-50%, -60%)",
              width: "min(600px, 80vw)", height: "min(600px, 80vw)",
              borderRadius: "50%",
              background: "radial-gradient(circle, rgba(192,138,90,0.07) 0%, transparent 65%)",
              pointerEvents: "none",
            }} />

            {/* Status dot */}
            <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 12 }}>
              <motion.span
                animate={isRunning ? { scale: [1, 1.5, 1], opacity: [1, 0.4, 1] } : {}}
                transition={isRunning ? { duration: 2, repeat: Infinity } : {}}
                style={{ display: "inline-block", width: 8, height: 8, borderRadius: "50%", background: statusColor }}
              />
              <span style={{ fontSize: 10, letterSpacing: "0.16em", textTransform: "uppercase", color: "var(--brew-text-3)" }}>
                {statusLabel}
              </span>
            </div>

            {/* Cup — 2× size */}
            <motion.div
              initial={{ scale: 0.92, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.1, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
              style={{ width: "min(680px, 88vw, 56vh)", marginBottom: 16 }}
            >
              <CoffeeCup
                liquidLevel={timer.liquidLevel}
                status={status}
                isRefilling={isRefilling}
                onRefillComplete={markRefillComplete}
                cupStyle={cupStyle}
              />
            </motion.div>

            {/* Time */}
            <AnimatePresence mode="wait">
              <motion.div
                key={isCompleted ? "done" : "time"}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                style={{ textAlign: "center", marginBottom: 20 }}
              >
                {isCompleted ? (
                  <>
                    <p style={{ fontFamily: "'DM Serif Display', Georgia, serif", fontSize: "clamp(52px, 8vw, 80px)", fontStyle: "italic", color: "var(--brew-text)", lineHeight: 1 }}>
                      well done
                    </p>
                    <p style={{ fontSize: 13, color: "var(--brew-text-3)", marginTop: 12, letterSpacing: "0.06em" }}>take a breath</p>
                  </>
                ) : (
                  <>
                    <p style={{
                      fontFamily: "'DM Serif Display', Georgia, serif",
                      fontSize: "clamp(52px, 14vmin, 108px)",
                      fontWeight: 400, color: "var(--brew-text)",
                      letterSpacing: "-0.025em", lineHeight: 1,
                      fontVariantNumeric: "tabular-nums",
                    }}>
                      {formatTime(secondsRemaining)}
                    </p>
                    <p style={{ fontSize: 12, color: "var(--brew-text-3)", marginTop: 12, letterSpacing: "0.05em" }}>
                      of {totalMins} {totalMins === 1 ? "minute" : "minutes"}
                    </p>
                  </>
                )}
              </motion.div>
            </AnimatePresence>

            {/* Controls */}
            <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
              <motion.button
                whileHover={{ scale: 1.06 }} whileTap={{ scale: 0.92 }}
                onClick={timer.reset}
                disabled={isRefilling}
                aria-label="Reset"
                style={{
                  width: 44, height: 44, borderRadius: "50%",
                  border: "1.5px solid var(--brew-accent-2)", background: "var(--brew-surface)",
                  cursor: isRefilling ? "default" : "pointer",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  opacity: isRefilling ? 0.3 : 1,
                }}
              >
                <RotateCcw size={16} strokeWidth={1.8} color="var(--brew-text-2)" />
              </motion.button>

              <motion.button
                whileHover={!disabled ? { scale: 1.03 } : {}}
                whileTap={!disabled ? { scale: 0.96 } : {}}
                onClick={() => { isRunning ? timer.pause() : timer.start(); }}
                disabled={disabled}
                aria-label={isRunning ? "Pause" : "Resume"}
                style={{
                  padding: "0 44px", height: 52, borderRadius: 999,
                  background: disabled ? "var(--brew-accent)" : "var(--brew-cta)",
                  border: "none", color: "var(--brew-cta-fg)", fontSize: 14, fontWeight: 500,
                  cursor: disabled ? "default" : "pointer", letterSpacing: "0.03em",
                  minWidth: 150,
                  boxShadow: disabled ? "none" : "0 6px 24px var(--brew-shadow)",
                  transition: "all 0.2s ease",
                }}
              >
                <motion.span key={isRunning ? "p" : "s"} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.1 }}>
                  {isCompleted ? "✓" : isRunning ? "Pause" : "Resume"}
                </motion.span>
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Mobile bottom sheet drawer ──────────────────────── */}
      <AnimatePresence>
        {mobileDrawer && (
          <>
            {/* Backdrop */}
            <motion.div
              key="drawer-backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => setMobileDrawer(false)}
              style={{
                position: "fixed", inset: 0, zIndex: 120,
                background: "rgba(0,0,0,0.32)",
              }}
            />

            {/* Sheet */}
            <motion.div
              key="drawer-sheet"
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 32, stiffness: 300 }}
              style={{
                position: "fixed", bottom: 0, left: 0, right: 0, zIndex: 130,
                background: "var(--brew-surface)",
                borderTopLeftRadius: 24, borderTopRightRadius: 24,
                border: "1px solid var(--brew-border)",
                borderBottom: "none",
                maxHeight: "84vh",
                overflowY: "auto",
                WebkitOverflowScrolling: "touch" as React.CSSProperties["WebkitOverflowScrolling"],
              }}
            >
              {/* Handle */}
              <div style={{ display: "flex", justifyContent: "center", padding: "14px 0 4px" }}>
                <div style={{ width: 36, height: 4, borderRadius: 2, background: "var(--brew-border)" }} />
              </div>

              <div style={{ padding: "12px 20px 52px" }}>

                {/* Brew */}
                <div style={{ marginBottom: 28 }}>
                  <PanelLabel>Brew</PanelLabel>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                    {BREW_OPTIONS.map((opt) => {
                      const active = preset === opt.id;
                      const liveMins = Math.round(presetDurations[opt.id] / 60);
                      return (
                        <button
                          key={opt.id}
                          onClick={() => !isActive && !isRefilling && setPreset(opt.id)}
                          style={{
                            display: "flex", alignItems: "center", justifyContent: "space-between",
                            padding: "11px 14px", borderRadius: 12,
                            border: `1.5px solid ${active ? "var(--brew-text)" : "var(--brew-border)"}`,
                            background: active ? "var(--brew-tint)" : "var(--brew-bg)",
                            cursor: isActive && !active ? "default" : "pointer",
                            opacity: isActive && !active ? 0.4 : 1,
                            transition: "all 0.15s ease",
                          }}
                        >
                          <span style={{ fontSize: 13, color: active ? "var(--brew-text)" : "var(--brew-text-2)", fontWeight: active ? 500 : 400 }}>{opt.name}</span>
                          <span style={{ fontSize: 11, color: "var(--brew-accent)" }}>{liveMins}m</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Intention */}
                <div style={{ marginBottom: 28 }}>
                  <PanelLabel>Intention</PanelLabel>
                  <textarea
                    value={intention}
                    onChange={(e) => setIntention(e.target.value)}
                    placeholder="What are you focusing on?"
                    rows={3}
                    style={{
                      width: "100%", resize: "none",
                      border: "1px solid var(--brew-border)", borderRadius: 10,
                      padding: "11px 14px", fontSize: 14,
                      color: "var(--brew-text)", background: "var(--brew-bg)", outline: "none",
                      fontFamily: "Inter, system-ui, sans-serif", lineHeight: 1.6,
                    }}
                    onFocus={(e) => { e.target.style.borderColor = "var(--brew-accent)"; }}
                    onBlur={(e)  => { e.target.style.borderColor = "var(--brew-border)"; }}
                  />
                </div>

                {/* Music */}
                <div style={{ marginBottom: 28 }}>
                  <PanelLabel>Music</PanelLabel>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                    {MUSIC_OPTIONS.map((opt) => {
                      const active = music === opt.id;
                      return (
                        <button
                          key={opt.id}
                          onClick={() => setMusic(active ? "none" : opt.id)}
                          title={opt.desc}
                          style={{
                            padding: "6px 16px", borderRadius: 999,
                            border: active ? "none" : "1px solid var(--brew-border)",
                            background: active ? "var(--brew-cta)" : "var(--brew-bg)",
                            color: active ? "var(--brew-cta-fg)" : "var(--brew-text-2)",
                            fontSize: 12, fontWeight: active ? 500 : 400,
                            cursor: "pointer", letterSpacing: "0.02em",
                            transition: "all 0.18s ease",
                          }}
                        >
                          {opt.label}
                        </button>
                      );
                    })}
                  </div>
                  {music !== "none" && (
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 12, padding: "0 2px" }}>
                      <span style={{ fontSize: 9, color: "var(--brew-accent)", letterSpacing: "0.08em", textTransform: "uppercase", flexShrink: 0 }}>vol</span>
                      <input type="range" min={0} max={1} step={0.05} value={musicVolume}
                        onChange={(e) => setMusicVolume(Number(e.target.value))}
                        style={{ flex: 1, accentColor: "var(--brew-accent)", cursor: "pointer" }}
                      />
                      <span style={{ fontSize: 10, color: "var(--brew-text-3)", width: 28, textAlign: "right", fontVariantNumeric: "tabular-nums" }}>
                        {Math.round(musicVolume * 100)}
                      </span>
                    </div>
                  )}
                </div>

                {/* Ambience */}
                <div style={{ marginBottom: 28 }}>
                  <PanelLabel>Ambience</PanelLabel>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8 }}>
                    {AMBIENCE_OPTIONS.map((opt) => {
                      const active = soundscape === opt.id;
                      return (
                        <button
                          key={opt.id}
                          onClick={() => setSoundscape(active && opt.id !== "none" ? "none" : opt.id)}
                          style={{
                            display: "flex", flexDirection: "column",
                            alignItems: "center", justifyContent: "center",
                            gap: 5, padding: "13px 4px", borderRadius: 12,
                            border: active ? "none" : "1px solid var(--brew-border)",
                            background: active ? "var(--brew-cta)" : "var(--brew-bg)",
                            cursor: "pointer", transition: "all 0.2s ease",
                          }}
                        >
                          <span style={{ fontSize: 18, lineHeight: 1, color: active ? "var(--brew-cta-fg)" : "var(--brew-accent)" }}>{opt.symbol}</span>
                          <span style={{ fontSize: 10, color: active ? "var(--brew-cta-fg)" : "var(--brew-text-3)", fontWeight: active ? 500 : 400 }}>{opt.label}</span>
                        </button>
                      );
                    })}
                  </div>
                  {soundscape !== "none" && (
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 12, padding: "0 2px" }}>
                      <span style={{ fontSize: 9, color: "var(--brew-accent)", letterSpacing: "0.08em", textTransform: "uppercase", flexShrink: 0 }}>vol</span>
                      <input type="range" min={0} max={1} step={0.05} value={soundVolume}
                        onChange={(e) => setSoundVolume(Number(e.target.value))}
                        style={{ flex: 1, accentColor: "var(--brew-accent)", cursor: "pointer" }}
                      />
                      <span style={{ fontSize: 10, color: "var(--brew-text-3)", width: 28, textAlign: "right", fontVariantNumeric: "tabular-nums" }}>
                        {Math.round(soundVolume * 100)}
                      </span>
                    </div>
                  )}
                </div>

                {/* Today's brews */}
                <div>
                  <PanelLabel>Today's brews</PanelLabel>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 8, alignItems: "center" }}>
                    {Array.from({ length: showSlots }).map((_, i) => (
                      <MiniCup key={i} filled={i < todaySessions.length} inProgress={i === todaySessions.length && isRunning} />
                    ))}
                    {todaySessions.length > 0 && (
                      <span style={{ fontSize: 11, color: "var(--brew-text-3)", marginLeft: 2 }}>{todaySessions.length} done</span>
                    )}
                  </div>
                </div>

              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <div className="timer-root">
        {/* ── Header ──────────────────────────────────────────── */}
        <header style={{ gridColumn: "1 / -1", display: "flex", alignItems: "center", padding: "0 24px", borderBottom: "1px solid var(--brew-border)", gap: 8 }}>
          {/* Logo — icon always, wordmark hidden on small screens */}
          <div className="header-logo" style={{ flexShrink: 0 }}>
            <ZenPomoLogo />
          </div>

          <div style={{ flex: 1, display: "flex", justifyContent: "center", gap: 2 }}>
            {(["session", "journal", "settings"] as Tab[]).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className="nav-tab"
                style={{
                  padding: "6px 16px",
                  borderRadius: 999,
                  border: "none",
                  background: activeTab === tab ? "var(--brew-surface)" : "transparent",
                  color: activeTab === tab ? "var(--brew-text)" : "var(--brew-text-3)",
                  fontSize: 12,
                  fontWeight: activeTab === tab ? 500 : 400,
                  cursor: "pointer",
                  boxShadow: activeTab === tab ? "0 1px 4px var(--brew-shadow)" : "none",
                  transition: "all 0.15s ease",
                  textTransform: "capitalize",
                  whiteSpace: "nowrap",
                }}
              >
                {tab}
              </button>
            ))}
          </div>

          <div style={{ flexShrink: 0, display: "flex", alignItems: "center", gap: 8 }}>
            <motion.button
              onClick={toggleDarkMode}
              whileTap={{ scale: 0.88 }}
              aria-label={darkMode ? "Switch to light mode" : "Switch to dark mode"}
              style={{
                width: 28, height: 28, borderRadius: "50%",
                border: "1px solid var(--brew-border)",
                background: "var(--brew-surface)",
                cursor: "pointer", flexShrink: 0,
                display: "flex", alignItems: "center", justifyContent: "center",
                transition: "border-color 0.2s",
              }}
            >
              {darkMode
                ? <Sun size={13} strokeWidth={1.8} color="var(--brew-accent)" />
                : <Moon size={13} strokeWidth={1.8} color="var(--brew-text-3)" />
              }
            </motion.button>
            <span className="header-cups" style={{ display: "flex", gap: 6, alignItems: "center" }}>
              {todaySessions.slice(-3).map((_, i) => <MiniCup key={i} filled />)}
            </span>
          </div>
        </header>

        {/* ── Body ────────────────────────────────────────────── */}
        <div className={`timer-body ${isSession ? "session-tab" : "other-tab"}`}>

          {/* Left panel — session only */}
          {isSession && (
            <aside className="timer-left">
              <div>
                <PanelLabel>Brew</PanelLabel>
                <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                  {BREW_OPTIONS.map((opt) => {
                    const active = preset === opt.id;
                    const liveMins = Math.round(presetDurations[opt.id] / 60);
                    return (
                      <button
                        key={opt.id}
                        onClick={() => !isActive && !isRefilling && setPreset(opt.id)}
                        style={{
                          display: "flex", alignItems: "center", gap: 10,
                          padding: "9px 10px", borderRadius: 10,
                          border: "none",
                          background: active ? "var(--brew-tint)" : "transparent",
                          cursor: isActive && !active ? "default" : "pointer",
                          opacity: isActive && !active ? 0.4 : 1,
                          width: "100%", textAlign: "left",
                          transition: "all 0.15s ease",
                        }}
                      >
                        <span style={{
                          width: 14, height: 14, borderRadius: "50%",
                          border: `1.5px solid ${active ? "var(--brew-text)" : "var(--brew-accent)"}`,
                          background: active ? "var(--brew-text)" : "transparent",
                          flexShrink: 0, transition: "all 0.15s ease",
                        }} />
                        <span style={{ flex: 1, fontSize: 12, color: active ? "var(--brew-text)" : "var(--brew-text-2)", fontWeight: active ? 500 : 400 }}>
                          {opt.name}
                        </span>
                        <span style={{ fontSize: 10, color: "var(--brew-accent)" }}>{liveMins}m</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div style={{ flex: 1 }}>
                <PanelLabel>Intention</PanelLabel>
                <textarea
                  value={intention}
                  onChange={(e) => setIntention(e.target.value)}
                  placeholder="What are you focusing on?"
                  rows={4}
                  style={{
                    width: "100%", resize: "none",
                    border: "1px solid var(--brew-border)", borderRadius: 10,
                    padding: "10px 12px", fontSize: 12,
                    color: "var(--brew-text)", background: "var(--brew-surface)", outline: "none",
                    fontFamily: "Inter, system-ui, sans-serif", lineHeight: 1.6,
                    transition: "border-color 0.15s ease",
                  }}
                  onFocus={(e) => { e.target.style.borderColor = "var(--brew-accent)"; }}
                  onBlur={(e)  => { e.target.style.borderColor = "var(--brew-border)"; }}
                />
              </div>
            </aside>
          )}

          {/* Center / full-width panel */}
          {isSession ? (
            <main className="timer-center">
              {/* Status dot */}
              <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 20 }}>
                <motion.span
                  animate={isRunning ? { scale: [1, 1.5, 1], opacity: [1, 0.4, 1] } : {}}
                  transition={isRunning ? { duration: 2, repeat: Infinity } : {}}
                  style={{ display: "inline-block", width: 7, height: 7, borderRadius: "50%", background: statusColor }}
                />
                <span style={{ fontSize: 9, letterSpacing: "0.14em", textTransform: "uppercase", color: "var(--brew-text-3)" }}>
                  {statusLabel}
                </span>
              </div>

              {/* Cup */}
              <div style={{ width: "min(390px, 88vw, 44dvh)", marginBottom: 28, alignSelf: "center" }}>
                <CoffeeCup
                  liquidLevel={timer.liquidLevel}
                  status={status}
                  isRefilling={isRefilling}
                  onRefillComplete={markRefillComplete}
                  cupStyle={cupStyle}
                />
              </div>

              {/* Time */}
              <AnimatePresence mode="wait">
                <motion.div
                  key={isCompleted ? "done" : "time"}
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -5 }}
                  style={{ textAlign: "center", marginBottom: 26 }}
                >
                  {isCompleted ? (
                    <>
                      <p style={{ fontFamily: "'DM Serif Display', Georgia, serif", fontSize: 40, fontStyle: "italic", color: "var(--brew-text)", lineHeight: 1 }}>
                        well done
                      </p>
                      <p style={{ fontSize: 11, color: "var(--brew-text-3)", marginTop: 8, letterSpacing: "0.06em" }}>take a breath</p>
                    </>
                  ) : (
                    <>
                      <p style={{
                        fontFamily: "'DM Serif Display', Georgia, serif",
                        fontSize: "clamp(48px, 7vw, 72px)",
                        fontWeight: 400, color: "var(--brew-text)",
                        letterSpacing: "-0.02em", lineHeight: 1,
                        fontVariantNumeric: "tabular-nums",
                      }}>
                        {formatTime(secondsRemaining)}
                      </p>
                      <p style={{ fontSize: 11, color: "var(--brew-text-3)", marginTop: 10, letterSpacing: "0.04em" }}>
                        of {totalMins} {totalMins === 1 ? "minute" : "minutes"}
                      </p>
                    </>
                  )}
                </motion.div>
              </AnimatePresence>

              {/* Controls */}
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <motion.button
                  whileHover={{ scale: 1.06 }} whileTap={{ scale: 0.92 }}
                  onClick={timer.reset}
                  disabled={isRefilling}
                  aria-label="Reset"
                  style={{
                    width: 40, height: 40, borderRadius: "50%",
                    border: "1.5px solid var(--brew-accent-2)", background: "var(--brew-surface)",
                    cursor: isRefilling ? "default" : "pointer",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    opacity: isRefilling ? 0.35 : 1,
                  }}
                >
                  <RotateCcw size={15} strokeWidth={1.8} color="var(--brew-text-2)" />
                </motion.button>

                <motion.button
                  whileHover={!disabled ? { scale: 1.03 } : {}}
                  whileTap={!disabled ? { scale: 0.96 } : {}}
                  onClick={() => {
                    if (isRunning) { timer.pause(); }
                    else { timer.start(); setFocusMode(true); }
                  }}
                  disabled={disabled}
                  aria-label={isRunning ? "Pause" : "Start"}
                  style={{
                    padding: "0 36px", height: 48, borderRadius: 999,
                    background: disabled ? "var(--brew-accent)" : "var(--brew-cta)",
                    border: "none", color: "var(--brew-cta-fg)", fontSize: 13, fontWeight: 500,
                    cursor: disabled ? "default" : "pointer", letterSpacing: "0.03em",
                    minWidth: 130,
                    boxShadow: disabled ? "none" : "0 4px 18px var(--brew-shadow)",
                    transition: "all 0.2s ease",
                  }}
                >
                  <motion.span key={isRunning ? "pause" : "start"} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.12 }}>
                    {isCompleted ? "✓" : isRunning ? "Pause" : status === "paused" ? "Resume" : "Start"}
                  </motion.span>
                </motion.button>

                {/* Re-enter focus mode — only visible during active session */}
                <AnimatePresence>
                  {isActive && (
                    <motion.button
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      whileHover={{ scale: 1.06 }}
                      whileTap={{ scale: 0.92 }}
                      onClick={() => setFocusMode(true)}
                      aria-label="Enter focus mode"
                      title="Enter focus mode"
                      style={{
                        width: 40, height: 40, borderRadius: "50%",
                        border: "1.5px solid var(--brew-accent-2)", background: "var(--brew-surface)",
                        cursor: "pointer",
                        display: "flex", alignItems: "center", justifyContent: "center",
                      }}
                    >
                      <Maximize2 size={15} strokeWidth={1.8} color="var(--brew-text-2)" />
                    </motion.button>
                  )}
                </AnimatePresence>
              </div>

              {/* Mobile drawer trigger — only shown on mobile via CSS */}
              <motion.button
                className="mobile-drawer-trigger"
                onClick={() => setMobileDrawer(true)}
                whileTap={{ scale: 0.95 }}
                style={{
                  marginTop: 22,
                  padding: "9px 24px",
                  borderRadius: 999,
                  border: "1px solid var(--brew-border)",
                  background: "var(--brew-surface)",
                  color: "var(--brew-text-3)",
                  fontSize: 11,
                  letterSpacing: "0.08em",
                  cursor: "pointer",
                  gap: 7,
                  textTransform: "uppercase",
                  alignItems: "center",
                  transition: "border-color 0.15s ease",
                }}
              >
                <span style={{ fontSize: 15, lineHeight: 1 }}>≡</span>
                <span>brew &amp; sounds</span>
              </motion.button>
            </main>
          ) : (
            <div className="timer-full">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeTab}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.18 }}
                  style={{ width: "100%" }}
                >
                  {activeTab === "journal" && <JournalPanel sessions={sessions} />}
                  {activeTab === "settings" && (
                    <SettingsPanel
                      username={username}
                      setUsername={setUsername}
                      sessions={sessions}
                      clearSessions={clearSessions}
                      presetDurations={presetDurations}
                      setPresetDuration={setPresetDuration}
                      cupStyle={cupStyle}
                      setCupStyle={setCupStyle}
                    />
                  )}
                </motion.div>
              </AnimatePresence>
            </div>
          )}

          {/* Right panel — session only */}
          {isSession && (
            <aside className="timer-right">

              {/* ── Music ───────────────────────────────────── */}
              <div>
                <PanelLabel>Music</PanelLabel>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
                  {MUSIC_OPTIONS.map((opt) => {
                    const active = music === opt.id;
                    return (
                      <motion.button
                        key={opt.id}
                        onClick={() => setMusic(active ? "none" : opt.id)}
                        whileTap={{ scale: 0.93 }}
                        title={opt.desc}
                        style={{
                          padding: "4px 11px",
                          borderRadius: 999,
                          border: active ? "none" : "1px solid var(--brew-border)",
                          background: active ? "var(--brew-cta)" : "var(--brew-surface)",
                          color: active ? "var(--brew-cta-fg)" : "var(--brew-text-2)",
                          fontSize: 10,
                          fontWeight: active ? 500 : 400,
                          cursor: "pointer",
                          letterSpacing: "0.02em",
                          boxShadow: active ? "0 2px 6px var(--brew-shadow)" : "none",
                          transition: "all 0.18s ease",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {opt.label}
                      </motion.button>
                    );
                  })}
                </div>

                <AnimatePresence>
                  {music !== "none" && (
                    <motion.div
                      initial={{ opacity: 0, height: 0, marginTop: 0 }}
                      animate={{ opacity: 1, height: "auto", marginTop: 10 }}
                      exit={{ opacity: 0, height: 0, marginTop: 0 }}
                      transition={{ duration: 0.22 }}
                      style={{ overflow: "hidden" }}
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "0 2px" }}>
                        <span style={{ fontSize: 9, color: "var(--brew-accent)", letterSpacing: "0.08em", textTransform: "uppercase", flexShrink: 0 }}>vol</span>
                        <input
                          type="range" min={0} max={1} step={0.05}
                          value={musicVolume}
                          onChange={(e) => setMusicVolume(Number(e.target.value))}
                          style={{ flex: 1, accentColor: "var(--brew-accent)", cursor: "pointer" }}
                          aria-label="Music volume"
                        />
                        <span style={{ fontSize: 10, color: "var(--brew-text-3)", width: 24, textAlign: "right", flexShrink: 0, fontVariantNumeric: "tabular-nums" }}>
                          {Math.round(musicVolume * 100)}
                        </span>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* ── Ambience ────────────────────────────────── */}
              <div>
                <PanelLabel>Ambience</PanelLabel>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 6 }}>
                  {AMBIENCE_OPTIONS.map((opt) => {
                    const active = soundscape === opt.id;
                    return (
                      <motion.button
                        key={opt.id}
                        onClick={() => setSoundscape(active && opt.id !== "none" ? "none" : opt.id)}
                        whileHover={{ y: -1 }}
                        whileTap={{ scale: 0.94 }}
                        style={{
                          display: "flex", flexDirection: "column",
                          alignItems: "center", justifyContent: "center",
                          gap: 5, padding: "11px 4px", borderRadius: 10,
                          border: active ? "none" : "1px solid var(--brew-border)",
                          background: active ? "var(--brew-cta)" : "var(--brew-surface)",
                          cursor: "pointer",
                          boxShadow: active ? "0 2px 8px var(--brew-shadow)" : "none",
                          transition: "background 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease",
                        }}
                      >
                        <span style={{
                          fontSize: 16, lineHeight: 1,
                          color: active ? "var(--brew-cta-fg)" : "var(--brew-accent)",
                          transition: "color 0.2s ease",
                        }}>
                          {opt.symbol}
                        </span>
                        <span style={{
                          fontSize: 9, letterSpacing: "0.02em",
                          color: active ? "var(--brew-cta-fg)" : "var(--brew-text-3)",
                          fontWeight: active ? 500 : 400,
                          transition: "color 0.2s ease",
                          whiteSpace: "nowrap",
                        }}>
                          {opt.label}
                        </span>
                      </motion.button>
                    );
                  })}
                </div>

                <AnimatePresence>
                  {soundscape !== "none" && (
                    <motion.div
                      initial={{ opacity: 0, height: 0, marginTop: 0 }}
                      animate={{ opacity: 1, height: "auto", marginTop: 12 }}
                      exit={{ opacity: 0, height: 0, marginTop: 0 }}
                      transition={{ duration: 0.22 }}
                      style={{ overflow: "hidden" }}
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "0 2px" }}>
                        <span style={{ fontSize: 9, color: "var(--brew-accent)", letterSpacing: "0.08em", textTransform: "uppercase", flexShrink: 0 }}>vol</span>
                        <input
                          type="range" min={0} max={1} step={0.05}
                          value={soundVolume}
                          onChange={(e) => setSoundVolume(Number(e.target.value))}
                          style={{ flex: 1, accentColor: "var(--brew-accent)", cursor: "pointer" }}
                          aria-label="Volume"
                        />
                        <span style={{ fontSize: 10, color: "var(--brew-text-3)", width: 24, textAlign: "right", flexShrink: 0, fontVariantNumeric: "tabular-nums" }}>
                          {Math.round(soundVolume * 100)}
                        </span>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <div>
                <PanelLabel>Today's brews</PanelLabel>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 6, alignItems: "center" }}>
                  {Array.from({ length: showSlots }).map((_, i) => (
                    <MiniCup key={i} filled={i < todaySessions.length} inProgress={i === todaySessions.length && isRunning} />
                  ))}
                  {todaySessions.length > 0 && (
                    <span style={{ fontSize: 10, color: "var(--brew-text-3)", marginLeft: 2 }}>
                      {todaySessions.length} done
                    </span>
                  )}
                </div>
              </div>

              <div style={{ marginTop: "auto" }}>
                <PanelLabel>Shortcuts</PanelLabel>
                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  {[["Space", "start / pause"], ["R", "reset"]].map(([key, action]) => (
                    <div key={key} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <kbd style={{
                        fontSize: 9, fontFamily: "monospace",
                        background: "var(--brew-surface)", border: "1px solid var(--brew-border)",
                        borderRadius: 5, padding: "2px 6px",
                        color: "var(--brew-text-2)", minWidth: 42, textAlign: "center",
                        boxShadow: "0 1px 0 var(--brew-border)",
                      }}>
                        {key}
                      </kbd>
                      <span style={{ fontSize: 11, color: "var(--brew-text-3)" }}>{action}</span>
                    </div>
                  ))}
                </div>
              </div>
            </aside>
          )}
        </div>
      </div>
    </>
  );
}
