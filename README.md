# TripConnect

**Travel Together. Travel Further.**

TripConnect is a calm, premium travel companion for discovering destinations with more context. It connects travelers with people who know the way, local guides, AI-assisted itineraries, trips, messages, journals, expenses, and safety tools.

## Included in this build

- Editorial landing page with cinematic scene transitions, responsive layout, hover motion, and travel storytelling.
- Workspace shell with Overview, Explore, Travelers, Guides, AI Trip Planner, AI Travel Guide, Trips, Messages, Connections, Profile, Journal, Expenses, and Safety routes.
- Supabase email/password Auth client with persistent browser sessions, protected tRPC token forwarding, logout, and profile metadata sync hooks.
- Direct server-side Google AI Studio Gemini integration for itinerary generation and the AI travel guide. The Gemini key is never sent to the browser.
- Google Maps JavaScript loading through a browser-safe, referrer-restricted key, with a privacy-first safety route preview and graceful setup errors.
- Supabase Realtime subscription hook for persisted messages when the Supabase migration/publication is enabled.
- Supabase PostgreSQL schema with RLS for profiles, trips, friendships, conversations, messages, notifications, guides, bookings, safety, AI plans, journals, expenses, and support tickets.
- Existing managed WebDev database/tRPC procedures retained as the compatibility store while the Supabase schema is applied and data cutover is planned.
- Vitest coverage for auth logout, protected connection behavior, and live credential reachability.

## Stack

- React 19 + TypeScript + Vite
- Tailwind CSS 4
- tRPC 11 + Express
- Drizzle ORM + managed MySQL/TiDB compatibility database
- Supabase Auth + Supabase PostgreSQL migration/RLS foundation
- Google AI Studio Gemini REST API
- Google Maps JavaScript API
- Framer Motion-ready motion system with CSS motion used for the cinematic hero and micro-interactions
- Lucide icons

## Configured environment

The active WebDev project now has these values configured through WebDev secrets:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `GEMINI_API_KEY`
- `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY`

Google OAuth was intentionally not enabled because the Google client ID and secret were not provided. The UI keeps that action visibly gated rather than pretending it works. To enable it later, add `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET`, configure the Google provider in Supabase Auth, and use the Supabase callback URL shown in the Supabase dashboard.

Twilio SMS is not configured yet. Safety currently explains its limitation and does not claim to contact police or send emergency SMS automatically.

## Supabase database setup

The migration is ready at `supabase/migrations/0001_tripconnect.sql`. The project service-role key can validate REST/Auth access, but it cannot create arbitrary PostgreSQL tables through PostgREST. Apply the migration once in the Supabase SQL Editor, then verify:

```sql
select id from public.profiles limit 1;
```

After that, profile synchronization and Supabase Realtime message subscriptions can use the RLS-protected tables. Review the policies before enabling production traffic.

## Local setup

```bash
pnpm install
pnpm dev
```

Run from `/home/ubuntu/tripconnect` in this sandbox. For an ordinary local checkout, provide the variables listed in `.env.local.example` and make sure the managed database and Supabase project are reachable.

## Environment variables

The managed runtime supplies the scaffold values:

- `DATABASE_URL`
- `JWT_SECRET`
- `VITE_APP_ID`
- `OAUTH_SERVER_URL`
- `VITE_OAUTH_PORTAL_URL`
- `OWNER_OPEN_ID`
- `OWNER_NAME`
- `BUILT_IN_FORGE_API_URL`
- `BUILT_IN_FORGE_API_KEY`
- `VITE_FRONTEND_FORGE_API_URL`
- `VITE_FRONTEND_FORGE_API_KEY`

The integration values are listed in `.env.local.example`. Never commit `.env`, `.env.local`, or service-role/Gemini secrets.

## Authentication behavior

- Email/password sign-up and sign-in use Supabase Auth.
- Sign-up captures full name, mobile, city, country, role, and interests as Supabase user metadata.
- The server validates the Supabase bearer token and synchronizes a compatibility user row for existing protected tRPC procedures.
- When the Supabase `profiles` table exists, the server also upserts the profile there.
- Logout calls Supabase `signOut`, clears the existing session state, invalidates protected query state, and returns to the landing page.
- Google sign-in remains disabled until the separate Google OAuth credentials/provider configuration is supplied.

## AI integrations

- `server/gemini.ts` calls `gemini-flash-lite-latest` directly through Google AI Studio using `GEMINI_API_KEY` server-side.
- `/plan-trip` sends structured trip requests and returns a JSON itinerary with days, places, food, transport, safety, and local tips.
- `/ai-guide` sends destination questions to the same server-side Gemini helper and renders the answer in the workspace.
- API failures use typed tRPC error handling and user-facing toasts; secrets never appear in browser code.

## Routes

- `/` — public landing page and Supabase email auth dialog
- `/home` — workspace overview
- `/explore` — destination search
- `/travelers` — traveler discovery + connection action
- `/guides` — local guide discovery + booking action
- `/plan-trip` — Gemini itinerary planner + save trip
- `/ai-guide` — Gemini destination Q&A
- `/trips` — saved trips
- `/messages` — persisted message composer with Realtime refresh hook
- `/friends` — connection requests
- `/profile` — persisted profile editing
- `/journal` — persisted travel journal
- `/expenses` — trip expense tracking
- `/safety` — safety mode, opt-in browser location permission, check-in workflow, and Maps preview

## Quality checks

```bash
pnpm test
pnpm check
pnpm build
```

The credential test validates Supabase Auth settings, Gemini model access, and Maps JavaScript access without printing secret values. The full suite must remain green before delivery.

## Production notes

- Apply and review `supabase/migrations/0001_tripconnect.sql` in Supabase before treating PostgreSQL/RLS as the production source of truth.
- Decide whether to complete a data cutover from managed MySQL/TiDB to Supabase PostgreSQL after validating the migration against real accounts.
- Configure Google OAuth separately; Google login and Gemini API access are independent systems.
- Configure Twilio only after defining emergency-contact consent, opt-in, rate limits, and audit logging.
- TripConnect does **not** claim to contact police automatically.
- Use the WebDev checkpoint flow before publishing.
