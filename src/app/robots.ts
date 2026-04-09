import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      { userAgent: "*", allow: "/" },
      { userAgent: "GPTBot", allow: "/" },
      { userAgent: "PerplexityBot", allow: "/" },
      { userAgent: "ClaudeBot", allow: "/" },
      { userAgent: "GoogleOther", allow: "/" },
      { userAgent: "Amazonbot", allow: "/" },
      { userAgent: "Applebot", allow: "/" },
    ],
    sitemap: "https://docapproval.vercel.app/sitemap.xml",
  };
}
