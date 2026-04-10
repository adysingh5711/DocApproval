import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "DocApproval – Approvals that move at your pace.";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const STATUS_PILLS = [
    { label: "APPROVED", dot: "#10b981", bg: "#ecfdf5", text: "#065f46", border: "#a7f3d0" },
    { label: "PENDING", dot: "#f59e0b", bg: "#fffbeb", text: "#92400e", border: "#fde68a" },
    { label: "DECLINED", dot: "#f43f5e", bg: "#fff1f2", text: "#9f1239", border: "#fecdd3" },
];

async function loadGoogleFont(family: string, weight: number): Promise<ArrayBuffer> {
    const css = await fetch(
        `https://fonts.googleapis.com/css2?family=${family}:wght@${weight}&display=swap`,
        { headers: { "User-Agent": "Mozilla/5.0" } }
    ).then((r) => r.text());

    const url =
        css.match(/src: url\((.+?)\) format\('truetype'\)/)?.[1] ??
        css.match(/src: url\((.+?\.ttf)\)/)?.[1];

    if (!url) throw new Error(`Could not parse font URL for ${family}:${weight}`);
    return fetch(url).then((r) => r.arrayBuffer());
}

export default async function Image() {
    const [interRegular, interBold, logoBase64] = await Promise.all([
        loadGoogleFont("Inter", 400),
        loadGoogleFont("Inter", 700),
        fetch(
            "https://raw.githubusercontent.com/adysingh5711/DocApproval/main/public/images/DocApproval-logo/DocApproval-full-violet.svg"
        ).then(async (r) => {
            const buf = await r.arrayBuffer();
            return `data:image/svg+xml;base64,${btoa(
                String.fromCharCode(...new Uint8Array(buf))
            )}`;
        }),
    ]);

    return new ImageResponse(
        (
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
                {/* Dot-grid */}
                <div
                    style={{
                        position: "absolute",
                        inset: 0,
                        display: "flex",
                        backgroundImage: "radial-gradient(circle, #cbd5e1 1.5px, transparent 1.5px)",
                        backgroundSize: "28px 28px",
                        opacity: 0.45,
                    }}
                />

                {/* Glow TL */}
                <div
                    style={{
                        position: "absolute",
                        top: -160,
                        left: -160,
                        width: 520,
                        height: 520,
                        borderRadius: "50%",
                        background: "radial-gradient(circle, rgba(99,102,241,0.13) 0%, transparent 70%)",
                        display: "flex",
                    }}
                />

                {/* Glow BR */}
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

                {/* ===== LEFT COLUMN ===== */}
                <div
                    style={{
                        position: "absolute",
                        left: 72,
                        top: 0,
                        bottom: 0,
                        width: 600,
                        display: "flex",
                        flexDirection: "column",
                        justifyContent: "center",
                    }}
                >
                    {/* Logo */}
                    <div style={{ display: "flex", marginBottom: 32 }}>
                        <img src={logoBase64} width={210} height={48} />
                    </div>

                    {/* Live badge */}
                    <div
                        style={{
                            display: "flex",
                            flexDirection: "row",
                            alignItems: "center",
                            gap: 7,
                            padding: "6px 14px",
                            borderRadius: 9999,
                            background: "#eef2ff",
                            border: "1px solid #c7d2fe",
                            marginBottom: 24,
                            alignSelf: "flex-start",
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
                        <div
                            style={{
                                display: "flex",
                                color: "#4338ca",
                                fontSize: 14,
                                fontWeight: 600,
                            }}
                        >
                            Now live · free to get started
                        </div>
                    </div>

                    {/* Headline */}
                    <div
                        style={{
                            display: "flex",
                            flexDirection: "column",
                            marginBottom: 20,
                        }}
                    >
                        <div
                            style={{
                                display: "flex",
                                color: "#0f172a",
                                fontWeight: 700,
                                fontSize: 66,
                                lineHeight: 1.08,
                                letterSpacing: "-0.03em",
                            }}
                        >
                            Approvals that
                        </div>
                        <div
                            style={{
                                display: "flex",
                                color: "#4f46e5",
                                fontWeight: 700,
                                fontSize: 66,
                                lineHeight: 1.08,
                                letterSpacing: "-0.03em",
                            }}
                        >
                            move at your
                        </div>
                        <div
                            style={{
                                display: "flex",
                                color: "#0f172a",
                                fontWeight: 700,
                                fontSize: 66,
                                lineHeight: 1.08,
                                letterSpacing: "-0.03em",
                            }}
                        >
                            pace.
                        </div>
                    </div>

                    {/* Sub-copy */}
                    <div
                        style={{
                            display: "flex",
                            color: "#64748b",
                            fontSize: 21,
                            lineHeight: 1.5,
                            fontWeight: 400,
                        }}
                    >
                        Route documents, collect sign-offs, audit every decision.
                    </div>
                </div>

                {/* ===== FLOATING DOC CARD ===== */}
                <div
                    style={{
                        position: "absolute",
                        right: 72,
                        top: 96,
                        width: 316,
                        background: "#ffffff",
                        border: "1px solid #e2e8f0",
                        borderRadius: 20,
                        padding: "22px 20px",
                        display: "flex",
                        flexDirection: "column",
                        boxShadow: "0 8px 32px rgba(15,23,42,0.10)",
                    }}
                >
                    {/* Card top row */}
                    <div
                        style={{
                            display: "flex",
                            flexDirection: "row",
                            alignItems: "center",
                            justifyContent: "space-between",
                            marginBottom: 16,
                        }}
                    >
                        {/* APPROVED pill */}
                        <div
                            style={{
                                display: "flex",
                                flexDirection: "row",
                                alignItems: "center",
                                gap: 6,
                                padding: "4px 10px",
                                borderRadius: 9999,
                                background: "#ecfdf5",
                                border: "1px solid #a7f3d0",
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
                            <div
                                style={{
                                    display: "flex",
                                    color: "#065f46",
                                    fontSize: 11,
                                    fontWeight: 700,
                                }}
                            >
                                APPROVED
                            </div>
                        </div>

                        {/* LIVE badge */}
                        <div
                            style={{
                                display: "flex",
                                flexDirection: "row",
                                alignItems: "center",
                                gap: 4,
                                padding: "3px 8px",
                                borderRadius: 9999,
                                background: "#eef2ff",
                                border: "1px solid #c7d2fe",
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
                            <div
                                style={{
                                    display: "flex",
                                    color: "#4f46e5",
                                    fontSize: 10,
                                    fontWeight: 700,
                                }}
                            >
                                LIVE
                            </div>
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

                    {/* Chips */}
                    <div
                        style={{
                            display: "flex",
                            flexDirection: "row",
                            gap: 6,
                            marginBottom: 18,
                        }}
                    >
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

                    {/* Footer */}
                    <div
                        style={{
                            display: "flex",
                            flexDirection: "row",
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

                {/* ===== STATUS PILLS ===== */}
                <div
                    style={{
                        position: "absolute",
                        right: 72,
                        bottom: 76,
                        display: "flex",
                        flexDirection: "row",
                        gap: 8,
                    }}
                >
                    {STATUS_PILLS.map((s) => (
                        <div
                            key={s.label}
                            style={{
                                display: "flex",
                                flexDirection: "row",
                                alignItems: "center",
                                gap: 5,
                                padding: "5px 12px",
                                borderRadius: 9999,
                                background: s.bg,
                                border: `1px solid ${s.border}`,
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
                            <div
                                style={{
                                    display: "flex",
                                    color: s.text,
                                    fontSize: 11,
                                    fontWeight: 700,
                                }}
                            >
                                {s.label}
                            </div>
                        </div>
                    ))}
                </div>

                {/* ===== BOTTOM-LEFT STRIP ===== */}
                <div
                    style={{
                        position: "absolute",
                        left: 72,
                        bottom: 44,
                        display: "flex",
                        flexDirection: "row",
                        alignItems: "center",
                        gap: 10,
                        padding: "8px 16px",
                        background: "#ffffff",
                        border: "1px solid #e2e8f0",
                        borderRadius: 12,
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
                { name: "Inter", data: interBold, style: "normal", weight: 700 },
            ],
        }
    );
}
