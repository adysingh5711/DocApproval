import { ImageResponse } from "next/og";
import { readFileSync } from "fs";
import { join } from "path";

export const runtime = "nodejs";
export const alt = "DocApproval – Approvals that move at your pace.";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const STATUS_PILLS = [
  { label: "APPROVED", dot: "#10b981", bg: "#ecfdf5", text: "#065f46", border: "#a7f3d0" },
  { label: "PENDING",  dot: "#f59e0b", bg: "#fffbeb", text: "#92400e", border: "#fde68a" },
  { label: "DECLINED", dot: "#f43f5e", bg: "#fff1f2", text: "#9f1239", border: "#fecdd3" },
];

export default async function Image() {
  const interRegular = readFileSync(join(process.cwd(), "public/fonts/Inter-Regular.ttf"));
  const interBold    = readFileSync(join(process.cwd(), "public/fonts/Inter-Bold.ttf"));

  const logoBase64 = await fetch(
    "https://raw.githubusercontent.com/adysingh5711/DocApproval/main/public/images/DocApproval-logo/DocApproval-full-black.svg"
  ).then(async (r) => {
    const buf = await r.arrayBuffer();
    return `data:image/svg+xml;base64,${Buffer.from(buf).toString("base64")}`;
  });

  return new ImageResponse(
    (
      // ROOT — full canvas
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          background: "#f8fafc",
          position: "relative",
          overflow: "hidden",
          fontFamily: "Inter",
        }}
      >
        {/* Dot-grid overlay */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            backgroundImage: "radial-gradient(circle, #cbd5e1 1px, transparent 1px)",
            backgroundSize: "28px 28px",
            opacity: 0.5,
          }}
        />

        {/* Glow top-left */}
        <div
          style={{
            position: "absolute",
            top: -160,
            left: -160,
            width: 520,
            height: 520,
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(99,102,241,0.12) 0%, transparent 70%)",
            display: "flex",
          }}
        />

        {/* Glow bottom-right */}
        <div
          style={{
            position: "absolute",
            bottom: -120,
            right: -120,
            width: 480,
            height: 480,
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(99,102,241,0.08) 0%, transparent 70%)",
            display: "flex",
          }}
        />

        {/* ── LEFT COLUMN ── */}
        <div
          style={{
            position: "absolute",
            left: 72,
            top: 0,
            bottom: 0,
            width: 620,
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
          }}
        >
          {/* Logo */}
          <div style={{ display: "flex", marginBottom: 36 }}>
            <img
              src={logoBase64}
              width={220}
              height={44}
              style={{ objectFit: "contain" }}
            />
          </div>

          {/* "Now live" badge */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 7,
              padding: "6px 14px",
              borderRadius: 9999,
              background: "#eef2ff",
              border: "1px solid #c7d2fe",
              color: "#4338ca",
              fontSize: 14,
              fontWeight: 600,
              marginBottom: 24,
            }}
          >
            <div
              style={{
                display: "flex",
                width: 8,
                height: 8,
                borderRadius: "50%",
                background: "#4f46e5",
              }}
            />
            Now live · free to get started
          </div>

          {/* Headline */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              color: "#0f172a",
              fontWeight: 700,
              fontSize: 64,
              lineHeight: 1.08,
              letterSpacing: "-0.03em",
              marginBottom: 20,
            }}
          >
            <span>Approvals that</span>
            <span style={{ color: "#4f46e5" }}>move at your</span>
            <span>pace.</span>
          </div>

          {/* Sub-copy */}
          <div
            style={{
              display: "flex",
              color: "#64748b",
              fontSize: 22,
              lineHeight: 1.5,
              fontWeight: 400,
            }}
          >
            Route documents, collect sign-offs, and audit every decision.
          </div>
        </div>

        {/* ── FLOATING DOC CARD ── */}
        <div
          style={{
            position: "absolute",
            right: 72,
            top: 100,
            width: 320,
            background: "#ffffff",
            border: "1px solid #e2e8f0",
            borderRadius: 20,
            padding: "24px 22px",
            display: "flex",
            flexDirection: "column",
            boxShadow: "0 8px 24px rgba(15,23,42,0.08)",
          }}
        >
          {/* Card top row */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: 16,
            }}
          >
            {/* APPROVED pill */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                padding: "4px 10px",
                borderRadius: 9999,
                background: "#ecfdf5",
                border: "1px solid #a7f3d0",
                color: "#065f46",
                fontSize: 11,
                fontWeight: 700,
              }}
            >
              <div
                style={{
                  display: "flex",
                  width: 7,
                  height: 7,
                  borderRadius: "50%",
                  background: "#10b981",
                }}
              />
              APPROVED
            </div>

            {/* LIVE badge */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 4,
                padding: "3px 8px",
                borderRadius: 9999,
                background: "#eef2ff",
                border: "1px solid #c7d2fe",
                color: "#4f46e5",
                fontSize: 10,
                fontWeight: 700,
              }}
            >
              <div
                style={{
                  display: "flex",
                  width: 6,
                  height: 6,
                  borderRadius: "50%",
                  background: "#4f46e5",
                }}
              />
              LIVE
            </div>
          </div>

          {/* Card title */}
          <div
            style={{
              display: "flex",
              color: "#0f172a",
              fontSize: 15,
              fontWeight: 600,
              marginBottom: 10,
            }}
          >
            Q1 Budget Sign-off
          </div>

          {/* Category chips */}
          <div style={{ display: "flex", gap: 6, marginBottom: 18 }}>
            {["Finance", "Q1-2026"].map((tag) => (
              <div
                key={tag}
                style={{
                  display: "flex",
                  padding: "2px 8px",
                  borderRadius: 9999,
                  background: "#f8fafc",
                  border: "1px solid #e2e8f0",
                  color: "#64748b",
                  fontSize: 10,
                  fontWeight: 500,
                }}
              >
                {tag}
              </div>
            ))}
          </div>

          {/* Divider */}
          <div
            style={{
              display: "flex",
              height: 1,
              background: "#f1f5f9",
              marginBottom: 14,
            }}
          />

          {/* Card footer */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <div
              style={{
                display: "flex",
                color: "#94a3b8",
                fontSize: 10,
                fontWeight: 500,
              }}
            >
              JUST NOW
            </div>
            <div
              style={{
                display: "flex",
                color: "#4f46e5",
                fontSize: 12,
                fontWeight: 600,
              }}
            >
              View →
            </div>
          </div>
        </div>

        {/* ── STATUS PILLS ROW ── */}
        <div
          style={{
            position: "absolute",
            right: 72,
            bottom: 80,
            display: "flex",
            gap: 8,
          }}
        >
          {STATUS_PILLS.map((s) => (
            <div
              key={s.label}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 5,
                padding: "5px 12px",
                borderRadius: 9999,
                background: s.bg,
                border: `1px solid ${s.border}`,
                color: s.text,
                fontSize: 11,
                fontWeight: 700,
              }}
            >
              <div
                style={{
                  display: "flex",
                  width: 7,
                  height: 7,
                  borderRadius: "50%",
                  background: s.dot,
                }}
              />
              {s.label}
            </div>
          ))}
        </div>

        {/* ── BOTTOM-LEFT STRIP ── */}
        <div
          style={{
            position: "absolute",
            left: 72,
            bottom: 48,
            display: "flex",
            alignItems: "center",
            gap: 10,
            padding: "8px 16px",
            background: "#ffffff",
            border: "1px solid #e2e8f0",
            borderRadius: 12,
            boxShadow: "0 1px 3px rgba(15,23,42,0.05)",
          }}
        >
          <div
            style={{
              display: "flex",
              width: 8,
              height: 8,
              borderRadius: "50%",
              background: "#10b981",
            }}
          />
          <div
            style={{
              display: "flex",
              color: "#475569",
              fontSize: 13,
              fontWeight: 500,
            }}
          >
            Auto-tracking · Reminder emails · Zero manual sync
          </div>
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [
        { name: "Inter", data: interRegular, style: "normal", weight: 400 },
        { name: "Inter", data: interBold,    style: "normal", weight: 700 },
      ],
    }
  );
}
