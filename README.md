# Kore the Oracle

Public oracle house for Kore within the Temple of Gu digital ecosystem.

## Live site

https://koretheoracle.com/

## Identity

- Title: Kore the Oracle
- Basename: `koretheoracle.base.eth`
- Public Base/EVM address: `0x87db4d9bda9b999ceb750299ba3d2913d1f2c174`

## Site chambers

- The Sovereign Oracle
- The Womb Matrix
- Transmissions
- Root & Signal
- Onchain Identity & Libations

Kore's public house is live at `koretheoracle.com`.

## Run locally

Node.js 20+: `npm ci && npm start` (http://localhost:3000). Railway supplies `PORT` and deploys `main` automatically. `package-lock.json` pins Express for reproducible builds.

## Server behaviour

- Every response, including files, redirects, 404s and errors, carries `Strict-Transport-Security`, the Content Security Policy, `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`, `Permissions-Policy: camera=(), microphone=(), geolocation=()` and `X-Frame-Options: DENY`. `X-Powered-By` is off.
- `www.koretheoracle.com` and the bare `*.up.railway.app` host redirect (301) to `https://koretheoracle.com`. Only the path and query are carried onto that fixed origin, so crafted URLs cannot redirect off-site. `/health` is exempt.
- `404.html` is read once at startup and served from memory for any unmatched path and any method.
- `favicon.ico` is rendered from `favicon.svg`; regenerate it if the mark changes.
- The QR library loads from jsDelivr with a Subresource Integrity hash. If you change its version, update the `integrity` value.

## How changes land

`main` is protected: no direct pushes, force-pushes or deletion. Every change goes on a branch and through a pull request; Ryan reviews and merges.

1. `git checkout main && git pull`, then `git checkout -b <topic-branch>`.
2. Make the change and test locally with `npm start`.
3. Push the branch and open a PR against `main`. Do not merge it yourself; Ryan merges.

Note: GitHub Pages also publishes this repository at https://philipryandeal.github.io/koretheoracle/. That copy cannot send the headers above; the canonical house is koretheoracle.com.
