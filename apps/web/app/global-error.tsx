"use client";

export default function GlobalError({ reset }: { reset: () => void }) {
  return (
    <html lang="en">
      <body
        style={{
          minHeight: "100dvh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "#FAF8F4",
          fontFamily: "Inter, system-ui, sans-serif",
          color: "#3D2B1F",
          gap: "16px",
        }}
      >
        <p style={{ fontSize: 40 }}>☕</p>
        <h2 style={{ fontSize: 18, fontWeight: 600 }}>Something went wrong</h2>
        <button
          onClick={reset}
          style={{
            padding: "10px 24px",
            borderRadius: 12,
            background: "#3D2B1F",
            color: "#FAF8F4",
            fontSize: 14,
            fontWeight: 600,
            border: "none",
            cursor: "pointer",
          }}
        >
          Try again
        </button>
      </body>
    </html>
  );
}
