"use client";

import { useEffect, useRef } from "react";
import { useTimerStore } from "@zenpomo/core";
import type { MusicTrack } from "@zenpomo/core";

// Internet Archive CC-licensed tracks + SomaFM live streams (all CORS-enabled, HTTP 200 verified)
const MUSIC_URLS: Partial<Record<MusicTrack, string>> = {
  lofi:    "https://archive.org/download/jamendo-419142/01-1850385-Mit-Rich-Atmospheric%20ChillHop.mp3",
  ambient: "https://archive.org/download/jamendo-411932/01-1790976-Bulbasound-Meditation%20Music%20Relax.mp3",
  piano:   "https://archive.org/download/jamendo-272491/01-1509124-Phantasmagoria-Skyshards%20-%20Winter.mp3",
  jazz:    "https://archive.org/download/gs_reading-jazz-lounge-background-music-reading-jazz-lounge-background-music-vol/02%20Cigar%20Lounge.mp3",
  focus:   "https://archive.org/download/killing-time-by-kevin-macleod-from-filmmusic-io/killing-time-by-kevin-macleod-from-filmmusic-io.mp3",
  groove:  "https://ice2.somafm.com/groovesalad-256-mp3",
  drone:   "https://ice2.somafm.com/dronezone-256-mp3",
};

// Live radio streams — no loop flag needed (infinite)
const STREAMS = new Set<MusicTrack>(["groove", "drone"]);

export function MusicPlayer() {
  const music       = useTimerStore((s) => s.music);
  const musicVolume = useTimerStore((s) => s.musicVolume);
  const audioRef    = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (audioRef.current) { audioRef.current.pause(); audioRef.current = null; }
    if (music === "none") return;

    const url = MUSIC_URLS[music];
    if (!url) return;

    const audio  = new Audio(url);
    audio.loop   = !STREAMS.has(music);
    audio.volume = musicVolume;
    audio.play().catch(() => {});
    audioRef.current = audio;

    return () => { audio.pause(); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [music]);

  useEffect(() => {
    if (audioRef.current) audioRef.current.volume = musicVolume;
  }, [musicVolume]);

  return null;
}
