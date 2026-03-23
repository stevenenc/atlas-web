AtlasScope web is a `next@16.2.0` App Router frontend that now exposes a first-party frontend API
boundary for backend reads instead of letting routes call upstream services directly.

## Documentation

Project documentation now lives in [`docs/`](./docs/README.md).

- Architecture audit: [`docs/architecture/frontend-hld-audit.md`](./docs/architecture/frontend-hld-audit.md)
- Frontend delivery contract: [`docs/architecture/frontend-system-contract.md`](./docs/architecture/frontend-system-contract.md)

## Getting Started

Set the backend contract before running the app:

```bash
cp .env.example .env.local
```

Required and recommended variables:

- `ATLAS_API_BASE_URL`: upstream backend or API gateway origin used by the frontend server
- `ATLAS_GEOFENCE_REVALIDATE_SECONDS`: shared cache window for geofence reads, defaults to `60`
- `ATLAS_API_TIMEOUT_MS`: upstream fetch timeout, defaults to `8000`
- `ATLAS_ENABLE_STUB_SHELL_DATA`: set to `false` to disable temporary stub incidents and notifications
- `NEXT_PUBLIC_ATLAS_BASEMAP_STYLE_URL`: optional first-party CDN path or external basemap style URL

Then run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
