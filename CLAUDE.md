# BreweryCRM (Bearded Hop Brewery)

Full-stack brewery CRM and taproom management platform for Bearded Hop Brewery in Bulverde, TX.

## Tech Stack

- **Frontend**: React 19 + TypeScript + Vite 7
- **Styling**: Tailwind CSS 4 (via `@tailwindcss/vite` plugin)
- **State**: React Context (BreweryContext for mutations, DataContext for read-only data)
- **Data fetching**: Direct fetch via `src/api/client.ts` (no react-query usage currently despite dependency)
- **Charts**: Recharts 2
- **Icons**: Lucide React
- **Dates**: date-fns 4
- **Testing**: Playwright (browser verification)
- **Backend**: FastAPI (Python) at `~/bearded-hop-api` — separate repo

## Project Structure

```
src/
  api/
    client.ts         # API client with Bearer auth, snake_case/camelCase conversion
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
    mockData.ts       # Fallback mock data
  pages/              # One folder per feature page (see Features below)
  types/
    index.ts          # All TypeScript interfaces
  App.tsx             # Root component — handles auth, page routing, layout
  main.tsx            # Entry point
```

## Running Locally

```bash
npm install
npm run dev          # Vite dev server (default: http://localhost:5173)
npm run build        # TypeScript check + Vite production build
npm run preview      # Preview production build
```

**Environment**: Set `VITE_API_URL` in `.env` (defaults to `http://localhost:8080/api/v1`).

## Architecture

### Routing
Client-side page switching via React state (`currentPage` in App.tsx), NOT react-router-dom URL routing. Pages selected from sidebar, rendered by `pages[currentPage]` lookup. Page IDs defined in `types/index.ts` as `PageId` type.

### Auth
JWT Bearer token stored in localStorage (`bh_token`). Login via `/api/v1/auth/login`, token attached to all API requests. Demo mode auto-logs in with `admin@beardedhop.com` / `BrewDay2026!`.

### API Pattern
- `src/api/client.ts` wraps fetch with auth headers and 401 handling
- API returns snake_case, frontend uses camelCase — conversion in both contexts
- Abbreviation fields (OG, FG, ABV, IBU, SRM) have special camelCase mapping in DataContext
- Optimistic updates: local state updated immediately, API call fires in background
- Both BreweryContext and DataContext fetch all data on mount via `fetchAll()`

### State Management
Two context providers wrap the app:
- **DataContext** (`useData()`) — read-only data for display pages (beers, financials, staff, wholesale, etc.)
- **BreweryContext** (`useBrewery()`) — mutable state with CRUD operations (tabs, taps, batches, inventory, recipes, kegs, menu items, etc.)

### Path Alias
`@` maps to `src/` (configured in vite.config.ts).

## Features (Pages)

| Page ID | Component | Description |
|---------|-----------|-------------|
| dashboard | DashboardPage | Main overview with KPIs |
| production | ProductionPage | Tank farm grid, batch pipeline, brew calendar, gravity charts |
| pos | POSPage | Point-of-sale terminal for taproom |
| floor-plan | FloorPlanPage | Visual table management, seating, service alerts |
| taps | TapsPage | Tap line management (what's pouring) |
| brewing | BrewingPage | Production & brewing operations |
| recipes | RecipesPage | Recipe Lab — full CRUD for detailed recipes |
| kegs | KegsPage | Keg tracking — full CRUD |
| inventory | InventoryPage | Inventory management — full CRUD |
| menu | MenuPage | Food & menu engineering — full CRUD |
| customers | CustomersPage | Customer management with detail view |
| mug-club | MugClubPage | Bearded Hop Mug Club loyalty program |
| taproom-analytics | TaproomAnalyticsPage | Taproom sales analytics |
| financials | FinancialsPage | Financial command center |
| events | EventsPage | Events & entertainment scheduling |
| reservations | ReservationsPage | Table reservations |
| staff | StaffPage | Staff management |
| distribution | DistributionPage | Distribution & wholesale accounts |
| marketing | MarketingPage | Email campaigns & marketing |
| reports | ReportsPage | Reports & analytics |
| settings | SettingsPage | Business settings & compliance |

## Production Deployment

- **Frontend**: https://bearded-hop-frontend-production.up.railway.app
- **Backend API**: https://bearded-hop-api-production.up.railway.app/api/v1
- **Platform**: Railway
- **Build command**: `tsc -b && vite build` (outputs to `dist/`)
- **Backend repo**: `~/bearded-hop-api` (FastAPI/Python)

## Priority

Build production dashboard with live brewery metrics: real-time taproom sales, keg levels, fermentation status. This is the #1 differentiator. The ProductionPage already has TankFarmGrid, BatchPipeline, BrewCalendar, GravityChart, TankCard, TankDetailPanel, QualityBadge, and ScheduleBrewModal components.

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

## Known Patterns & Pitfalls

- snake_case/camelCase bugs are common — watch for abbreviation fields (OG, FG, ABV, IBU, SRM)
- Recharts can crash on null data — always null-check before rendering charts
- CSS custom color scheme uses `brewery-*` classes (e.g., `bg-brewery-950`, `text-brewery-400`)
- The app uses two separate contexts that both fetch overlapping data — be aware of which one a page uses
- Pour Analytics previously crashed due to broken recharts charts — replaced with CSS bars
- Demo auth uses fallback mock data when API is unavailable
- Deep camelCase mapping is needed for nested API objects (not just top-level fields)
