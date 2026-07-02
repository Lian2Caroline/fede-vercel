# FEDE — Fonds Européen de Développement Économique

Platform for non-reimbursable subventions across Europe (27 EU countries). Fee: 456€ TTC (Article L1611-2 CGCT). Domain placeholder: fede-financement.com (update when final domain is registered).

## Run & Operate

- `pnpm --filter @workspace/api-server run dev` — run API server (port 8080)
- `pnpm --filter @workspace/financedom run dev` — run web frontend (port 24957)
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- Required env: `DATABASE_URL`, `SESSION_SECRET`, `RESEND_API_KEY`, `RESEND_FROM`, `CORS_ORIGIN`, `FRONTEND_URL`, `ADMIN_EMAIL`, `NODE_ENV=production`

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- Web: React + Vite (Tailwind v4, shadcn/ui, wouter)
- Mobile: Expo React Native (`artifacts/capsubvention-mobile`)
- API: Express 5 with session auth
- DB: PostgreSQL + Drizzle ORM
- Validation: Zod, drizzle-zod
- API codegen: Orval (from OpenAPI spec)
- Build: esbuild
- Email: SendPulse SMTP relay

## Where things live

- `artifacts/financedom/` — React+Vite web portal
- `artifacts/capsubvention-mobile/` — Expo mobile app
- `artifacts/api-server/src/routes/` — Express route handlers
- `lib/api-spec/openapi.yaml` — OpenAPI spec (source of truth for API)
- `lib/db/src/schema/` — Drizzle DB schema
- `lib/api-client-react/src/generated/` — generated React Query hooks
- `lib/api-zod/src/generated/` — generated Zod schemas
- `artifacts/financedom/src/index.css` — Tailwind theme (Navy `#0D1F3C`, Gold `#B5872A`, Background `#F1F4FA`)
- `artifacts/api-server/src/lib/sendpulse.ts` — email templates
- `artifacts/api-server/src/routes/auth.ts` — auth routes (OTP + 2FA)
- `artifacts/api-server/src/routes/dossiers.ts` — dossier CRUD + emails
- `artifacts/api-server/src/routes/admin.ts` — admin actions

## Architecture decisions

- Session-based auth (express-session + connect-pg-simple), not JWT — simpler for this use case
- Email OTP for new-IP 2FA: new devices trigger a verification code sent via SendPulse SMTP
- PDF generation via pdfkit for invoices (frais)
- API routes proxied through Replit shared proxy — frontend uses relative `/api/...` paths
- Mobile app shares the same Express API backend

## Product

- Landing page with public info (why, eligible projects, process, FAQ, reviews)
- Auth flow: register → email verification → login with optional 2FA on new IPs
- User portal: dashboard stats, dossier creation/tracking, document upload, messaging, fee payment
- Admin portal: dossier review, status updates, fee emission, user management
- Mobile companion app (Expo) for on-the-go dossier tracking

## User preferences

_Populate as you build — explicit user instructions worth remembering across sessions._

## Gotchas

- `pnpm dev` at workspace root has no script — use workflow or `pnpm --filter <pkg> run dev`
- DB schema push: `pnpm --filter @workspace/db run push` (uses drizzle-kit)
- After changing `lib/api-spec/openapi.yaml`, always re-run codegen before using types
- Mobile artifact port: 21124; web port: 24957; API port: 8080
- WhatsApp placeholder `33600000000` in `WhatsAppButton.tsx` — replace before production

## Pointers

- `pnpm-workspace` skill for monorepo structure
- `react-vite` skill for frontend patterns
- `expo` skill for mobile patterns
