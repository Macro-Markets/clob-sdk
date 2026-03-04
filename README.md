# @macro-markets/market-sdk

SDK and CLI for **Macro Markets** — browse prediction markets, manage orders, and view your portfolio from the terminal or programmatically.

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

| Variable    | Description                           |
| ----------- | ------------------------------------- |
| `API_TOKEN` | Your personal API token (required)    |
| `ENDPOINT`  | GraphQL API endpoint URL (required)   |

## Interactive Shell (REPL)

Run `market-sdk` without arguments to enter the interactive shell:

```
$ market-sdk

        ╔════════════════════════════════════════════════╗
        ║ M A C R O . M A R K E T S                      ║
        ║ Prediction Markets SDK  v1.0                   ║
        ╠════════════════════════════════════════════════╣
        ║ johndoe                                        ║
        ║ john@example.com                               ║
        ║ Member since 2026-01-15                        ║
        ╟────────────────────────────────────────────────╢
        ║ https://api.macro.markets/graphql              ║
        ╚════════════════════════════════════════════════╝

macro> markets list --first 5
macro> portfolio positions
macro> help
macro> exit
```

Inside the shell, commands work without the `market-sdk` prefix. Special commands:

| Command | Description        |
| ------- | ------------------ |
| `help`  | List all commands  |
| `clear` | Clear the screen   |
| `exit`  | Exit the shell     |

Ctrl+C or Ctrl+D also exit the shell.

## CLI Commands

All commands can be used directly from the terminal (with `market-sdk` prefix) or inside the interactive shell (without prefix).

### Markets

```bash
# List markets (paginated)
market-sdk markets list --first 10 --page 1

# Search by keyword
market-sdk markets list --keyword "bitcoin"

# Filter by category
market-sdk markets list --category sports politics

# Get a specific market by slug
market-sdk markets get my-market-slug

# List all categories
market-sdk markets categories

# View price history
market-sdk markets history my-market-slug --period 1d
```

**Options for `markets list`:**

| Option                  | Default | Description                 |
| ----------------------- | ------- | --------------------------- |
| `--first <n>`           | 10      | Results per page            |
| `--page <n>`            | 1       | Page number                 |
| `--language <lang>`     | en      | Language code               |
| `--keyword <kw>`        |         | Search keyword              |
| `--category <slugs...>` |         | Filter by category slugs    |
| `--json`                |         | Output raw JSON             |

**Options for `markets history`:**

| Option             | Default | Description                          |
| ------------------ | ------- | ------------------------------------ |
| `--period <value>` | all     | Time period: `1h`, `1d`, `1w`, `1m`, `all` |

### Order Book

```bash
# Full order book (bids + asks)
market-sdk orderbook show 42

# List only bids
market-sdk orderbook bids 42 --first 20

# List only asks
market-sdk orderbook asks 42 --first 20
```

**Options for `orderbook bids` / `orderbook asks`:**

| Option        | Default | Description       |
| ------------- | ------- | ----------------- |
| `--first <n>` | 10      | Results per page  |
| `--page <n>`  | 1       | Page number       |
| `--json`      |         | Output raw JSON   |

### Portfolio

```bash
# View all your open positions
market-sdk portfolio positions

# Filter positions by category
market-sdk portfolio positions --category sports

# View your order book entries
market-sdk portfolio my-orders --status open

# Get details for a specific market
market-sdk portfolio details my-market-slug
```

**Options for `portfolio my-orders`:**

| Option                  | Default | Description                                     |
| ----------------------- | ------- | ----------------------------------------------- |
| `--market-id <id>`      |         | Filter by market prediction ID                  |
| `--status <statuses...>`|         | Filter by status (e.g. `open` `filled` `cancelled`) |
| `--first <n>`           | 10      | Results per page                                |
| `--page <n>`            | 1       | Page number                                     |
| `--json`                |         | Output raw JSON                                 |

### Orders

```bash
# Preview an order
market-sdk orders preview --outcome 42 --amount 100 --side BUY

# Place a buy order via CLOB
market-sdk orders buy-clob --outcome 42 --amount 100

# Place a buy order with preview
market-sdk orders buy-clob --outcome 42 --amount 100 --preview

# Place a sell order via CLOB
market-sdk orders sell-clob --outcome 42 --amount 50

# Cancel an order
market-sdk orders cancel <orderId>

# Buy via AMM
market-sdk orders buy-amm --outcome 42 --amount 100

# Sell via AMM
market-sdk orders sell-amm --outcome 42 --amount 50
```

