export const seoConfig = {
  title: "DocApproval - Document Approval Workflows for Teams",
  description: "Route documents, collect digital sign-offs, and audit every approval decision in one workspace. Built for ops, legal, finance, and HR teams.",
  canonical: "https://docapproval.vercel.app",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://docapproval.vercel.app",
    siteName: "DocApproval",
    images: [
      {
        url: "/opengraph-image",
      },
      {
        url: "/images/og-image.png",
        width: 1200,
        height: 630,
        alt: "DocApproval",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    site: "@docapproval",
    handle: "@docapproval",
    creator: "@singhaditya5711",
    images: ["/images/og-image.png"],
  },
};
