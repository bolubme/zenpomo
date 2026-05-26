export type TimerStatus = "idle" | "running" | "paused" | "completed" | "refilling";

export type DrinkMode = "coffee" | "matcha" | "tea" | "hot_chocolate" | "espresso";

export type FocusPreset = "espresso" | "pour_over" | "french_press" | "cold_brew";

export type Soundscape =
  | "none"
  | "cafe"
  | "rain"
  | "fireplace"
  | "ocean"
  | "forest"
  | "storm"
  | "keyboard"
  | "night";

export interface DrinkConfig {
  liquidColor: string;
  liquidColorDark: string;
  liquidColorLight: string;
  steamColor: string;
  label: string;
  emoji: string;
  cupTint: string;
}

export const DRINK_CONFIG: Record<DrinkMode, DrinkConfig> = {
  coffee: {
    liquidColor: "#6B3A26",
    liquidColorDark: "#4A2418",
    liquidColorLight: "#8B5A3C",
    steamColor: "rgba(210,190,170,0.55)",
    label: "Coffee",
    emoji: "☕",
    cupTint: "#F5EDE0",
  },
  matcha: {
    liquidColor: "#5B7C52",
    liquidColorDark: "#3D5838",
    liquidColorLight: "#7EA172",
    steamColor: "rgba(175,205,165,0.5)",
    label: "Matcha",
    emoji: "🍵",
    cupTint: "#EFF5E8",
  },
  tea: {
    liquidColor: "#C08040",
    liquidColorDark: "#8B5A20",
    liquidColorLight: "#D4A060",
    steamColor: "rgba(215,190,155,0.5)",
    label: "Tea",
    emoji: "🫖",
    cupTint: "#F5EFE0",
  },
  hot_chocolate: {
    liquidColor: "#3D2010",
    liquidColorDark: "#2A1208",
    liquidColorLight: "#5A3020",
    steamColor: "rgba(195,170,145,0.5)",
    label: "Hot Choc",
    emoji: "🍫",
    cupTint: "#F0E5D8",
  },
  espresso: {
    liquidColor: "#1E1008",
    liquidColorDark: "#100800",
    liquidColorLight: "#2E1A10",
    steamColor: "rgba(180,155,130,0.45)",
    label: "Espresso",
    emoji: "☕",
    cupTint: "#EDE5D8",
  },
};

export const PRESET_DURATIONS: Record<FocusPreset, number> = {
  espresso:     15 * 60,
  pour_over:    25 * 60,
  french_press: 45 * 60,
  cold_brew:    90 * 60,
};

export const PRESET_LABELS: Record<FocusPreset, string> = {
  espresso:     "Espresso · 15 min",
  pour_over:    "Pour over · 25 min",
  french_press: "French press · 45 min",
  cold_brew:    "Cold brew · 90 min",
};

export type MusicTrack =
  | "none"
  | "lofi"
  | "ambient"
  | "piano"
  | "jazz"
  | "focus"
  | "groove"
  | "drone";

export const MUSIC_LABELS: Record<MusicTrack, string> = {
  none:    "Off",
  lofi:    "Lo-fi",
  ambient: "Ambient",
  piano:   "Piano",
  jazz:    "Jazz",
  focus:   "Focus",
  groove:  "Groove",
  drone:   "Drone",
};

export const SOUNDSCAPE_LABELS: Record<Soundscape, string> = {
  none:      "Silent",
  cafe:      "Café",
  rain:      "Rain",
  fireplace: "Fireplace",
  ocean:     "Ocean",
  forest:    "Forest",
  storm:     "Storm",
  keyboard:  "Keyboard",
  night:     "Night",
};

export type CupStyle = "classic" | "espresso" | "takeaway" | "cappuccino" | "glass" | "minimal" | "teacup";

export const CUP_STYLE_LABELS: Record<CupStyle, string> = {
  classic:    "Classic",
  espresso:   "Espresso",
  takeaway:   "Takeaway",
  cappuccino: "Cappuccino",
  glass:      "Glass",
  minimal:    "Minimal",
  teacup:     "Teacup",
};

export interface FocusSession {
  id: string;
  userId: string;
  durationSeconds: number;
  startedAt: string;
  completedAt: string;
  drinkMode?: DrinkMode;
}


export interface UserStats {
  totalFocusSeconds: number;
  totalSessions: number;
  currentStreak: number;
  longestStreak: number;
  lastSessionDate: string | null;
  sessionsToday: number;
  sessionsByDay: { date: string; count: number; totalMinutes: number }[];
}
