# Hightide Landing Site

Static marketing site for [hightide.io](https://www.hightide.io), built with [Eleventy](https://www.11ty.dev/).

Separate from the main Hightide Django application at `hightide.app`.

## Quick start

```bash
cd hightide_landing
npm install
npm run download-assets   # fetch images from CDN (first time)
npm run dev               # http://localhost:8080 with live reload
npm run build             # outputs to _site/
```

## Project structure

```
src/
  index.njk              # Homepage
  about.njk              # About page
  pricing.njk            # Pricing
  contact.njk            # Contact (mailto)
  blog.njk               # Blog index
  video-tutorials.njk    # Loom tutorial embeds
  terms-conditions.njk   # Legal
  cookie-policy.njk      # Cookie policy
  blog/*.md              # Blog posts (markdown)
  _includes/             # Layouts and partials
  assets/images/         # Images
  css/main.css           # Styles
  js/main.js             # Minimal JS
```

## Adding a blog post

Create `src/blog/your-slug.md`:

```markdown
---
layout: layouts/post.njk
title: Your Post Title
description: SEO description
date: 2025-08-19
category: Getting Started
author: José Paralta
excerpt: Short summary for blog index
image: /assets/images/your-image.jpg
permalink: /post/your-slug/
---

Your content here in **markdown**.
```

Run `npm run build` to regenerate.

## Deploy to Cloudflare

Repo: **https://github.com/jeparalta/hightide-landing**

This project uses **Workers static assets** via Wrangler (same setup as Cantinho).

### Auto-deploy on push (Cloudflare Git)

Pushes to `main` deploy via the Worker’s **Build** settings in the Cloudflare dashboard (same approach as Cantinho). Keep the GitHub repo connected there.

| Setting | Value |
|---------|-------|
| Production branch | `main` |
| Build command | `npm run build` *(or leave empty)* |
| Deploy command | `npm run deploy` |

`npm run deploy` builds Eleventy and uploads `./_site` via Wrangler.

Preview URL after deploy: **https://hightide-landing.jose-453.workers.dev/**

After the first successful deploy, attach custom domains in the Worker → **Settings → Domains & Routes**:

- `hightide.io`
- `www.hightide.io`

Add domains in the dashboard rather than `wrangler.jsonc` until `hightide.io` DNS is fully on Cloudflare (still on Webflow/DO, domain binding during deploy will fail).

Optional environment variable:

| Variable | Value |
|----------|-------|
| `NODE_VERSION` | `22` |

### Deploy from your machine

```bash
npm install
npm run build
npm run deploy
```

`wrangler deploy` uploads everything in `_site/` after Eleventy builds.

### Custom domain and redirects

In the Worker project → **Custom domains**, confirm `hightide.io` and `www.hightide.io` are attached.

If you want the apex to redirect to `www` (canonical), add a **Redirect Rule** in Cloudflare:

- `hightide.io/*` → `https://www.hightide.io/$1` (301)

## Go-live checklist

- [ ] Verify all pages on preview URL
- [ ] Check sitemap at `/sitemap.xml`
- [ ] Test cookie banner + GA4 consent flow
- [ ] Update DNS
- [ ] Cancel Webflow subscription

## Tech notes

- No build framework on the client — plain HTML/CSS + minimal JS
- Analytics: Silktide cookie banner + GA4 (consent-gated) + Ahrefs
- CTAs link to `https://hightide.app/accounts/signup/`
