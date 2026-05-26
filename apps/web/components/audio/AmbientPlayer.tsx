"use client";

import { useEffect, useRef } from "react";
import { useTimerStore } from "@zenpomo/core";
import type { Soundscape } from "@zenpomo/core";

// Mixkit CDN — CORS-enabled (Access-Control-Allow-Origin: *), all verified HTTP 200
const AUDIO_URLS: Partial<Record<Soundscape, string>> = {
  cafe:      "https://assets.mixkit.co/active_storage/sfx/444/444-preview.mp3",
  rain:      "https://assets.mixkit.co/active_storage/sfx/2678/2678-preview.mp3",
  fireplace: "https://assets.mixkit.co/active_storage/sfx/1736/1736-preview.mp3",
  ocean:     "https://assets.mixkit.co/active_storage/sfx/1196/1196-preview.mp3",
  forest:    "https://assets.mixkit.co/active_storage/sfx/1210/1210-preview.mp3",
  storm:     "https://assets.mixkit.co/active_storage/sfx/2402/2402-preview.mp3",
  keyboard:  "https://assets.mixkit.co/active_storage/sfx/1386/1386-preview.mp3",
  night:     "https://assets.mixkit.co/active_storage/sfx/1789/1789-preview.mp3",
};

export function AmbientPlayer() {
  const soundscape  = useTimerStore((s) => s.soundscape);
  const soundVolume = useTimerStore((s) => s.soundVolume);
  const audioRef    = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (audioRef.current) { audioRef.current.pause(); audioRef.current = null; }
    if (soundscape === "none") return;

    const url = AUDIO_URLS[soundscape];
    if (!url) return;

    const audio  = new Audio(url);
    audio.loop   = true;
    audio.volume = soundVolume;
    audio.play().catch(() => {});
    audioRef.current = audio;

    return () => { audio.pause(); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [soundscape]);

  useEffect(() => {
    if (audioRef.current) audioRef.current.volume = soundVolume;
  }, [soundVolume]);

  return null;
}
