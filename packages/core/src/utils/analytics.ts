import type { FocusSession, UserStats } from "../types";

export function computeStats(sessions: FocusSession[]): UserStats {
  const totalFocusSeconds = sessions.reduce((s, x) => s + x.durationSeconds, 0);

  const today = new Date().toISOString().split("T")[0];
  const sessionsToday = sessions.filter(
    (s) => s.completedAt.split("T")[0] === today
  ).length;

  const days = Array.from({ length: 14 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (13 - i));
    return d.toISOString().split("T")[0];
  });

  const dayMap = new Map<string, { count: number; totalSeconds: number }>();
  days.forEach((d) => dayMap.set(d, { count: 0, totalSeconds: 0 }));

  sessions.forEach((s) => {
    const day = s.completedAt.split("T")[0];
    if (dayMap.has(day)) {
      const e = dayMap.get(day)!;
      e.count++;
      e.totalSeconds += s.durationSeconds;
    }
  });

  const sessionsByDay = days.map((date) => ({
    date,
    count: dayMap.get(date)!.count,
    totalMinutes: Math.round(dayMap.get(date)!.totalSeconds / 60),
  }));

  const { currentStreak, longestStreak, lastSessionDate } = computeStreak(sessions);

  return {
    totalFocusSeconds,
    totalSessions: sessions.length,
    currentStreak,
    longestStreak,
    lastSessionDate,
    sessionsToday,
    sessionsByDay,
  };
}

function computeStreak(sessions: FocusSession[]) {
  if (!sessions.length) return { currentStreak: 0, longestStreak: 0, lastSessionDate: null };

  const uniqueDays = [...new Set(sessions.map((s) => s.completedAt.split("T")[0]))].sort();
  const lastSessionDate = uniqueDays[uniqueDays.length - 1];

  let streak = 1;
  let longestStreak = 1;

  for (let i = 1; i < uniqueDays.length; i++) {
    const diff =
      (new Date(uniqueDays[i]).getTime() - new Date(uniqueDays[i - 1]).getTime()) /
      86400000;
    streak = diff === 1 ? streak + 1 : 1;
    longestStreak = Math.max(longestStreak, streak);
  }

  const today = new Date().toISOString().split("T")[0];
  const yesterday = new Date(Date.now() - 86400000).toISOString().split("T")[0];
  const currentStreak =
    lastSessionDate === today || lastSessionDate === yesterday ? streak : 0;

  return { currentStreak, longestStreak, lastSessionDate };
}

export function formatDuration(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  if (h > 0) return `${h}h ${m}m`;
  return `${m}m`;
}

export function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}
