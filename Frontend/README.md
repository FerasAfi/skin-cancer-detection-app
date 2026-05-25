# DermAI — Skin Cancer Detection Frontend

Next.js 14 + Vanilla CSS frontend for the DermAI skin cancer detection system.

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Styling**: Vanilla CSS (no Tailwind)
- **Fonts**: Syne (display) + DM Sans (body) via Google Fonts
- **Auth**: JWT stored in localStorage

## Pages

| Route | Access | Description |
|---|---|---|
| `/` | Public | Landing page |
| `/login` | Public | Login |
| `/register` | Public | Register |
| `/pricing` | Public | Plans & pricing |
| `/home` | User / Developer | Prediction (upload + camera) |
| `/chat` | User / Developer | AI chat assistant |
| `/developer` | Developer only | API key management |

## Getting Started

```bash
# 1. Install dependencies
npm install

# 2. Set your API base URL
cp .env.local.example .env.local
# Edit NEXT_PUBLIC_API_URL to point to your backend

# 3. Run dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Auth Flow

- Login → stores `access_token`, `refresh_token`, `user` in localStorage
- Role-based redirect:
  - `user` → `/home`
  - `developer` → `/developer`
  - `admin` → `/` (future)
- All protected pages check `isLoggedIn()` on mount and redirect to `/login`

## API Integration

All API calls go through `lib/auth.js → apiFetch()`:
- Automatically attaches `Authorization: Bearer <token>`
- Set `NEXT_PUBLIC_API_URL` in `.env.local`

## Camera

Uses `getUserMedia({ facingMode: 'environment' })` for rear camera on mobile with file upload fallback.
