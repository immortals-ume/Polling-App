# Polling App Frontend

Next.js (App Router) + TypeScript + MUI client for the Polling App.

## Development

```bash
npm install
cp .env.example .env.local   # adjust NEXT_PUBLIC_API_BASE_URL if needed
npm run dev
```

The dev server runs at http://localhost:3000. It expects `polling-app-server`
to be running at the URL configured in `NEXT_PUBLIC_API_BASE_URL`
(defaults to `http://localhost:8081/api`, matching the server's local dev
`server.port`).

## Production build

```bash
npm run build
npm run start
```

`npm run build` uses `output: "standalone"` (see `next.config.ts`), which is
what the production `Dockerfile` copies out of the build stage.

## Type-checking & linting

```bash
npm run typecheck
npm run lint
```

## Notes

- Authentication is a JWT stored in `localStorage`, sent as a `Bearer` token
  on every API call — the same client-side-only auth model as the previous
  CRA app. There's no server-rendered session, so the `/poll/new` route guard
  is a client-side redirect, not a true server-protected route.
- UI is built from a small custom component layer in `components/ui/`
  (`AppButton`, `AppCard`, `AppTextField`, `UserAvatar`, `PageLoading`) on top
  of MUI v6 primitives, themed via `theme.ts`.
