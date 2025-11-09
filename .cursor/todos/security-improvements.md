# Security Improvements TODO

**Priority:** Medium  
**Created:** November 9, 2025  
**Status:** Pending

---

## 🔒 Security Headers (Medium Priority)

Add to `next.config.ts`:
- Strict-Transport-Security (force HTTPS)
- X-Frame-Options (prevent clickjacking)
- X-Content-Type-Options (prevent MIME sniffing)
- X-XSS-Protection (browser XSS protection)
- Referrer-Policy (control referrer info)
- Permissions-Policy (restrict browser features)

**File:** `next.config.ts`

---

## 🛡️ Content Security Policy (High Priority)

Add CSP header to prevent XSS and code injection attacks.

**File:** `next.config.ts`

---

## 🔗 Update Hardcoded URLs (Low Priority)

Update generic SoundCloud URL to actual profile URL:
- Current: `https://soundcloud.com`
- Change to: Your actual SoundCloud profile

**File:** `src/constants/content.ts` (line ~93)

---

## 🔍 Regular Maintenance

- [ ] Run `pnpm audit` for vulnerable dependencies
- [ ] Keep Next.js and dependencies updated
- [ ] Monitor Vercel security settings

---

## 📚 Reference

Security headers implementation example available in chat history.

