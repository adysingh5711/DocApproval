import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import Script from "next/script";
import "./globals.css";
import ConvexClientProvider from "../providers/ConvexClientProvider";
import { seoConfig } from "@/seo.config";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: seoConfig.title,
    template: `%s | ${seoConfig.title}`,
  },
  description: seoConfig.description,
  metadataBase: new URL(seoConfig.canonical),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    ...seoConfig.openGraph,
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "DocApproval",
      },
    ],
  },
  twitter: seoConfig.twitter,
  icons: {
    icon: [{ url: "/favicon.ico" }],
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  "name": "DocApproval",
  "description": seoConfig.description,
  "applicationCategory": "BusinessApplication",
  "operatingSystem": "Web",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <Script async src="https://www.googletagmanager.com/gtag/js?id=G-62M7X7KLVQ" />
        <Script id="google-analytics">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-62M7X7KLVQ');
          `}
        </Script>
      </head>
      <body className="h-full flex flex-col overflow-hidden">
        <ConvexClientProvider>
          {children}
        </ConvexClientProvider>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
