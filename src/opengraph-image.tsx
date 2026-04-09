import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "DocApproval — Route, approve, and audit documents faster. Built for ops, legal, finance, and HR teams.";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OGImage() {
    return new ImageResponse(
        (
            <div
                style={{
                    width: "1200px",
                    height: "630px",
                    display: "flex",
                    fontFamily: "sans-serif",
                    backgroundColor: "#4f46e5",
                    position: "relative",
                    overflow: "hidden",
                }}
            >
                {/* Decorative rings */}
                <div
                    style={{
                        position: "absolute",
                        top: "-80px",
                        left: "-80px",
                        width: "420px",
                        height: "420px",
                        borderRadius: "9999px",
                        backgroundColor: "rgba(255,255,255,0.05)",
                    }}
                />
                <div
                    style={{
                        position: "absolute",
                        bottom: "-120px",
                        right: "-60px",
                        width: "500px",
                        height: "500px",
                        borderRadius: "9999px",
                        backgroundColor: "rgba(255,255,255,0.05)",
                    }}
                />
                <div
                    style={{
                        position: "absolute",
                        top: "200px",
                        right: "300px",
                        width: "200px",
                        height: "200px",
                        borderRadius: "9999px",
                        backgroundColor: "rgba(255,255,255,0.04)",
                    }}
                />

                {/* Content */}
                <div
                    style={{
                        display: "flex",
                        flexDirection: "column",
                        justifyContent: "space-between",
                        padding: "64px 72px",
                        width: "100%",
                        height: "100%",
                        position: "relative",
                        zIndex: 10,
                    }}
                >
                    {/* Logo */}
                    <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                        <div
                            style={{
                                width: "52px",
                                height: "52px",
                                backgroundColor: "#ffffff",
                                borderRadius: "12px",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                fontSize: "24px",
                                fontWeight: "700",
                                color: "#4f46e5",
                            }}
                        >
                            D
                        </div>
                        <span
                            style={{
                                fontSize: "26px",
                                fontWeight: "600",
                                color: "#ffffff",
                                letterSpacing: "-0.5px",
                            }}
                        >
                            DocApproval
                        </span>
                    </div>

                    {/* Hero text */}
                    <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                        <h1
                            style={{
                                fontSize: "58px",
                                fontWeight: "700",
                                color: "#ffffff",
                                lineHeight: "1.1",
                                letterSpacing: "-1.5px",
                                margin: "0",
                                maxWidth: "820px",
                            }}
                        >
                            Document approvals your whole team can trust.
                        </h1>
                        <p
                            style={{
                                fontSize: "22px",
                                color: "rgba(199,210,254,1)",
                                lineHeight: "1.5",
                                margin: "0",
                                maxWidth: "680px",
                            }}
                        >
                            Route documents, collect sign-offs, and audit every decision in one
                            workspace — built for ops, legal, finance, and HR teams.
                        </p>
                    </div>

                    {/* Pills + URL */}
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                        <div style={{ display: "flex", gap: "12px" }}>
                            {["Dashboard", "Analyse", "Automate"].map((label) => (
                                <div
                                    key={label}
                                    style={{
                                        fontSize: "14px",
                                        fontWeight: "500",
                                        padding: "8px 16px",
                                        borderRadius: "9999px",
                                        backgroundColor: "rgba(255,255,255,0.1)",
                                        border: "1px solid rgba(255,255,255,0.2)",
                                        color: "rgba(199,210,254,1)",
                                    }}
                                >
                                    {label}
                                </div>
                            ))}
                        </div>
                        <span
                            style={{
                                fontSize: "15px",
                                color: "rgba(165,180,252,1)",
                                letterSpacing: "0.5px",
                            }}
                        >
                            docapproval.vercel.app
                        </span>
                    </div>
                </div>
            </div>
        ),
        { ...size }
    );
}