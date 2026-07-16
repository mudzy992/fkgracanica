# Phase 3 — Notifications

## Cilj

Proširiti postojeći in-app notifications flow na email i push bez razbijanja postojećeg Socket.IO badge/inbox ponašanja.

## Backend

- `PushDevice` model i migration
- register/unregister endpoints
- Nodemailer worker preko BullMQ
- SMTP registry keys
- push dispatch service
- delivery preference model

## Mobile

- `expo-notifications` setup
- token register/unregister
- foreground/background handling
- deep-link routing iz push payload-a

## Gate

- in-app notif i dalje radi
- email queue više ne loguje samo payload
- push token lifecycle je vezan za login/logout