**Options for `orders buy-clob` / `orders sell-clob`:**

| Option               | Description                    |
| -------------------- | ------------------------------ |
| `--outcome <id>`     | Outcome ID (required)          |
| `--amount <n>`       | Amount (required)              |
| `--limit-price <n>`  | Limit price                    |
| `--preview`          | Preview before executing       |

**Options for `orders buy-amm` / `orders sell-amm`:**

| Option                | Description                    |
| --------------------- | ------------------------------ |
| `--outcome <id>`      | Outcome ID (required)          |
| `--amount <n>`        | Amount (required)              |
| `--target-price <n>`  | Target price                   |
| `--slippage <n>`      | Slippage tolerance             |

### Activity & Trades

```bash
# View market activity
market-sdk activity --market-prediction-id 1

# View trade history
market-sdk trades --market-prediction-id 1

# Filter by outcome
market-sdk trades --outcome-id 42
```

**Options (same for both commands):**

| Option                        | Default | Description                    |
| ----------------------------- | ------- | ------------------------------ |
| `--market-prediction-id <id>` |         | Filter by market prediction ID |
| `--market-id <id>`            |         | Filter by market ID            |
| `--outcome-id <id>`           |         | Filter by outcome ID           |
| `--first <n>`                 | 20      | Number of results              |
| `--json`                      |         | Output raw JSON                |

## Programmatic Usage

Use the SDK as a library in your own TypeScript/JavaScript project:

```typescript
import { createGraphQLClient } from "@macro-markets/market-sdk";

const client = createGraphQLClient(
    "https://api.macro.markets/graphql",
    "your-api-token",
    "en",
);

// Get current user
const me = await client.me();
console.log(me.username, me.email);

// List markets
const markets = await client.markets({ first: 10, page: 1, language: "en" });
console.log(markets.data);

// Get a single market
const market = await client.marketBySlug("my-market-slug");
console.log(market);

// List categories
const categories = await client.categories({ language: "en" });
console.log(categories);

// View order book
const book = await client.orderBook(42);
console.log(book.bids, book.asks);

// Preview and place an order
const { preview, order } = await client.previewAndBuy({
    outcome_id: 42,
    amount: 100,
});
console.log(preview, order);

// View portfolio
const positions = await client.positions();
console.log(positions);

// Cancel an order
await client.cancelOrder({ order_id: "order-uuid" });
```

### Available Client Methods

| Method                  | Description                              |
| ----------------------- | ---------------------------------------- |
| `me()`                  | Get authenticated user profile           |
| `markets(input)`        | List markets with pagination             |
| `marketBySlug(slug)`    | Get a single market by slug              |
| `categories(input?)`    | List market categories                   |
| `marketHistory(input)`  | Get market price history                 |
| `orderBook(outcomeId)`  | Full order book for an outcome           |
| `bids(outcomeId)`       | List bids for an outcome                 |
| `asks(outcomeId)`       | List asks for an outcome                 |
| `positions(categories?)`| List user positions                      |
| `myOrderBooks(input?)`  | List user order book entries             |
| `userMarketDetails(slug)` | Get user details for a market          |
| `previewOrder(input)`   | Preview an order                         |
| `buy(input)`            | Place a CLOB buy order                   |
| `sell(input)`           | Place a CLOB sell order                  |
| `buyAmm(input)`         | Place an AMM buy order                   |
| `sellAmm(input)`        | Place an AMM sell order                  |
| `cancelOrder(input)`    | Cancel an existing order                 |
| `previewAndBuy(input)`  | Preview then execute a buy               |
| `previewAndSell(input)` | Preview then execute a sell              |
| `activity(filter?)`     | View market transactions                 |
| `tradesPaginated(filter?)` | View paginated trade history          |

## Development

```bash
# Install dependencies
pnpm install

# Build (SDK + CLI)
pnpm build

# Run CLI in dev mode (without building)
pnpm run cli -- markets list --first 5

# Publish to npm
pnpm deploy
```

## License

MIT
