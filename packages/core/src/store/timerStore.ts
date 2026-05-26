import { create } from "zustand";
import { persist } from "zustand/middleware";
import type {
  TimerStatus,
  DrinkMode,
  FocusPreset,
  Soundscape,
  MusicTrack,
  CupStyle,
} from "../types";
import { PRESET_DURATIONS } from "../types";

export interface LocalSession {
  completedAt: string;
  durationSeconds: number;
}

interface TimerStore {
  status: TimerStatus;
  totalDuration: number;
  secondsRemaining: number;
  preset: FocusPreset;
  customDuration: number;
  presetDurations: Record<FocusPreset, number>;

  username: string;
  drinkMode: DrinkMode;
  soundscape: Soundscape;
  soundVolume: number;
  music: MusicTrack;
  musicVolume: number;
  intention: string;
  cupStyle: CupStyle;

  completedSessions: number;
  sessions: LocalSession[];

  start: () => void;
  pause: () => void;
  reset: () => void;
  tick: () => void;
  setPreset: (preset: FocusPreset) => void;
  setPresetDuration: (preset: FocusPreset, seconds: number) => void;
  setDrinkMode: (mode: DrinkMode) => void;
  setSoundscape: (soundscape: Soundscape) => void;
  setSoundVolume: (volume: number) => void;
  setMusic: (track: MusicTrack) => void;
  setMusicVolume: (volume: number) => void;
  setCustomDuration: (seconds: number) => void;
  setUsername: (name: string) => void;
  darkMode: boolean;
  setIntention: (text: string) => void;
  setCupStyle: (style: CupStyle) => void;
  toggleDarkMode: () => void;
  clearSessions: () => void;
  markRefillComplete: () => void;
}

export const useTimerStore = create<TimerStore>()(
  persist(
    (set, get) => ({
      status: "idle",
      preset: "pour_over",
      totalDuration: PRESET_DURATIONS.pour_over,
      secondsRemaining: PRESET_DURATIONS.pour_over,
      customDuration: 25 * 60,
      presetDurations: { ...PRESET_DURATIONS },
      username: "",
      drinkMode: "coffee",
      soundscape: "none",
      soundVolume: 0.5,
      music: "none",
      musicVolume: 0.4,
      intention: "",
      cupStyle: "classic",
      darkMode: false,
      completedSessions: 0,
      sessions: [],

      start: () => set({ status: "running" }),

      pause: () => set({ status: "paused" }),

      reset: () => {
        const { totalDuration } = get();
        set({ status: "refilling", secondsRemaining: totalDuration });
      },

      tick: () => {
        const { secondsRemaining, completedSessions, sessions, totalDuration } = get();
        if (secondsRemaining <= 1) {
          set({
            secondsRemaining: 0,
            status: "completed",
            completedSessions: completedSessions + 1,
            sessions: [
              ...sessions,
              { completedAt: new Date().toISOString(), durationSeconds: totalDuration },
            ],
          });
        } else {
          set({ secondsRemaining: secondsRemaining - 1 });
        }
      },

      setPreset: (preset) => {
        const duration = get().presetDurations[preset];
        set({ preset, totalDuration: duration, secondsRemaining: duration, status: "idle" });
      },

      setPresetDuration: (preset, seconds) => {
        const durations = { ...get().presetDurations, [preset]: seconds };
        const updates: Partial<TimerStore> = { presetDurations: durations };
        if (get().preset === preset) {
          updates.totalDuration = seconds;
          updates.secondsRemaining = seconds;
        }
        set(updates);
      },

      setDrinkMode:      (drinkMode)  => set({ drinkMode }),
      setSoundscape:     (soundscape) => set({ soundscape }),
      setSoundVolume:    (soundVolume) => set({ soundVolume }),
      setMusic:          (music)       => set({ music }),
      setMusicVolume:    (musicVolume) => set({ musicVolume }),
      setUsername:       (username)   => set({ username }),
      setIntention:      (intention)  => set({ intention }),
      setCupStyle:       (cupStyle)   => set({ cupStyle }),
      toggleDarkMode:    ()           => set((s) => ({ darkMode: !s.darkMode })),
      clearSessions: () => set({ sessions: [], completedSessions: 0 }),

      setCustomDuration: (seconds) => {
        set({ customDuration: seconds, totalDuration: seconds, secondsRemaining: seconds, status: "idle" });
      },

      markRefillComplete: () => set({ status: "idle" }),
    }),
    {
      name: "brew-v2",
      partialize: (s) => ({
        username:          s.username,
        drinkMode:         s.drinkMode,
        soundscape:        s.soundscape,
        soundVolume:       s.soundVolume,
        music:             s.music,
        musicVolume:       s.musicVolume,
        cupStyle:          s.cupStyle,
        darkMode:          s.darkMode,
        preset:            s.preset,
        presetDurations:   s.presetDurations,
        totalDuration:     s.totalDuration,
        customDuration:    s.customDuration,
        intention:         s.intention,
        completedSessions: s.completedSessions,
        sessions:          s.sessions,
      }),
    }
  )
);
