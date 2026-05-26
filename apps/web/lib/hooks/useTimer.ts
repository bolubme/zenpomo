"use client";

import { useEffect, useRef } from "react";
import { useTimerStore } from "@zenpomo/core";

export function useTimer() {
  const store    = useTimerStore();
  const interval = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (store.status === "running") {
      interval.current = setInterval(store.tick, 1000);
    } else {
      if (interval.current) { clearInterval(interval.current); interval.current = null; }
    }
    return () => { if (interval.current) clearInterval(interval.current); };
  }, [store.status, store.tick]);

  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      if (e.code === "Space") {
        e.preventDefault();
        if (store.status === "running") store.pause();
        else if (store.status === "idle" || store.status === "paused") store.start();
      }
      if (e.code === "KeyR") store.reset();
    }
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [store]);

  const liquidLevel = store.totalDuration > 0 ? store.secondsRemaining / store.totalDuration : 0;

  return { ...store, liquidLevel };
}
