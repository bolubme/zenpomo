import Link from "next/link";

export default function NotFound() {
  return (
    <div
      style={{
        minHeight: "100dvh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        background: "#FAF8F4",
        fontFamily: "Inter, system-ui, sans-serif",
        color: "#3D2B1F",
        gap: "12px",
      }}
    >
      <p style={{ fontSize: 40 }}>☕</p>
      <h2 style={{ fontSize: 18, fontWeight: 600 }}>Page not found</h2>
      <Link
        href="/timer"
        style={{
          padding: "10px 24px",
          borderRadius: 12,
          background: "#3D2B1F",
          color: "#FAF8F4",
          fontSize: 14,
          fontWeight: 600,
          textDecoration: "none",
          marginTop: 4,
        }}
      >
        Back to timer
      </Link>
    </div>
  );
}
