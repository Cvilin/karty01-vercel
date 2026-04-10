# Project Context

## Project: Karty Tvůrkyně
- E-learning interactive card widget
- Embeddable via iframe
- Stack: Next.js + Convex DB
- Language: Czech (UI and communication in Czech)

## Allowed Admin Emails
- klicosudu@centrum.cz
- pavel.zeman.krnov@gmail.com

## Architecture
- `/admin` — protected admin panel (OTP auth + email whitelist)
- Widget (Phase 2) — will be embeddable via iframe at `/`
- Convex deployment: keen-gopher-954 (EU West)

## Database Schema
- `cards`: cardId (0=back, 1-64=front), message, imageId (Convex Storage)
- `lessons`: lessonId (string e.g. L0-L5), pool (array of cardId numbers)
- `drawHistory`: userId, drawnCardId, drawnAt — 12h cooldown per user
- `users`: standard auth table + email index
