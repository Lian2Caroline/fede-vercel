---
name: @swc/helpers must be bundled in esbuild serverless
description: @swc/helpers is not available at runtime on Vercel — must NOT be in the externals list of build.mjs
---

## Rule
Never externalize `@swc/*` in `artifacts/api-server/build.mjs` for Vercel serverless functions.

**Why:** Some npm packages are compiled with SWC and carry a runtime dependency on `@swc/helpers`. Esbuild externalizes it, meaning it expects the package to be available at runtime. But Vercel's function runtime only bundles what's in the project root `node_modules` at the path the function resolves — and `@swc/helpers` is not guaranteed to be there. Result: `Cannot find module '@swc/helpers/cjs/_define_property.cjs'` → `FUNCTION_INVOCATION_FAILED` on every request.

**How to apply:** If a new dependency causes this pattern again (module load fails with `@swc/*` or similar helper packages), remove the offending pattern from the `external` array in `build.mjs` and rebuild.

## Also fixed in same session
- Module-level `throw` / `process.exit(1)` for missing env vars causes `FUNCTION_INVOCATION_FAILED` too — use `console.error` fallbacks instead.
- `api/index.js` should use dynamic `import()` so module load errors are catchable and returned as JSON (not opaque Vercel error page).
- `@workspace/db run push-force` added to Vercel buildCommand so schema is always applied before runtime.
