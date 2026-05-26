import type { NextPage } from "next";

interface ErrorProps {
  statusCode?: number;
}

const ErrorPage: NextPage<ErrorProps> = ({ statusCode }) => (
  <div
    style={{
      minHeight: "100vh",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      background: "#FAF8F4",
      fontFamily: "Inter, system-ui, sans-serif",
      color: "#3D2B1F",
      gap: 12,
    }}
  >
    <p style={{ fontSize: 40 }}>☕</p>
    <h1 style={{ fontSize: 20, fontWeight: 700 }}>{statusCode ?? "Error"}</h1>
    <p style={{ color: "#9C8878", fontSize: 14 }}>
      {statusCode === 404 ? "Page not found" : "An unexpected error occurred"}
    </p>
    <a
      href="/timer"
      style={{
        marginTop: 8,
        padding: "10px 24px",
        borderRadius: 12,
        background: "#3D2B1F",
        color: "#FAF8F4",
        textDecoration: "none",
        fontSize: 14,
        fontWeight: 600,
      }}
    >
      Back to timer
    </a>
  </div>
);

ErrorPage.getInitialProps = ({ res, err }) => {
  const statusCode = res?.statusCode ?? err?.statusCode ?? 404;
  return { statusCode };
};

export default ErrorPage;
