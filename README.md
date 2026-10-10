# QRslice

> "The restaurant's QR layer" — tap cards, feedback, reviews, digital menus. Hardware-led, software-retained.

## Tech Stack
- **Framework**: Next.js 16 (App Router), React 19, TypeScript
- **Styling**: Tailwind CSS v4
- **Auth**: Clerk
- **Database / Storage**: Supabase (Postgres with Row Level Security)
- **Payments**: Razorpay (Hardware storefront checkout & subscriptions)
- **Hosting / Runtime**: Cloudflare Workers via `@opennextjs/cloudflare`

## Getting Started
```bash
npm install
npm run dev
```

## Production Build & Deploy
```bash
npm run build:worker
npm run deploy:worker
```
