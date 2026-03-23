# Frontend Audit Against Target Scalable Web System HLD

Date: March 23, 2026

Scope: frontend-repo-only audit of `atlas-web`

## Objective

Evaluate whether the current frontend implementation aligns with the target high-level design shown in the reference image:

1. DNS layer
2. CDN layer
3. Load balancer layer
4. API gateway
5. Microservices
6. Cache layer
7. Database layer

This audit is intentionally limited to what can be proven from the frontend repository. It does not assume undocumented infrastructure exists elsewhere.

## Executive Summary

The current frontend only partially aligns with the target HLD.

What is aligned:

- The project is separated from the backend by an HTTP API boundary rather than direct database access.
- The home route builds as static content, which can fit a CDN-backed delivery model.
- The map stack includes a local fallback style path if the remote basemap style fails to load.

What is not yet aligned:

- The geofence pages are dynamically server-rendered and force uncached upstream reads on every request.
- The frontend still contains prototype-grade mock data for the main AtlasScope shell.
- There is no repo evidence for DNS, CDN, load balancer, API gateway, cache, or database topology.
- Third-party map styles are fetched directly from an external host instead of a first-party CDN path.
- Route-level failure handling is thin; no `error.tsx` or `loading.tsx` files were found under `src/app/`.

Bottom line:

- If external infrastructure already exists, this repo does not document or encode that architecture clearly enough.
- If this repo is expected to reflect the target HLD by itself, it is not there yet.

## Audit Method

The review used repository inspection plus production verification:

- Inspected routing, data access, config, map loading, and UI state flow
- Ran `npm run build`
- Ran `npm run lint`

Build result at audit time:

- `/` built as static content
- `/geofences` built as dynamic server-rendered content
- `/geofences/[id]` built as dynamic server-rendered content

## Current Frontend Shape

The application is a `next@16.2.0` App Router project with a minimal `next.config.ts`.

Key characteristics:

- The home page renders a client-side AtlasScope shell.
- The main AtlasScope shell still uses mock incidents, mock geofences, and mock notifications.
- The geofence listing and detail pages fetch data from a configurable upstream API.
- Those geofence fetches disable caching with `cache: "no-store"`.
- The API base URL falls back to `http://localhost:5199` if `NEXT_PUBLIC_API_BASE_URL` is missing.
- Map styles are loaded directly from `https://tiles.openfreemap.org/styles/liberty`.

## Layer-By-Layer Alignment

| HLD Layer | Target Intent | Evidence in Frontend Repo | Alignment |
| --- | --- | --- | --- |
| DNS | Route users to the nearest infrastructure | No DNS config, infrastructure manifests, or deployment descriptors found in this repo | Not verifiable |
| CDN | Serve static assets and edge-cacheable frontend content | `/` is static, but geofence pages are dynamic; no CDN config or cache headers are defined here; map assets come from third-party infra | Partial |
| Load Balancer | Distribute traffic across frontend and backend tiers | No load balancer config, rewrites, or proxy layer are represented in this repo | Not verifiable |
| API Gateway | Present a single controlled API entrypoint | The frontend calls one configurable API origin, but there is no gateway contract, proxy route, or first-party API facade in the repo | Weak partial |
| Microservices | Backend services behind a gateway | The frontend implies backend services exist, but the repo does not expose or document those service boundaries | Not verifiable |
| Cache | Reduce repeated upstream and database load | Geofence reads are explicitly uncached; only map-style Promise caching exists in browser memory | Weak |
| Database | Persistent storage behind services | The frontend does not touch a database directly, which is good, but the actual DB architecture is outside repo scope | Indirectly aligned but not verifiable |

## Detailed Findings

### 1. DNS Layer

Status: not verifiable from this repository

Why:

- No DNS provider configuration, no deployment manifests, and no infrastructure-as-code files were found.
- The frontend repo alone does not show geo-routing, latency-based routing, or regional failover behavior.

Implication:

- The target HLD may exist operationally elsewhere, but there is no frontend-side documentation or configuration proving it.

### 2. CDN Layer

Status: partial alignment

What supports alignment:

- The home page is static and can be served efficiently through a CDN.
- Fonts are handled through `next/font`, which supports optimized asset delivery.

