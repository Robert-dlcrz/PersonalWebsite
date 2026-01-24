---
name: vercel-config
description: Vercel project configuration for PersonalWebsite. Use when working with environment variables, deploying to Vercel, or configuring Vercel settings.
---

# Vercel Configuration

## Project Prefix

This project uses the Vercel prefix: **`ROBDLC_PERSONAL_WEBSITE`**

All connected environment variables follow this pattern:
- `ROBDLC_PERSONAL_WEBSITE_<VAR_NAME>`

## Environment Variables

When referencing Vercel-connected environment variables in code:

```25:29:src/persistence/blobClient.ts
    return list({ 
      prefix,
      token: process.env.ROBDLC_PERSONAL_WEBSITE_READ_WRITE_TOKEN 
    });
```
