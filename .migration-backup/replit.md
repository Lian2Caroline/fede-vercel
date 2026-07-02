# CapSubvention — Workspace

## Overview

pnpm workspace monorepo using TypeScript. Platform for non-reimbursable subventions for the 5 French overseas territories. Fee: 456€ TTC (Article L1611-2 CGCT).

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **API framework**: Express 5
- **Database**: PostgreSQL + Drizzle ORM (`lib/db/`)
- **Validation**: Zod (`zod/v4`), `drizzle-zod`
- **Build**: esbuild (CJS bundle)
- **Email**: SendPulse SMTP relay (smtp-pulse.com port 465)

## Artifacts

| Artifact | Directory | Description |
|---|---|---|
| API Server | `artifacts/api-server` | Express 5 REST API |
| Web App | `artifacts/financedom` | React + Vite web portal |
| Mobile App | `artifacts/capsubvention-mobile` | Expo React Native |

## Key Commands

- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-server run dev` — run API server locally
- Run in `lib/db/`: `pnpm run push-force` — push DB schema changes

## Environment Variables Required

| Variable | Description |
|---|---|
| `SESSION_SECRET` | Express session secret (set) |
| `DATABASE_URL` | PostgreSQL connection string (auto) |
| `SENDPULSE_SMTP_USER` | SendPulse SMTP username |
| `SENDPULSE_SMTP_PASS` | SendPulse SMTP password |
| `SENDPULSE_FROM` | Sender address (e.g. noreply@capsubvention.fr) |

## Auth Flow

1. **Register** → POST `/api/auth/register` → 202 + `requiresEmailVerification`
2. **Verify email** → POST `/api/auth/verify-email` with OTP code
3. **Login** (known IP) → POST `/api/auth/login` → 200 + session cookie
4. **Login** (new IP) → 202 + `requiresVerification` → POST `/api/auth/verify-code` with 2FA code

## Key Files

- `artifacts/api-server/src/lib/sendpulse.ts` — all email templates
- `artifacts/api-server/src/routes/auth.ts` — auth routes incl. OTP/2FA
- `artifacts/api-server/src/routes/dossiers.ts` — dossier CRUD + emails
- `artifacts/api-server/src/routes/admin.ts` — admin actions + emails
- `lib/db/src/schema/users.ts` — users table with emailVerified + lastLoginIp
- `artifacts/financedom/src/hooks/use-auth.tsx` — web auth state machine
- `artifacts/financedom/src/App.tsx` — global VerifyEmail overlay
- `artifacts/capsubvention-mobile/contexts/AuthContext.tsx` — mobile auth context
- `artifacts/capsubvention-mobile/app/_layout.tsx` — mobile routing + pendingVerification guard

## Brand

- **Colors**: Navy `#0D1F3C`, Gold `#B5872A`, Background `#F1F4FA`
- **Email support**: support@capsubvention.fr
- **Email sender**: noreply@capsubvention.fr
- **WhatsApp**: placeholder `33600000000` in `WhatsAppButton.tsx` — replace before production
