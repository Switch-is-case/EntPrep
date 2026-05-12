// src/app/banned/page.tsx
import React from "react";

/**
 * BannedPage is now a Server Component to reliably read searchParams
 * without hydration issues or client-side bails.
 */
export default async function BannedPage({
  searchParams,
}: {
  searchParams: Promise<{ reason?: string }>;
}) {
  const params = await searchParams;
  const reason = params.reason
    ? decodeURIComponent(params.reason)
    : "Причина не указана";

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "100vh",
        padding: "20px",
        textAlign: "center",
        backgroundColor: "#0f172a", // slate-900
        color: "white",
        fontFamily: "sans-serif",
      }}
    >
      <div
        style={{
          width: "80px",
          height: "80px",
          borderRadius: "50%",
          backgroundColor: "rgba(239, 68, 68, 0.1)", // red-500/10
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          marginBottom: "24px",
        }}
      >
        <svg
          style={{ width: "40px", height: "40px", color: "#ef4444" }}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.268 16c-.77 1.333.192 3 1.732 3z"
          />
        </svg>
      </div>

      <h1 style={{ fontSize: "24px", fontWeight: "bold", marginBottom: "8px" }}>
        🚫 Аккаунт заблокирован
      </h1>
      <p style={{ color: "#94a3b8", marginBottom: "24px" }}>
        Ваш аккаунт был заблокирован администратором.
      </p>

      <div
        style={{
          background: "rgba(15, 23, 42, 0.5)", // slate-900/50
          border: "1px solid #334155", // slate-700
          borderRadius: "12px",
          padding: "24px",
          margin: "16px 0",
          maxWidth: "400px",
          width: "100%",
        }}
      >
        <strong
          style={{
            fontSize: "12px",
            color: "#64748b",
            textTransform: "uppercase",
            display: "block",
            marginBottom: "4px",
          }}
        >
          Причина:
        </strong>
        <p style={{ fontSize: "16px", color: "#e2e8f0", margin: 0 }}>
          {reason}
        </p>
      </div>

      <p style={{ color: "#94a3b8", fontSize: "14px", marginBottom: "32px", maxWidth: "300px" }}>
        Если вы считаете это ошибкой, пожалуйста, свяжитесь с нашей службой поддержки.
      </p>

      <div style={{ display: "flex", flexDirection: "column", gap: "12px", width: "100%", maxWidth: "400px" }}>
        <a
          href="mailto:support@entprep.kz"
          style={{
            backgroundColor: "#2563eb", // primary
            color: "white",
            padding: "12px",
            borderRadius: "12px",
            fontWeight: "bold",
            textDecoration: "none",
            transition: "all 0.2s",
          }}
        >
          Связаться с поддержкой
        </a>
        <a
          href="/login"
          style={{
            backgroundColor: "#334155", // slate-700
            color: "#cbd5e1", // slate-300
            padding: "12px",
            borderRadius: "12px",
            fontWeight: "bold",
            textDecoration: "none",
            transition: "all 0.2s",
          }}
        >
          ← Вернуться на главную
        </a>
      </div>
    </div>
  );
}
