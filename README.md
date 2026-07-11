# ⛰ Trek Captain

A production-ready group trek management platform for trek captains/organizers in India. Built with Next.js 14+, TypeScript, and Tailwind CSS.

## Features

- 🏔 **Trek Management** — Create, edit, and manage multiple treks
- 👥 **Participant Tracking** — Add participants, track confirmations, one-tap WhatsApp/call
- 💰 **Payment Tracking** — Record UPI/Cash/Bank payments, auto-detect payment status, send reminders
- 🗺 **Itinerary Builder** — Day-wise timeline with activities, meals, treks, and rest stops
- 📢 **Announcements** — Post updates, mark urgent, share on WhatsApp
- 📊 **Dashboard** — Overview stats, upcoming treks, recent activity feed
- 📱 **Fully Responsive** — Desktop sidebar, mobile bottom nav

## Tech Stack

- **Framework:** Next.js 14+ (App Router, TypeScript)
- **Styling:** Tailwind CSS (custom components)
- **Icons:** lucide-react
- **Data:** localStorage with typed abstraction (Supabase-ready)
- **Fonts:** Sora + Inter (Google Fonts)

## Getting Started

### Local Development

```bash
# Install dependencies
npm install

# Start dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the app.

Demo data is automatically seeded on first load.

### Production Build

```bash
npm run build
npm start
```

## Deploy to Vercel

1. Push this repo to GitHub
2. Go to [vercel.com/new](https://vercel.com/new)
3. Import the repository
4. Framework preset: **Next.js** (auto-detected)
5. Click **Deploy**

No environment variables needed. The app uses `localStorage` for data persistence.

## Project Structure

```
app/
├── page.tsx                  # Landing page
├── layout.tsx                # Root layout (fonts, metadata)
└── dashboard/
    ├── layout.tsx            # Sidebar + bottom nav layout
    ├── page.tsx              # Dashboard home
    ├── treks/
    │   ├── page.tsx          # Treks list
    │   └── [id]/page.tsx     # Trek detail (5 tabs)
    └── settings/page.tsx     # Settings

components/
├── ui/                       # Reusable UI components
└── treks/                    # Trek tab components

lib/
├── types.ts                  # TypeScript interfaces
├── store.ts                  # localStorage abstraction
├── seed.ts                   # Demo data
└── utils.ts                  # Formatting helpers
```

## License

MIT
