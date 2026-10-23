# Developer distribution readiness — 2026-10-22

## Maintainer decisions and latest state

On 2026-10-22 (America/Sao_Paulo), the maintainer selected the personal npm scope
`@macromarkets`, authorized the GitHub CLI `workflow` permission refresh, and confirmed
the free API pilot. The package and all current usage instructions now use
`@macromarkets/market-sdk`; historical checks of the former scope below are retained.

Lint (exit 0, same two existing warnings), all 47 tests, build and TypeScript checks
passed again after renaming. A newly packed `@macromarkets/market-sdk@1.0.0` tarball
was installed into a fresh consumer. Both the installed CLI and the installed SDK import
queried real public markets without a token (one market, total 208 at that time).
The new scoped package registry lookup returned 404 before publication. No npm package,
GitHub PR, release, tag or CI approval is claimed yet: the official GitHub device flow
and npm email confirmation still require completion in Chrome.

The RapidAPI BASIC pilot is now public:
https://rapidapi.com/MacroMarkets/api/macro-markets-public-market-data . Its saved plan
is $0/month with a 1,000-request monthly hard cap, with paid tiers disabled and the
separate platform bandwidth fee disclosed. Saved English quickstart JSON was parsed
successfully. A separate Chrome Incognito window showed `Sign In` / `Sign Up` and the
public listing, documentation, logo and plan without authenticating. The anonymous
rendered DOM contained three direct `https://macro.markets/en` anchors, all with empty
`rel`: URL text, `Macro Markets`, and `Product Website` (the latter opens `_blank`).

Anonymous HTTP returned 200 but only the client-rendered shell. DM's automatic HTTP
verifier therefore reported `not_found`; this is kept distinct from the rendered
browser evidence, not overridden to mark an automatic pass. Placement 57 is
`live_unverified`, with the public source URL and notes documenting the manual proof.
The campaign was activated as a registry state change only, without outreach.

Proof: `artifacts/developer-distribution-20261022/rapidapi-public-anonymous.png` in the
DM backlink working tree. No indexation, DR, referral traffic or SEO gain is asserted.

## Historical readiness checks (before the decisions above)

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
  local configuration. This operational release-evidence file is not in the tarball.
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
  homepage and English copy saved. After both imported response examples were filled
  with the observed public API response, endpoint validation passed: rereading the
  endpoints list confirmed `queryPublicMarketData` persisted.
- Gateway test in the actual RapidAPI playground returned HTTP 200 (1039 ms shown),
  five markets, ten English categories, and paginator total 209. The first run had
  omitted the optional language header; editing it explicitly corrected the response.
  The imported JSON/English headers were then marked required and saved. Reopening the
  endpoint confirmed both required flags and their default values persisted. A fresh
  provider `Test Endpoint` run with these saved defaults returned 200, total 209, an
  English market title and `World Elections` in the response.
- BASIC is $0 with a saved hard limit of 1,000 requests/month; PRO/ULTRA/MEGA remain
  disabled. RapidAPI's separate bandwidth object showed $0.001/MB above 10,240 MB and
  was not editable in the provider panel. Official consumer documentation confirms the
  platform fee is charged to the consumer. A maintainer decision was requested before
  public exposure under that condition. No payment details or paid plan were added.
- Screenshot of the actual private gateway test is recorded in the DM working
  artifacts as `developer-distribution-20261022/rapidapi-private-gateway-200.png`.
  A private project and a passing gateway request are not verified public backlinks.
- DM campaign `developer-ecosystem-en` (ID 2) tracks RapidAPI and npm separately as
  opportunities (placements 57 and 58), not submitted or verified backlinks.

Publication and actual source links must be verified separately. No DR, dofollow,
indexing, referral traffic or SEO gain is asserted from package preparation.