What breaks alignment:

- The geofence pages are dynamic and therefore do not behave like edge-cached static frontend content.
- Geofence data fetches use `cache: "no-store"`, which forces a fresh upstream request on each render.
- No cache-control strategy, ISR policy, or explicit revalidation contract is represented in the repo.
- Basemap styles are fetched directly from a third-party host rather than a first-party CDN path.

Implication:

- This frontend is currently closer to "SSR application with some static assets" than "CDN-first frontend tier."

### 3. Load Balancer Layer

Status: not verifiable from this repository

Why:

- No frontend deployment config, reverse-proxy config, ingress config, or rewrites are present.
- The frontend simply calls a single API base URL rather than describing how traffic is distributed behind it.

Implication:

- The target load balancer layer may exist outside this repo, but the frontend does not document the contract.

### 4. API Gateway Layer

Status: weak partial alignment

What supports alignment:

- The geofence pages do not query a database directly; they call an HTTP API.
- There is one configurable API origin, which could point at an API gateway in deployment.

What weakens alignment:

- The repo does not define or document that upstream as an API gateway.
- The frontend has no first-party proxy route, no rewrite layer, and no request shaping or resilience policy.
- The `localhost` fallback is a development convenience, not a production-safe deployment contract.

Implication:

- The API layer is conceptually present, but the gateway architecture is not encoded clearly enough in the frontend.

### 5. Microservice Layer

Status: not verifiable from this repository

Why:

- The HLD shows multiple backend services behind the gateway, but this frontend only demonstrates one geofence API path.
- No service catalog, backend capability map, or contract documentation appears in the repo.

Implication:

- The frontend does not currently serve as evidence that the backend architecture matches the HLD.

### 6. Cache Layer

Status: weak alignment

Current behavior:

- Geofence fetches use `cache: "no-store"`, bypassing Next.js fetch caching.
- No `revalidate`, `force-cache`, `unstable_cache`, SWR, or React Query usage was found.
- The only visible caching behavior is an in-memory Promise cache for remote map styles in the browser.

What this means:

- The frontend is not helping reduce upstream or downstream load for geofence reads.
- The caching model in the HLD is not reflected meaningfully in the application behavior.

### 7. Database Layer

Status: indirectly aligned, but not verifiable

What is good:

- The frontend does not access any database directly.
- Data access is mediated through backend HTTP endpoints.

What cannot be proven:

- SQL versus NoSQL choices
- read replicas
- sharding
- partitioning
- cache-to-database interaction

Implication:

- The frontend is at least not violating the HLD by coupling directly to persistence, but it does not prove the database design either.

## Significant Architecture Gaps

### Dynamic Uncached Geofence Pages

The geofence pages are rendered dynamically and fetch upstream data without caching.

Why it matters:

- This conflicts with the CDN-heavy frontend path shown in the target HLD.
- It increases dependency on backend responsiveness for page delivery.
- It reduces the value of edge caching for read-heavy traffic.

### Prototype Data Still Drives the Main Product Shell

The most visible product route, `/`, renders a client shell backed by mock incidents and mock geofences.

Why it matters:

- The main application experience does not yet validate the intended service architecture.
- It makes the frontend look more integrated than it actually is.
- Architectural readiness is overstated if the primary workflow is still mock-backed.

### Production Contract Depends on a Localhost Fallback

The frontend falls back to `http://localhost:5199` when the public API base URL is missing.

Why it matters:

- That is safe only for local development.
- In deployment, a missing environment variable can silently redirect SSR requests to the wrong target.
- This makes the API boundary brittle and harder to debug.

### Thin Failure Handling for Upstream Problems

No route-level `error.tsx` or `loading.tsx` files were found under `src/app/`.

Why it matters:

- If the geofence API is slow or unavailable, the user experience depends on default failure behavior.
- A layered HLD still needs explicit frontend degradation behavior when upstream layers fail.

### External Basemap Dependency Bypasses First-Party Delivery Controls

The map style is loaded directly from `tiles.openfreemap.org`.

Why it matters:

- Availability and cache behavior are delegated to third-party infrastructure.
- This can be acceptable, but it does not match a first-party CDN story unless documented as intentional.

