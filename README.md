<div align="center">

# PPT del Terror

### A production-style endless runner about surviving the deadline before the presentation explodes.

![React](https://img.shields.io/badge/React_18-20232a?style=for-the-badge&logo=react&logoColor=61dafb)
![Vite](https://img.shields.io/badge/Vite-646cff?style=for-the-badge&logo=vite&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-3178c6?style=for-the-badge&logo=typescript&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-06b6d4?style=for-the-badge&logo=tailwindcss&logoColor=white)
![Node.js](https://img.shields.io/badge/Node.js-1f7a1f?style=for-the-badge&logo=nodedotjs&logoColor=white)
![Express](https://img.shields.io/badge/Express-111827?style=for-the-badge&logo=express&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-30557c?style=for-the-badge&logo=postgresql&logoColor=white)
![Game](https://img.shields.io/badge/Canvas_Game-f59e0b?style=for-the-badge&logo=gamejolt&logoColor=111827)

**Tags:** `endless-runner` · `react` · `typescript` · `canvas` · `express` · `postgresql` · `leaderboard` · `admin-dashboard`

</div>

---

## What It Is

PPT del Terror is a web game with a real backend. The player dodges academic chaos, collects PPT files, and tries to upload the presentation before everything goes wrong.

Behind the arcade loop, the project includes user accounts, secure sessions, weekly and all-time rankings, PostgreSQL persistence, game telemetry, an admin panel, rate limiting, and production-friendly security headers.

## Game Concept

The player controls a ship under deadline pressure. Obstacles represent mistakes, stress, tasks, bad grades, and the fear of failing to submit on time. Collecting PPT files increases progress. Survive long enough and the presentation uploads successfully. Crash, and the run ends.

## Features

- Endless runner gameplay.
- Keyboard controls with arrow keys and WASD.
- Touch/drag controls for mobile.
- Dynamic obstacle generation.
- PPT collectibles.
- Increasing difficulty.
- Score and upload progress.
- Victory and failure states.
- Personal best detection.
- Weekly leaderboard.
- All-time leaderboard.
- User registration and login.
- Persistent HTTP-only signed session cookie.
- Admin-only dashboard.
- Game event logging.
- Traffic/activity review for admins.
- PostgreSQL-backed users, sessions, scores, and events.
- Rate limits for login/register/API routes.
- Helmet security headers.
- Sentry configuration through environment variables.

## Tech Stack

| Layer | Stack |
| --- | --- |
| Frontend | React 18, TypeScript, Vite |
| Styling | Tailwind CSS, custom CSS |
| Gameplay | Canvas API |
| Backend | Node.js, Express |
| Database | PostgreSQL via `pg` |
| Auth | bcryptjs, HMAC-signed sessions |
| Security | Helmet, express-rate-limit, origin/host checks |
| Observability | Optional Sentry integration |

## Project Structure

```text
ppt-del-terror/
├── components/
│   ├── Game.tsx
│   ├── Dashboard.tsx
│   ├── Login.tsx
│   ├── AdminPanel.tsx
│   ├── Terms.tsx
│   └── Privacy.tsx
├── App.tsx
├── index.tsx
├── index.css
├── server.js              # Express API and static server
├── constants.ts
├── types.ts
├── public/
├── dist/
├── package.json
├── .env.example
└── README.md
```

## Environment

Use `.env.example` as a safe template. Store real runtime values outside Git.

Important groups:

| Group | Variables |
| --- | --- |
| Runtime | `PORT`, `NODE_ENV`, `APP_URL`, `ALLOWED_HOSTS` |
| Sessions | `SESSION_SECRET`, `COOKIE_SECURE` |
| Database | `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER`, `DB_PASSWORD`, `DB_SSL` |
| Optional legacy/admin gate | `LOGIN_PASSWORD_HASH` |
| Observability | `VITE_SENTRY_DSN`, `SENTRY_*` |

Never commit real database passwords, session secrets, password hashes, Sentry tokens, or filled `.env` files.

## Local Development

```bash
npm install
cp .env.example .env
npm run dev
```

Useful commands:

```bash
npm run dev       # Vite development server
npm run check     # TypeScript check
npm run build     # TypeScript + production frontend build
npm run start     # Run Express server
```

## API / Backend Responsibilities

The server handles:

- registration,
- login,
- logout,
- current session lookup,
- score submission,
- leaderboard reads,
- admin dashboard data,
- event logging,
- static frontend serving,
- security headers and rate limits.

## Security Notes

- Passwords are hashed with bcryptjs.
- Session cookies should be `HttpOnly`, `Secure` in production, and `SameSite=Lax`.
- Session values are signed with HMAC SHA-256.
- API routes are rate-limited.
- Login and registration have stricter limits.
- Host and origin checks protect sensitive methods.
- Admin endpoints require an authenticated admin user.
- The admin panel does not store plaintext passwords.

## Gameplay Data

Scores and events are stored to support:

- personal bests,
- weekly rankings,
- all-time rankings,
- total games,
- wins,
- recent play activity,
- admin moderation/diagnostics.

Telemetry should remain operational and transparent. Do not collect passwords, hidden identifiers, or unnecessary sensitive user data.

## Operational Checks

Before release:

```bash
npm run check
npm run build
```

Then verify:

- the static game loads,
- login/register work,
- a completed run can submit a score,
- weekly and all-time rankings render,
- admin pages require authorization,
- `/robots.txt` and public assets are served.

## License

Private project unless a license is added. Play hard, ship before the deadline, and keep secrets out of the repository.
