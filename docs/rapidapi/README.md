# RapidAPI listing draft: Macro Markets Public Market Data

Status: preparation only. This directory is not proof of a published RapidAPI listing.

## Listing copy (English)

**Name:** Macro Markets Public Market Data

**Summary:** Discover prediction markets and inspect public market data with GraphQL.

**Overview:** Build market discovery tools and dashboards using public prediction-market
data from Macro Markets. Query market listings, details, categories and order books
with the official TypeScript SDK or the existing GraphQL endpoint. This pilot documents
public read queries only. It does not supply an account token, place orders, expose a
portfolio or transfer funds. Market prices express market-implied probabilities, not
guarantees of an outcome.

**Website:** https://macro.markets/en

**Official SDK:** https://github.com/Macro-Markets/clob-sdk

**API endpoint:** https://acp.macro.markets/@

**Access:** Free access to the documented public data. Trading on Macro Markets is a
separate authenticated activity requiring deposited funds and is subject to eligibility,
terms and risk of loss. Do not describe trading as free of fees or risk.

## Provider setup

- Confirm the owner account, terms acceptance and free provider setup before creating
  the listing. Do not purchase a plan or enable paid overages.
- RapidAPI supports GraphQL and Postman collections. The supplied collection contains
  actual POST requests to the GraphQL endpoint, not invented REST routes. Start with
  the combined read-only example; do not import the whole platform/admin schema.
  GraphQL uses a single `POST /@` route: separate Postman items with the same method
  and path can overwrite each other's definitions in the RapidAPI importer.
- The native API needs no `Authorization` header for these public queries. Do not add a
  required Macro token just because a generic listing tutorial does. RapidAPI's own
  gateway key is separate from any Macro account token.
- Mark `Content-Type: application/json` and `Accept-Language: en` as required example
  headers in the imported definition. An optional example value displayed by the
  playground was not sent until edited; verify the actual response is in English.
- If a free consumer plan is needed, set its price to $0 and use a hard request limit
  after checking the origin's rate limits/capacity. Do not invent an SLA or promise
  unlimited usage. Do not enter payment or payout details.
- Check platform-imposed charges separately. In October 2026 the RapidAPI panel and
  consumer documentation included a bandwidth platform fee above 10 GB per billing
  cycle, charged to the consumer even when BASIC is $0. This is not a Macro usage fee;
  do not promise unlimited or unconditionally free gateway traffic. Obtain the
  maintainer's decision before publishing a listing under this condition.
- Listing a restricted query schema is documentation, **not** a server-side authorization
  boundary. Preserve all origin authentication, eligibility and rate-limit protections.
  No write or financial smoke tests are part of this pilot.
- Keep the listing private until imported requests have been tested through the gateway,
  not just directly against the origin. Check that failures do not leak credentials.
- Before making it public, verify the website, logo, category, English copy, API terms,
  authentication and free-plan settings. If the platform requires permissions beyond
  basic login, payment or private credentials, stop for a maintainer decision.

## Verification and tracking

After publication, record the actual public listing URL in DM. Check its HTTP/browser
availability and the real homepage anchor/redirect/`rel` attributes. Record a screenshot
and timestamp. Do not count a draft, accepted import, gateway success or submission
receipt as a public backlink. Do not claim domain-rating or ranking gains from the
source post without independent evidence.

Primary provider documentation:

- https://docs.rapidapi.com/docs/add-api-getting-started
- https://docs.rapidapi.com/docs/graphql-apis
- https://docs.rapidapi.com/docs/configuring-api-security
- https://docs.rapidapi.com/docs/connecting-to-an-api