## Repo Evidence

Primary evidence used in this audit:

- `next.config.ts:1-8`
- `src/app/layout.tsx:7-13`
- `src/app/page.tsx:1-5`
- `src/app/geofences/page.tsx:1-16`
- `src/app/geofences/[id]/page.tsx:1-45`
- `src/lib/api.ts:1-40`
- `src/features/atlascope/components/shell/atlascope-shell.tsx:1-219`
- `src/features/atlascope/hooks/use-atlascope-geofences.ts:21-178`
- `src/features/atlascope/components/panels/notification/notification-panel.tsx:1-31`
- `src/features/atlascope/map/core/config.ts:36-66`
- `src/features/atlascope/map/style/style.ts:10-31`

Additional repository observations:

- No `middleware.ts` found
- No `route.ts` files found under `src/app/`
- No `error.tsx` or `loading.tsx` files found under `src/app/`
- No infrastructure manifests or deployment descriptors found in the repo root

## Recommended Remediation Plan

### Priority 0: Make the Deployment Contract Safe

1. Remove the silent `localhost` fallback for production-facing API reads.
2. Document the required environment variables and expected upstream API origin.
3. Add route-level `error.tsx` and `loading.tsx` files for the geofence pages.

### Priority 1: Decide the Intended Frontend Delivery Model

Choose one of these two models and implement it consistently:

1. CDN-first frontend
   - Keep pages mostly static or revalidated.
   - Fetch mutable data client-side behind a controlled API boundary.
   - Push caching policy toward CDN and edge delivery.
2. SSR application tier
   - Accept that the frontend is an application layer behind the load balancer.
   - Add explicit caching, resilience, and gateway documentation.
   - Do not describe the frontend as primarily CDN-served if dynamic SSR is the norm.

### Priority 1: Replace Mock-Backed Product Flows

1. Replace mock incidents, mock geofences, and mock notifications in the main shell with real read models or explicit temporary adapters.
2. Document which panels are live, which are mocked, and which backend contracts are still pending.

### Priority 1: Clarify the API Gateway Boundary

1. Route frontend API calls through a clearly documented first-party boundary.
2. If the upstream really is an API gateway, name it in docs and define the expected origin pattern.
3. Consider first-party rewrites or route handlers if you want the frontend repo to express that boundary directly.

### Priority 2: Add a Real Cache Strategy

1. For read-mostly geofence data, evaluate `revalidate` or a bounded cache window instead of `no-store`.
2. For client-driven read flows, evaluate SWR or React Query.
3. Document which data must be strongly fresh and which can tolerate brief staleness.
4. Decide whether map styles and tiles should stay third-party-hosted or move behind your own delivery controls.

### Priority 2: Document the Missing Infrastructure Story

1. Add a deployment architecture document that maps frontend behavior to DNS, CDN, load balancer, gateway, cache, and service layers.
2. Link that document from the repo root and keep it versioned with the code.
3. If infrastructure lives in another repository, add direct references here so the architecture is auditable end-to-end.

## Suggested Success Criteria

The frontend will be much closer to the target HLD when the following are true:

- The production API origin is explicit and validated.
- Read-heavy pages no longer force fully uncached renders unless there is a hard business reason.
- The main product shell is backed by real service data rather than mock fixtures.
- Failure handling is visible and intentional at route boundaries.
- The repo documents how the frontend sits behind DNS, CDN, load balancer, and API gateway layers.

## Verification Performed

Commands run during this audit:

- `npm run build`
- `npm run lint`

Results:

- Build passed.
- Lint passed.
- Build output classified `/` as static and `/geofences` plus `/geofences/[id]` as dynamic.

## Final Conclusion

The current frontend does not fully follow the target scalable web system HLD.

The strongest alignment today is the basic separation between frontend and backend through HTTP APIs. The biggest gaps are the uncached dynamic geofence pages, prototype data still powering the main application shell, and the absence of documented or encoded infrastructure boundaries for CDN, load balancing, gateway, and caching layers.

This repo should be treated as a partially aligned frontend prototype with some production-ready pieces, not as a frontend that already proves the full HLD.
