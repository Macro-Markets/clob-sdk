# Developer distribution readiness — 2026-10-22

## Scope and boundaries

Official repository: https://github.com/Macro-Markets/clob-sdk

This change prepares the existing SDK and CLI for publication. It does not create a
duplicate CLI, change the server's authentication, submit financial transactions,
modify the CMS, or publish a paid marketplace plan. MIT and the upstream copyright
notice are preserved.

The public API is GraphQL at `https://acp.macro.markets/@`. The previously documented
`/graphql` route returned HTTP 404. No production credentials were used in these tests.

## Local checks

- Node.js 22.22.2, pnpm 9.15.4, frozen-lockfile installation completed.
- `pnpm lint`: exit 0; two existing non-null assertion warnings in `src/cli/format.ts`.
- `pnpm test`: 47 passing, exit 0. New tests cover token-free public reads,
  non-interactive stdout/JSON, and refusal of private commands before HTTP without a
  token. HTTP fixtures run on disposable localhost servers, without a database.
- `pnpm build`: exit 0, including ESM, CLI and declarations.
- `pnpm exec tsc --noEmit`: exit 0.
- Targeted lint of the new CLI tests: exit 0.
- `git diff --check`: exit 0.

The existing mocked Apollo fixtures emit missing-field warnings. Existing coverage
instrumentation reports zero coverage despite passing tests; this is not presented
as a measured coverage improvement.

## Package consumer and online read-only checks

- `npm pack --dry-run` and `npm pack` completed. The allowlist contains built code,
  README, MIT license, package metadata and documentation; no `.env`, token, tests or
  local configuration.
- Installed the resulting tarball in a fresh consumer directory with npm.
- The installed `market-sdk --version` returned `1.0.0`.
- The installed CLI returned valid JSON from `markets list --first 1 --json`, without
  `API_TOKEN`: one actual market and paginator total 209 at the time of testing.
- Importing `createGraphQLClient` from the installed package succeeded. Its public
  `markets()` call returned one market and paginator total 209.
- Built SDK calls to markets, market details, categories and an actual outcome's
  order book succeeded without a token. No order was placed or cancelled.
- Both requests in the RapidAPI Postman collection returned HTTP 200 with no GraphQL
  errors before import. JSON bodies and GraphQL syntax were validated. The RapidAPI
  importer then merged the same-method/path examples inconsistently; the collection
  was consolidated into one actual GraphQL POST with both public reads. The combined
  request returned HTTP 200, no GraphQL errors, five markets and ten categories.

## External publication gates — not yet completed

- Registry lookup for `@macro-markets/market-sdk` returned 404 before publication.
- Website login as `macromarkets` alone did not authenticate npm CLI publishing.
- The account's npm settings showed no organization membership. The registry reported
  the `macro-markets` organization scope was not found. The scope choice requires the
  maintainer's decision; do not silently rename the package or bypass authentication.
- A GitHub release must use a checked commit and the configured npm publisher. No
  release, tag or package publication is claimed by these local tests.
- Pushing the readiness branch was refused because the current GitHub OAuth token
  lacks the `workflow` scope needed to enable tests in the two existing workflows.
  Reauthorization was requested; the workflows were not removed to evade this gate.
- RapidAPI login succeeded. Its initially blank embedded Studio loaded when opened
  directly. Private project `macro-markets-public-market-data` was created with the
  homepage and English copy saved. Endpoint-form validation and gateway testing remain
  pending; a private project is not a public listing.
- DM campaign `developer-ecosystem-en` (ID 2) tracks RapidAPI and npm separately as
  opportunities (placements 57 and 58), not submitted or verified backlinks.

Publication and actual source links must be verified separately. No DR, dofollow,
indexing, referral traffic or SEO gain is asserted from package preparation.
