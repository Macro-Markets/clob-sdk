# GraphQL Apollo SDK — Usage Guide

## Initialize

```ts
import { createGraphQLClient } from "@polymarket/clob-client";

const client = createGraphQLClient(
    "https://api.your-domain.com/graphql",
    "YOUR_SANCTUM_TOKEN",
    "en", // optional locale
);
```

## 1) Discover markets

```ts
const markets = await client.markets({ first: 20, page: 1, language: "en" });
const categories = await client.categories({ language: "en" });
const market = await client.marketBySlug("market-slug");
```

## 2) Market details and history

```ts
const details = await client.userMarketDetails("market-slug");
// details.shareTotalsByOutcome, details.isWatching

const history = await client.marketHistory({
    slug: "market-slug",
    period: "1h", // optional: "1h", "1d", "1w", "1m", etc.
});
```

## 3) Order book

```ts
const outcomeId = 123;

// Combined asks + bids + last_trade_price
const book = await client.orderBook(outcomeId);
// book.asks, book.bids, book.last_trade_price

// Paginated separately
const bids = await client.bids(outcomeId, 10, 1);
const asks = await client.asks(outcomeId, 10, 1);
```

## 4) My orders and positions

```ts
const myOrders = await client.myOrderBooks({
    marketPredictionId: 456,
    status: ["OPEN"],
    first: 20,
    page: 1,
});

const positions = await client.positions(["politics"]);
```

## 5) Transactions / activity

```ts
const activity = await client.activity({ market_prediction_id: 456 });
const trades = await client.tradesPaginated({
    market_prediction_id: 456,
    exclusive_start_key: "abc", // for pagination
});
```

## 6) Preview → CLOB buy/sell

```ts
// Preview first (optional)
const preview = await client.previewOrder({
    operation: "BUY",
    outcome_id: 123,
    amount: 100,
    limit_price: 0.54,
});

if (preview?.errors?.length) throw new Error(preview.errors.join(", "));

// Execute directly
const order = await client.buy({ amount: 100, outcome_id: 123, limit_price: 0.54 });
const sellOrder = await client.sell({ amount: 30, outcome_id: 123, limit_price: 0.59 });

// Or preview + execute in one call
const buyFlow = await client.previewAndBuy({ amount: 100, outcome_id: 123, limit_price: 0.54 });
const sellFlow = await client.previewAndSell({ amount: 30, outcome_id: 123, limit_price: 0.59 });
```

## 7) Cancel CLOB order

```ts
await client.cancelOrder({ order_id: "order-uuid" });
```

## 8) AMM buy/sell

```ts
const ammBuy = await client.buyAmm({
    amount: 50,
    outcome_id: 123,
    target_price: 0.55,
    slippage: 1,
});

const ammSell = await client.sellAmm({
    amount: 20,
    outcome_id: 123,
    slippage: 1,
});
```

## GraphQL operations used

| Method                | GraphQL operation            |
| --------------------- | ---------------------------- |
| `markets()`           | `marketsPredictions`         |
| `marketBySlug()`      | `marketPrediction`           |
| `categories()`        | `marketPredictionCategories` |
| `marketHistory()`     | `marketHistory`              |
| `userMarketDetails()` | `userMarketDetails`          |
| `orderBook()`         | `orderBook`                  |
| `bids()`              | `orderBookBids`              |
| `asks()`              | `orderBookAsks`              |
| `myOrderBooks()`      | `myOrderBooks`               |
| `positions()`         | `userMarketPositions`        |
| `activity()`          | `marketTransactions`         |
| `tradesPaginated()`   | `marketTransactions`         |
| `previewOrder()`      | `previewOrder`               |
| `buy()`               | `buyClobOrder`               |
| `sell()`              | `sellClobOrder`              |
| `cancelOrder()`       | `cancelClobOrder`            |
| `buyAmm()`            | `buyAmmOrder`                |
| `sellAmm()`           | `sellAmmOrder`               |
