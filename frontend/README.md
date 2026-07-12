# TransitOps Frontend

React + Vite SPA that consumes the backend REST API (`/api/...`).

## Stack

- React 19 + React Router
- Plain CSS (design tokens in `src/index.css`) — no UI framework dependency
- Fonts: Fraunces (headings), Inter (body), JetBrains Mono (labels/data)

## Getting started

```
npm install
npm run dev
```

Runs on `http://localhost:5174` by default (see `vite.config.js`). Set
`VITE_API_URL` in a `.env` file if the backend isn't on `http://localhost:8080/api`.

## Structure

- `src/api.js` — fetch helpers + JWT token storage. `login()` hits the real
  `/api/auth/login` endpoint; `apiRequest()` is a generic authenticated
  fetch wrapper for everything else.
- `src/data/mockData.js` — placeholder data shaped like the DB schema, used
  by every page except Login until the matching backend route is
  implemented. Swap a page's mock import for an `apiRequest()` call once its
  route stops being a `TODO` in `backend/src/routes/`.
- `src/components/` — `Layout` (sidebar + outlet), `StatTile`, `StatusBadge`.
- `src/pages/` — one file per section: Login, Dashboard, Vehicles, Drivers,
  Trips, Maintenance, FuelExpense, Reports.

## Design system

Defined as CSS variables at the top of `src/index.css` — warm paper
background, dark ink text/borders, a small accent palette used only for
status badges (available/on_trip/in_shop/retired/suspended, etc.). Change the
variables there to retheme everything at once.
