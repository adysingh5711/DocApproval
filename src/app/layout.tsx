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
  verification: {
    google: "WnaeKbRB9LIW77kvZTKfbOwFX24eDJApdNn78nZvksc",
  },
  openGraph: {
    ...seoConfig.openGraph,
  },
  twitter: {
    card: "summary_large_image",
    site: seoConfig.twitter.site,
    creator: seoConfig.twitter.creator,
    images: seoConfig.twitter.images,
  },
  icons: {
    icon: [{ url: "/images/favicon/favicon.ico" }],
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "DocApproval",
  url: seoConfig.canonical,
  description: seoConfig.description,
  applicationCategory: "BusinessApplication",
  operatingSystem: "Web",
  offers: {
    "@type": "Offer",
    price: "0",
    priceCurrency: "USD",
  },
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
        <link rel="icon" type="image/png" href="/images/favicon/favicon-96x96.png" sizes="96x96" />
        <link rel="icon" type="image/svg+xml" href="/images/favicon/favicon.svg" />
        <link rel="shortcut icon" href="/images/favicon/favicon.ico" />
        <link rel="apple-touch-icon" sizes="180x180" href="/images/favicon/apple-touch-icon.png" />
        <meta name="apple-mobile-web-app-title" content="DocApproval" />
        <link rel="manifest" href="/images/favicon/site.webmanifest" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <Script
          async
          src="https://www.googletagmanager.com/gtag/js?id=G-62M7X7KLVQ"
        />
        <Script id="google-analytics">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag(\'js\', new Date());
            gtag(\'config\', \'G-62M7X7KLVQ\');
          `}
        </Script>
      </head>
      <body className="h-full flex flex-col overflow-hidden">
        <ConvexClientProvider>{children}</ConvexClientProvider>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
