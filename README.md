# @macro-markets/market-sdk

Official TypeScript SDK and command-line interface for **Macro Markets** prediction markets.

Use it to discover markets, inspect order books, preview and place CLOB/AMM orders, manage your portfolio, and read activity/trade history from scripts, apps, or the terminal.

## What is included

- **GraphQL SDK** — `createGraphQLClient()` wrapper around Macro Markets GraphQL operations.
- **CLI** — `market-sdk` commands for markets, order books, portfolio, orders, activity, and trades.
- **Interactive REPL** — run `market-sdk` with no arguments for an interactive terminal session.
- **Localization support** — commands and SDK calls can send locale through the `Accept-Language` header.
- **JSON output** — CLI commands support `--json` where useful for automation and scripting.

## Documentation

- **[CLI Usage](docs/CLI_USAGE.md)** — commands, flags, examples, REPL usage, JSON output, and language handling.
- **[GraphQL / Apollo Usage](docs/GRAPHQL_APOLLO_USAGE.md)** — programmatic usage with `createGraphQLClient()`, including markets, order books, portfolio, CLOB/AMM orders, activity, and trades.

## Installation

### CLI globally

```bash
npm install -g @macro-markets/market-sdk
```

Then run:

```bash
market-sdk
market-sdk markets list
market-sdk portfolio positions
```

### Library in your project

```bash
npm install @macro-markets/market-sdk
```

## Configuration

Create a `.env` file in the directory where you run the CLI, or export the variables in your shell:

```env
API_TOKEN=your-api-token-here
ENDPOINT=https://api.macro.markets/graphql
```

| Variable | Required | Description |
| --- | --- | --- |
| `ENDPOINT` | Yes | Macro Markets GraphQL endpoint. |
| `API_TOKEN` | For authenticated actions | Personal API token used for portfolio, orders, activity, and trades. |

## CLI quick start

```bash
# Start the interactive REPL
market-sdk

# Browse markets
market-sdk markets list --first 20 --page 1
market-sdk markets list --keyword bitcoin
market-sdk markets get my-market-slug --language pt
market-sdk markets categories --json

# Inspect an order book
market-sdk orderbook show --outcome 12345
market-sdk orderbook bids --outcome 12345 --first 20
market-sdk orderbook asks --outcome 12345 --json

# Portfolio and account data (requires API_TOKEN)
market-sdk portfolio positions
market-sdk portfolio my-orders --status open filled
market-sdk portfolio details my-market-slug

# Preview and execute orders (requires API_TOKEN)
market-sdk orders preview --outcome 123 --amount 100 --side BUY
market-sdk orders buy-clob --outcome 123 --amount 100 --limit-price 0.55
market-sdk orders sell-clob --outcome 123 --amount 50 --preview
market-sdk orders cancel abc-order-id-123

# Activity and trades (requires API_TOKEN)
market-sdk activity --first 50
market-sdk trades --market-id 20 --outcome-id 123 --json
```

See **[CLI Usage](docs/CLI_USAGE.md)** for the full command reference.

## SDK quick start

```ts
import { createGraphQLClient } from "@macro-markets/market-sdk";

const client = createGraphQLClient(
    "https://api.macro.markets/graphql",
    "YOUR_API_TOKEN",
    "en", // optional locale, sent as Accept-Language
);

const markets = await client.markets({ first: 20, page: 1, language: "en" });
const market = await client.marketBySlug("market-slug");
const book = await client.orderBook(123);

const preview = await client.previewOrder({
    operation: "BUY",
    outcome_id: 123,
    amount: 100,
    limit_price: 0.54,
});

if (!preview?.errors?.length) {
    await client.buy({ amount: 100, outcome_id: 123, limit_price: 0.54 });
}
```

See **[GraphQL / Apollo Usage](docs/GRAPHQL_APOLLO_USAGE.md)** for every supported SDK method and the GraphQL operations behind them.

## Main capabilities

| Area | CLI examples | SDK methods |
| --- | --- | --- |
| Markets | `markets list`, `markets get`, `markets categories`, `markets history` | `markets()`, `marketBySlug()`, `categories()`, `marketHistory()` |
| Order book | `orderbook show`, `orderbook bids`, `orderbook asks` | `orderBook()`, `bids()`, `asks()` |
| Portfolio | `portfolio positions`, `portfolio my-orders`, `portfolio details` | `positions()`, `myOrderBooks()`, `userMarketDetails()` |
| CLOB orders | `orders preview`, `orders buy-clob`, `orders sell-clob`, `orders cancel` | `previewOrder()`, `buy()`, `sell()`, `cancelOrder()`, `previewAndBuy()`, `previewAndSell()` |
| AMM orders | `orders buy-amm`, `orders sell-amm` | `buyAmm()`, `sellAmm()` |
| Activity/trades | `activity`, `trades` | `activity()`, `tradesPaginated()` |

## Localization

CLI commands that support `--language <lang>` send the selected language through the `Accept-Language` HTTP header. The SDK locale argument works the same way.

```bash
market-sdk markets list --language pt
market-sdk markets get copa-do-mundo-2026 --language pt
```

## Development

```bash
pnpm install
pnpm build
pnpm run cli -- markets list --first 5
pnpm test
```

Publish flow:

```bash
pnpm deploy
```

## License

MIT
