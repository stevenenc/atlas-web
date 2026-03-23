# Frontend System Contract

Date: March 23, 2026

## Chosen Delivery Model

The frontend now follows a CDN-first model:

- Route shells stay first-party and cache-friendly.
- Browser reads go through first-party frontend API routes under `/api/geofences`.
- The frontend server is the only part of this repo that knows the upstream backend origin.
- Geofence API responses publish shared-cache headers for CDN or gateway caching.

## Frontend-To-Backend Boundary

The repository now encodes the backend dependency in one place:

- Server-side upstream client: `src/lib/backend-api.ts`
- First-party browser facade: `src/app/api/geofences/route.ts`
- First-party browser facade: `src/app/api/geofences/[id]/route.ts`

Expected upstream endpoints:

- `GET /api/geofences`
- `GET /api/geofences/:id`

The frontend assumes these routes are served by an API gateway or backend edge tier at
`ATLAS_API_BASE_URL`.

## Cache Contract

Geofence reads use a bounded shared cache window instead of `no-store`.

- Shared cache header: `public, max-age=0, s-maxage=<window>, stale-while-revalidate=<window*5>`
- Default window: `60` seconds
- Override with `ATLAS_GEOFENCE_REVALIDATE_SECONDS`

This prepares the repo for CDN and gateway caches without requiring the browser to know the
upstream origin.

## Route Behavior

`/`

- Static map shell
- Geofences load client-side from `/api/geofences`
- Incidents and notifications go through explicit temporary adapters in
  `src/features/atlascope/data/shell-bootstrap.ts`

`/geofences`

- Static route shell
- Reads load client-side from `/api/geofences`
- Loading and failure states are explicit in the route and feature UI

`/geofences/[id]`

- Static-friendly dynamic route shell
- Reads load client-side from `/api/geofences/:id`
- Route-level `loading.tsx`, `error.tsx`, and `not-found.tsx` are present

## Environment Variables

`ATLAS_API_BASE_URL`

- Required in production
- Points at the backend API gateway or upstream service entrypoint

`ATLAS_GEOFENCE_REVALIDATE_SECONDS`

- Optional
- Controls the shared cache lifetime for geofence reads

`ATLAS_API_TIMEOUT_MS`

- Optional
- Controls the server-side timeout used when the frontend calls the backend

`ATLAS_ENABLE_STUB_SHELL_DATA`

- Optional
- Defaults to stub incidents and notifications until their backend contracts exist
- Set to `false` to disable those temporary adapters

`NEXT_PUBLIC_ATLAS_BASEMAP_STYLE_URL`

- Optional
- Lets infrastructure move the basemap style behind a first-party CDN path without changing code

## Current Gaps Still Outside This Repo

This repo still does not prove:

- DNS routing
- CDN vendor configuration
- Load balancer topology
- API gateway implementation details
- backend microservice boundaries
- cache-to-database topology

Those layers must be documented in infrastructure repositories or deployment manifests if
end-to-end HLD traceability is required.
