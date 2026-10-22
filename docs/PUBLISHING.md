# Publishing the SDK and CLI

The single package `@macro-markets/market-sdk` includes the library and the `market-sdk`
CLI. Do not publish a duplicate package just for distribution links.

## Release checks

1. Run `pnpm install --frozen-lockfile`, `pnpm lint`, `pnpm test` and `pnpm build`.
2. Run `npm pack --dry-run` and inspect the allowlisted contents. Keep `.env`, tokens,
   local configuration and test fixtures out of the tarball. Preserve the MIT license
   and upstream copyright notice.
3. Install the packed tarball into an empty consumer project. Verify the SDK import,
   `market-sdk --version`, `--help`, JSON output and public queries without a token.
   Verify private commands fail without a token, before any request is sent.
4. Use only read-only queries against the live API. Never use a live order, cancellation,
   deposit or withdrawal as a release smoke test.
5. Confirm the exact package/version is absent before the first publish. Use an account
   permitted to publish under the `@macro-markets` scope. Do not bypass 2FA or move an
   existing published version.

## First publication and subsequent releases

The existing release workflow is `.github/workflows/release.yaml`. It runs when a
GitHub release is published and uses npm OIDC trusted publishing, not a stored token.
Configure the npm trusted publisher for `Macro-Markets/clob-sdk` and that exact workflow
in the npm package settings. OIDC alone does not prove that the scope/package or its
publisher has been configured. A first publication may require the maintainer's npm
login and 2FA. Keep all credentials out of the repository and DM evidence.

`prepublishOnly` runs lint, tests and build for both local and CI publication. Confirm
the approved commit, package version and CI before publishing a release. After publish,
read the npm registry entry and install that public version in a fresh consumer project.

## Discovery and evidence

The package homepage is `https://macro.markets/en`; repository and issue links point to
the official SDK. Verify the public npm page and its actual links after publication.
Libraries.io and other indexes are separate observations: package publication does not
prove they have indexed it, that a backlink exists, or that it passes ranking signals.
Record each public source URL, target, date and observed link attributes in DM.
