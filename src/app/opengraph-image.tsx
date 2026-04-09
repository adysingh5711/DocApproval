import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "DocApproval – Approvals that move at your pace.";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image() {
    // Load Inter from Google Fonts (edge-compatible)
    const interSemiBold = await fetch(
        "https://fonts.gstatic.com/s/inter/v13/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuLyfAZ9hiA.woff2"
    ).then((res) => res.arrayBuffer());

    const interBold = await fetch(
        "https://fonts.gstatic.com/s/inter/v13/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuFuYAZ9hiA.woff2"
    ).then((res) => res.arrayBuffer());

    return new ImageResponse(
        (
            <div
                style={{
                    width: "100%",
                    height: "100%",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    background: "#4f46e5", // indigo-600
                    position: "relative",
                    overflow: "hidden",
                    fontFamily: "Inter",
                }}
            >
                {/* Decorative ring — top-left (matches homepage -top-20 -left-20 w-[28rem]) */}
                <div
                    style={{
                        position: "absolute",
                        top: -120,
                        left: -120,
                        width: 560,
                        height: 560,
                        borderRadius: "50%",
                        background: "rgba(255,255,255,0.05)",
                    }}
                />

                {/* Decorative ring — bottom-right (matches homepage -bottom-24 -right-12 w-[32rem]) */}
                <div
                    style={{
                        position: "absolute",
                        bottom: -140,
                        right: -80,
                        width: 640,
                        height: 640,
                        borderRadius: "50%",
                        background: "rgba(255,255,255,0.05)",
                    }}
                />

                {/* Content stack */}
                <div
                    style={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        gap: 0,
                        zIndex: 10,
                        maxWidth: 900,
                        textAlign: "center",
                        padding: "0 48px",
                    }}
                >
                    {/* Logo mark */}
                    <div
                        style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 14,
                            marginBottom: 32,
                        }}
                    >
                        <img
                            src="https://raw.githubusercontent.com/HugoHub/DocApproval/refs/heads/main/public/images/DocApproval-logo/DocApproval.svg"
                            width={52}
                            height={52}
                            style={{
                                borderRadius: 12,
                            }}
                        />
                        <span
                            style={{
                                color: "#ffffff",
                                fontWeight: 600,
                                fontSize: 28,
                                letterSpacing: "-0.02em",
                            }}
                        >
                            DocApproval
                        </span>
                    </div>

                    {/* "Now live" badge */}
                    <div
                        style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 8,
                            padding: "8px 18px",
                            borderRadius: 9999,
                            background: "rgba(255,255,255,0.10)",
                            border: "1px solid rgba(255,255,255,0.20)",
                            color: "#e0e7ff", // indigo-100
                            fontSize: 18,
                            fontWeight: 500,
                            marginBottom: 28,
                        }}
                    >
                        <div
                            style={{
                                width: 10,
                                height: 10,
                                borderRadius: "50%",
                                background: "#34d399", // emerald-400
                            }}
                        />
                        Now live · free to get started
                    </div>

                    {/* Headline */}
                    <div
                        style={{
                            color: "#ffffff",
                            fontWeight: 700,
                            fontSize: 72,
                            lineHeight: 1.1,
                            letterSpacing: "-0.03em",
                            marginBottom: 24,
                        }}
                    >
                        Approvals that move
                        <br />
                        at your pace.
                    </div>

                    {/* Sub-copy */}
                    <div
                        style={{
                            color: "#c7d2fe", // indigo-200
                            fontSize: 26,
                            lineHeight: 1.5,
                            fontWeight: 400,
                            maxWidth: 720,
                        }}
                    >
                        Route documents, collect sign-offs, and audit every decision
                        in one workspace.
                    </div>
                </div>
            </div>
        ),
        {
            ...size,
            fonts: [
                { name: "Inter", data: interSemiBold, style: "normal", weight: 400 },
                { name: "Inter", data: interBold, style: "normal", weight: 700 },
            ],
        }
    );
}