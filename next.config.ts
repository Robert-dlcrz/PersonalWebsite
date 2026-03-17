import type { NextConfig } from "next";

// We reuse the production check to keep local development usable while still
// shipping stricter headers in production.
const isProduction = process.env.NODE_ENV === "production";

// This is the single remote origin currently used by the site for trip photos
// and JSON content served from Vercel Blob.
const blobHostname = "avswwi5vtnxsddjy.public.blob.vercel-storage.com";

// Static CSP in next.config.ts cannot use per-request nonces, so we allow the
// minimum inline behavior needed for the Next.js runtime and document the trade-off.
const contentSecurityPolicy = [
  // Default deny: if a resource type is not explicitly allowed below, the
  // browser may only load it from this site's own origin.
  "default-src 'self'",

  // Prevent injected <base> tags from rewriting how relative links resolve.
  "base-uri 'self'",

  // If forms are ever added, only allow posting back to this site.
  "form-action 'self'",

  // Do not allow this site to be embedded in an iframe on another site.
  "frame-ancestors 'none'",

  // Disable legacy plugin-style content such as <object> or <embed>.
  "object-src 'none'",

  // Allow locally served images plus the Vercel Blob host that stores trip
  // media. data:/blob: stay enabled for framework/runtime image use cases.
  `img-src 'self' data: blob: https://${blobHostname}`,

  // Fonts are served from this app; data: is kept as a conservative fallback.
  "font-src 'self' data:",

  // Keep app manifests local if/when one is added.
  "manifest-src 'self'",

  // This site does not intentionally load remote audio/video content.
  "media-src 'self'",

  // Next.js and UI libraries can inject inline styles, so this stays enabled
  // unless we later move to a nonce-based CSP strategy.
  "style-src 'self' 'unsafe-inline'",
  [
    // Allow scripts from this app. 'unsafe-inline' remains because a static CSP
    // in next.config.ts cannot attach per-request nonces to Next.js runtime
    // scripts. In production we still avoid remote third-party script origins.
    "script-src 'self' 'unsafe-inline'",
    // Next.js dev tooling can require eval-like behavior; keep it out of prod.
    !isProduction ? "'unsafe-eval'" : "",
  ].filter(Boolean).join(" "),
  [
    // Allow browser fetch/XHR/WebSocket connections back to the app itself.
    "connect-src 'self'",

    // The app fetches trip assets/data from Vercel Blob.
    `https://${blobHostname}`,

    // These localhost/http/ws entries are dev-only so hot reload and local
    // navigation keep working without widening the production policy.
    !isProduction ? "http://localhost:3000" : "",
    !isProduction ? "http://127.0.0.1:3000" : "",
    !isProduction ? "ws://localhost:3000" : "",
    !isProduction ? "ws://127.0.0.1:3000" : "",
  ].filter(Boolean).join(" "),

  // Permit self-hosted workers and blob-backed workers if a dependency needs
  // them, without opening the door to arbitrary remote worker origins.
  "worker-src 'self' blob:",

  // In production, tell browsers to upgrade accidental http:// subresource
  // requests to https://. We skip this locally so localhost stays predictable.
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
    // Main browser-side defense against loading unexpected code/resources.
    key: "Content-Security-Policy",
    value: contentSecurityPolicy,
  },
  {
    // Legacy clickjacking protection that complements frame-ancestors above.
    key: "X-Frame-Options",
    value: "DENY",
  },
  {
    // Prevent MIME sniffing so browsers respect declared content types.
    key: "X-Content-Type-Options",
    value: "nosniff",
  },
  {
    // Legacy browser XSS filter support; modern protection mostly comes from CSP.
    key: "X-XSS-Protection",
    value: "1; mode=block",
  },
  {
    // Keep full referrers on same-origin navigation but trim them cross-origin.
    key: "Referrer-Policy",
    value: "strict-origin-when-cross-origin",
  },
  {
    // Opt out of browser capabilities the portfolio does not use.
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
        // Next.js image host allow-lists must be static at build time.
        // We intentionally hardcode the blob host instead of allowing a broad
        // wildcard so image optimization only trusts the origin we actually use.
      },
    ],
  },
  async headers() {
    // Apply the same security header set to every route in the app so the
    // policy is consistent across the homepage, music page, and trip routes.
    return [
      {
        source: "/(.*)",
        headers: securityHeaders,
      },
    ];
  },
};

export default nextConfig;

