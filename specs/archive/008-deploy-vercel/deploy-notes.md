# Deploy notes — 008-deploy-vercel

Phase 2 operator record (Vercel Git integration, Production Branch = `main`).

## Production URL

<https://combat-planner-five.vercel.app/>

## Verification (curl, 2026-07-09)

`curl -sI https://combat-planner-five.vercel.app/`:

```
HTTP/2 200
content-type: text/html; charset=utf-8
strict-transport-security: max-age=63072000; includeSubDomains; preload
server: Vercel
x-vercel-cache: HIT
last-modified: Mon, 06 Jul 2026 19:26:13 GMT
```

- `200` over HTTPS (HTTP/2, HSTS header present) — **PLT-9 reachable** ✅
- Body is the adapter-static SPA shell (`<!doctype html>` + SvelteKit `modulepreload` +
  `__sveltekit_` bootstrap), served from `build/` per `vercel.json` (`framework: null`) — confirms
  Vercel serves the static bundle, not an adapter-vercel serverless preset. ✅

## Auto-deploy

Vercel Git integration connected; Production Branch = `main`. Pushes to `main` trigger a new
production deployment at the URL above (PLT-9 push-to-main auto-deploys). Dashboard link: Vercel
project `combat-planner` (operator-held; not diff-visible).
