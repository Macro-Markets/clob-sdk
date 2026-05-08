# @macro-markets/market-sdk

SDK and CLI for **Macro Markets** — browse prediction markets, manage orders, and view your portfolio from the terminal or programmatically.

## Documentation

-   **[CLI Usage](docs/CLI_USAGE.md)** — All CLI commands (markets, orderbook, portfolio, orders, activity, trades), options, REPL, and examples.
-   **[GraphQL / Apollo Usage](docs/GRAPHQL_APOLLO_USAGE.md)** — Programmatic usage with `createGraphQLClient`: markets, order book, positions, CLOB/AMM orders, activity, and trades.

## Installation

### Global (CLI available everywhere)

```bash
npm install -g @macro-markets/market-sdk
```

### Local (use as a library in your project)

```bash
npm install @macro-markets/market-sdk
```

## Configuration

Create a `.env` file in the directory where you run the CLI (or export the variables):

```env
API_TOKEN=your-api-token-here
ENDPOINT=https://api.macro.markets/graphql
```

| Variable    | Description                         |
| ----------- | ----------------------------------- |
| `API_TOKEN` | Your personal API token (required)  |
| `ENDPOINT`  | GraphQL API endpoint URL (required) |

## Quick start

**CLI:** Run `market-sdk` with no arguments for the interactive REPL, or run commands directly (e.g. `market-sdk markets list`, `market-sdk portfolio positions`). See [CLI Usage](docs/CLI_USAGE.md) for all commands and options.

**Programmatic:** Use `createGraphQLClient(endpoint, token, locale?, headers?)` and call methods such as `markets()`, `orderBook()`, `positions()`, `buy()`, `sell()`, etc. See [GraphQL Apollo Usage](docs/GRAPHQL_APOLLO_USAGE.md) for the full API and examples.

## Development

```bash
pnpm install
pnpm build
pnpm run cli -- markets list --first 5   # Run CLI without publishing
pnpm deploy
```

## License

MIT
