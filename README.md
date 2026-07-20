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

## Deploy to DigitalOcean

1. Push this repo to GitHub
2. Update `YOUR_GITHUB_USER` in `.do/app.yaml`
3. Create a new **App Platform Static Site** in DigitalOcean, or use `doctl apps create --spec .do/app.yaml`
4. Add custom domains: `hightide.io` and `www.hightide.io`
5. Configure redirect: `hightide.io` → `www.hightide.io` (canonical)
6. Update DNS to point at DigitalOcean

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
