import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ZenPomo — focus timer",
  description:
    "A pomodoro timer that drains like coffee. Watch the cup empty as you focus. Calm, minimal, and built for deep work.",
  keywords: ["pomodoro", "focus timer", "zenpomo", "productivity", "calm", "coffee timer"],
  themeColor: "#2D4A3E",
  openGraph: {
    title: "ZenPomo — focus timer",
    description: "A pomodoro timer that drains like coffee.",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "ZenPomo — focus timer",
    description: "A pomodoro timer that drains like coffee.",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="antialiased" suppressHydrationWarning>{children}</body>
    </html>
  );
}
