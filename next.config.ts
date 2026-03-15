import type { NextConfig } from "next";

const isProduction = process.env.NODE_ENV === "production";
const blobHostname = "avswwi5vtnxsddjy.public.blob.vercel-storage.com";

// Static CSP in next.config.ts cannot use per-request nonces, so we allow the
// minimum inline behavior needed for the Next.js runtime and document the trade-off.
const contentSecurityPolicy = [
  "default-src 'self'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
  "object-src 'none'",
  `img-src 'self' data: blob: https://${blobHostname}`,
  "font-src 'self' data:",
  "manifest-src 'self'",
  "media-src 'self'",
  "style-src 'self' 'unsafe-inline'",
  [
    "script-src 'self' 'unsafe-inline'",
    !isProduction ? "'unsafe-eval'" : "",
  ].filter(Boolean).join(" "),
  [
    "connect-src 'self'",
    `https://${blobHostname}`,
    !isProduction ? "http://localhost:3000" : "",
    !isProduction ? "http://127.0.0.1:3000" : "",
    !isProduction ? "ws://localhost:3000" : "",
    !isProduction ? "ws://127.0.0.1:3000" : "",
  ].filter(Boolean).join(" "),
  "worker-src 'self' blob:",
  isProduction ? "upgrade-insecure-requests" : "",
].filter(Boolean).join("; ");

const securityHeaders = [
  // HSTS is production-only so local HTTP development is unaffected.
  ...(isProduction
    ? [
        {
          key: "Strict-Transport-Security",
          value: "max-age=31536000; includeSubDomains",
        },
      ]
    : []),
  {
    key: "Content-Security-Policy",
    value: contentSecurityPolicy,
  },
  {
    key: "X-Frame-Options",
    value: "DENY",
  },
  {
    key: "X-Content-Type-Options",
    value: "nosniff",
  },
  {
    key: "X-XSS-Protection",
    value: "1; mode=block",
  },
  {
    key: "Referrer-Policy",
    value: "strict-origin-when-cross-origin",
  },
  {
    key: "Permissions-Policy",
    value: [
      "accelerometer=()",
      "autoplay=()",
      "browsing-topics=()",
      "camera=()",
      "display-capture=()",
      "geolocation=()",
      "gyroscope=()",
      "magnetometer=()",
      "microphone=()",
      "payment=()",
      "publickey-credentials-get=()",
      "usb=()",
    ].join(", "),
  },
];

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: blobHostname,
        // Note: Next.js image host allow-lists must be static at build time.
        // Hardcoding the blob hostname is intentional and keeps the optimizer secure.
      },
    ],
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: securityHeaders,
      },
    ];
  },
};

export default nextConfig;

