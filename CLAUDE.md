# BreweryCRM (Bearded Hop Brewery)

Full-stack brewery CRM and taproom management platform for Bearded Hop Brewery in Bulverde, TX.

## Tech Stack

- **Frontend**: React 19 + TypeScript + Vite 7
- **Styling**: Tailwind CSS 4 (via `@tailwindcss/vite` plugin)
- **State**: React Context (BreweryContext for mutations, DataContext for read-only data)
- **Data fetching**: Direct fetch via `src/api/client.ts` (react-query is a dependency but unused)
- **Charts**: Recharts 2
- **Icons**: Lucide React
- **Dates**: date-fns 4
- **Utilities**: clsx (class merging)
- **Testing**: Playwright (browser verification — no unit test framework)
- **Backend**: FastAPI (Python) at `~/bearded-hop-api` — separate repo

## Project Structure

```
src/
  api/
    client.ts         # API client with Bearer auth, snake_case↔camelCase conversion
    auth.ts           # Login/logout/getMe
  components/
    layout/
      Sidebar.tsx     # Main nav sidebar
      TopBar.tsx      # Top bar with search
    ui/               # Reusable UI: StatCard, DataTable, Badge, Modal, ProgressBar, SlidePanel, Toast
    CommandPalette.tsx # Cmd+K command palette
  context/
    BreweryContext.tsx # Writable state + optimistic mutations (CRUD for all entities)
    DataContext.tsx    # Read-only data fetching for all entities
  data/
    mockData.ts       # Fallback mock data (used when API unavailable in demo mode)
  pages/              # 22 feature pages (one folder each — see Features below)
  types/
    index.ts          # All TypeScript interfaces, PageId type
  App.tsx             # Root component — auth, page routing, layout
  main.tsx            # Entry point
```

## Running Locally

```bash
npm install
npm run dev          # Vite dev server → http://localhost:5173
npm run build        # tsc -b && vite build → dist/
npm run preview      # Preview production build
```

**Environment**: Set `VITE_API_URL` in `.env` (defaults to `http://localhost:8080/api/v1`).

## Architecture

### Routing
Client-side page switching via React state (`currentPage` in App.tsx), NOT react-router-dom URL routing. Pages rendered by `pages[currentPage]` lookup. Page IDs defined in `types/index.ts` as `PageId` type.

### Auth
JWT Bearer token stored in localStorage (`bh_token`). Login via `/api/v1/auth/login`, token attached to all API requests. Demo mode auto-logs in with `admin@beardedhop.com` / `BrewDay2026!`. "Explore Demo" button on login page for demo access.

### API Pattern
- `src/api/client.ts` wraps fetch with auth headers and 401 handling
- API returns snake_case, frontend uses camelCase — conversion in both contexts
- Abbreviation fields (OG, FG, ABV, IBU, SRM) have special camelCase mapping in DataContext
- Optimistic updates: local state updated immediately, API call fires in background
- Both BreweryContext and DataContext fetch all data on mount via `fetchAll()`

### State Management
- **DataContext** (`useData()`) — read-only data for display pages (beers, financials, staff, wholesale)
- **BreweryContext** (`useBrewery()`) — mutable state with CRUD operations (tabs, taps, batches, inventory, recipes, kegs, menu items)

### Path Alias
`@` maps to `src/` (configured in vite.config.ts and tsconfig.app.json).

## Features (Pages)

| Page ID | Description |
|---------|-------------|
| dashboard | Main overview with KPIs |
| production | Tank farm grid, batch pipeline, brew calendar, gravity charts |
| pos | Point-of-sale terminal for taproom |
| floor-plan | Visual table management, seating, service alerts |
| taps | Tap line management (what's pouring) |
| brewing | Production & brewing operations |
| recipes | Recipe Lab — full CRUD for detailed recipes |
| kegs | Keg tracking — full CRUD |
| inventory | Inventory management — full CRUD |
| menu | Food & menu engineering — full CRUD |
| customers | Customer management with detail view |
| mug-club | Bearded Hop Mug Club loyalty program |
| taproom-analytics | Taproom sales analytics |
| financials | Financial command center |
| events | Events & entertainment scheduling |
| reservations | Table reservations |
| staff | Staff management |
| distribution | Distribution & wholesale accounts |
| marketing | Email campaigns & marketing |
| reports | Reports & analytics |
| settings | Business settings & compliance |

## API Endpoints

Key routes used by the frontend:
- `/auth/login`, `/auth/me` — authentication
- `/beers/`, `/taps/`, `/batches/`, `/batches/{id}/advance-status`, `/batches/{id}/gravity-readings` — beer & brewing
- `/customers/`, `/reservations/`, `/events/`, `/performers/` — CRM
- `/pos/tabs/`, `/pos/tabs/{id}/items`, `/pos/tabs/{id}/close` — point of sale
- `/floor-plan/tables`, `/floor-plan/tables/{id}/seat`, `/floor-plan/tables/{id}/clear`, `/floor-plan/alerts` — floor management
- `/inventory/`, `/menu-items/`, `/kegs/`, `/detailed-recipes/` — operations
- `/financials/daily-sales`, `/financials/monthly` — financials
- `/staff/`, `/distribution/accounts`, `/mug-club/`, `/marketing/campaigns` — other
- `/settings/`, `/settings/compliance` — configuration

## Production Deployment

- **Frontend**: https://brewery-frontend-production.up.railway.app
- **Backend API**: https://bearded-hop-api-production.up.railway.app/api/v1
- **Health check**: https://bearded-hop-api-production.up.railway.app/ping
- **Platform**: Railway (auto-deploys from GitHub push)
- **Build command**: `tsc -b && vite build` (outputs to `dist/`)
- **Deploy time**: ~90s after push to GitHub
- **Backend repo**: `~/bearded-hop-api` (FastAPI/Python)

## Known Patterns & Pitfalls

- **snake_case/camelCase bugs are the #1 source of issues** — watch for abbreviation fields (OG, FG, ABV, IBU, SRM) and nested objects
- `toSnakeKeys()` in BreweryContext only converts top-level keys — nested objects need manual handling
- UUID fields must be valid UUIDs or omitted entirely (never empty strings or fake IDs like "cust-123")
- Nested objects (like `yeast` in recipes) must be valid dicts, not null
- Recharts crashes on null data — always null-check before rendering charts
- CSS custom color scheme uses `brewery-*` classes (e.g., `bg-brewery-950`, `text-brewery-400`)
- Pour Analytics uses CSS bars instead of Recharts (previous Recharts implementation crashed)
- Demo auth falls back to mock data when API is unavailable
- Modal/SlidePanel components use `role="dialog"` with aria-modal for accessibility
- Sidebar nav items match exact text: Dashboard, POS, Floor Plan, etc.

## Priority

Build production dashboard with live brewery metrics: real-time taproom sales, keg levels, fermentation status. This is the #1 differentiator.

## Development Rules

1. **ALWAYS push to GitHub** after every commit — no exceptions
2. **ALWAYS test with Playwright** after making changes to verify features work in the browser
3. If Playwright shows something is broken:
   - Build a plan to fix it
   - Execute the fix
   - Test again with Playwright
   - If still broken, repeat — up to 30 iterations max
4. Only declare success when Playwright confirms the feature works visually
5. Never claim something works without Playwright verification
