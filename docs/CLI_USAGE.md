# CLI Usage Examples

This document provides usage examples for all commands of the **market-sdk** CLI (Macro Markets SDK). Use it to browse prediction markets, manage orders, and view your portfolio.

---

## Running the CLI

**Development (from repo):**

```bash
pnpm run market-sdk
# or
pnpm run cli
```

**After install (global or npx):**

```bash
market-sdk
# or
npx @macromarkets/market-sdk
```

With no arguments, the CLI starts an interactive REPL. To run a single command:

```bash
market-sdk markets list
market-sdk portfolio positions
```

**Environment:** Set `ENDPOINT=https://acp.macro.markets/@` in a `.env` file or export it.
Public `markets` and `orderbook` commands work without `API_TOKEN`. Commands that need
auth (portfolio, orders, activity, trades) require your own valid `API_TOKEN`.
Never put a token in a public command example, issue or marketplace listing.

**Language:** All commands that support `--language <lang>` send the value **only via the `Accept-Language` HTTP header**. The backend uses this header for locale (e.g. `markets list`, `markets get`, `markets categories`, `markets history`). Do not rely on passing language as a query variable; the header is the single source of truth.

---

## 1. Markets

Browse prediction markets, categories, and price history.

### List markets

```bash
# Default: first 10, page 1, English
market-sdk markets list

# 20 results, page 2
market-sdk markets list --first 20 --page 2

# Search by keyword
market-sdk markets list --keyword bitcoin

# Filter by category (one or more slugs)
market-sdk markets list --category crypto politics
market-sdk markets list --category sports

# Portuguese content
market-sdk markets list --language pt

# Raw JSON output
market-sdk markets list --json
```

### Get a single market by slug

The backend uses the `Accept-Language` header (set via `--language`) to return the market in the requested language.

```bash
market-sdk markets get my-market-slug
market-sdk markets get will-flamengo-win-the-next-classic-against-fluminense --language pt
market-sdk markets get btc-above-100k-december --json
```

### List categories

```bash
market-sdk markets categories
market-sdk markets categories --language pt
market-sdk markets categories --json
```

### Market price history

Language can be set with `--language` (sends `Accept-Language` header).

```bash
# All history (default)
market-sdk markets history my-market-slug

# With language (e.g. for markets that only have pt)
market-sdk markets history my-market-slug --language pt

# Specific period: 1h, 1d, 1w, 1m, all
market-sdk markets history my-market-slug --period 1d
market-sdk markets history my-market-slug --period 1w
market-sdk markets history my-market-slug --period all --json
```

---

## 2. Orderbook

View order book data for a given outcome (by outcome ID).

### Full order book (bids + asks)

```bash
market-sdk orderbook show --outcome 12345
market-sdk orderbook show --outcome 12345 --json
```

### Bids only

```bash
market-sdk orderbook bids --outcome 12345
market-sdk orderbook bids --outcome 12345 --first 20 --page 1
market-sdk orderbook bids --outcome 12345 --json
```

### Asks only

```bash
market-sdk orderbook asks --outcome 12345
market-sdk orderbook asks --outcome 12345 --first 15 --page 2
market-sdk orderbook asks --outcome 12345 --json
```

---

## 3. Portfolio

View your positions and orders (requires authentication).

### List open positions

```bash
market-sdk portfolio positions
market-sdk portfolio positions --category crypto
market-sdk portfolio positions --category crypto politics --json
```

### List your order book entries

```bash
market-sdk portfolio my-orders
market-sdk portfolio my-orders --first 20 --page 1
market-sdk portfolio my-orders --market-id 42
market-sdk portfolio my-orders --status open filled
market-sdk portfolio my-orders --status cancelled --json
```

### Your details for a market prediction

```bash
market-sdk portfolio details my-market-slug
market-sdk portfolio details my-market-slug --json
```

---

## 4. Orders

Place and manage orders (requires authentication). Use outcome IDs from markets/orderbook.

### Preview an order

```bash
market-sdk orders preview --outcome 123 --amount 100 --side BUY
market-sdk orders preview --outcome 123 --amount 50 --side SELL --limit-price 0.65
market-sdk orders preview --outcome 123 --amount 100 --side BUY --slippage 0.02
```

### Buy via CLOB

```bash
market-sdk orders buy-clob --outcome 123 --amount 100
market-sdk orders buy-clob --outcome 123 --amount 100 --limit-price 0.55
market-sdk orders buy-clob --outcome 123 --amount 100 --preview
```

### Sell via CLOB

```bash
market-sdk orders sell-clob --outcome 123 --amount 50
market-sdk orders sell-clob --outcome 123 --amount 50 --limit-price 0.70
market-sdk orders sell-clob --outcome 123 --amount 50 --preview
```

### Cancel an order

```bash
market-sdk orders cancel abc-order-id-123
```

### Buy via AMM

```bash
market-sdk orders buy-amm --outcome 123 --amount 100
market-sdk orders buy-amm --outcome 123 --amount 100 --target-price 0.60
market-sdk orders buy-amm --outcome 123 --amount 100 --slippage 0.01
```

### Sell via AMM

```bash
market-sdk orders sell-amm --outcome 123 --amount 50
market-sdk orders sell-amm --outcome 123 --amount 50 --target-price 0.65
market-sdk orders sell-amm --outcome 123 --amount 50 --slippage 0.02
```

---

## 5. Activity

View market activity/transactions (requires authentication).

```bash
market-sdk activity
market-sdk activity --first 50
market-sdk activity --market-prediction-id 10
market-sdk activity --market-id 20
market-sdk activity --outcome-id 123
market-sdk activity --market-prediction-id 10 --first 30 --json
```

---

## 6. Trades

View paginated trade history (requires authentication).

```bash
market-sdk trades
market-sdk trades --first 50
market-sdk trades --market-prediction-id 10
market-sdk trades --market-id 20 --outcome-id 123
market-sdk trades --first 100 --json
```

---

## Output options

Many commands support `--json` to print raw API responses instead of the default table/summary:

-   **markets:** `list`, `get`, `categories`, `history`
-   **orderbook:** `show`, `bids`, `asks`
-   **portfolio:** `positions`, `my-orders`, `details`
-   **activity**, **trades**

Example:

```bash
market-sdk markets list --json
market-sdk portfolio positions --json
```

---

## Interactive REPL

If you run the CLI with no subcommand, an interactive shell starts. You can type the same commands without the program name:

```text
market-sdk
> markets list --first 5
> orderbook show --outcome 12345
> portfolio positions
> exit
```

Use `help` to list commands and `clear` to clear the screen.
