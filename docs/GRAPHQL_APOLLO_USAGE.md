# GraphQL Apollo SDK — Final Usage

## Initialize

```ts
import { createGraphQLClient } from "@polymarket/clob-client";

const client = createGraphQLClient(
  "https://api.your-domain.com/graphql",
  "YOUR_SANCTUM_TOKEN",
  "en",
);
```

## 1) Discover markets

```ts
const markets = await client.markets({ first: 20, page: 1, language: "en" });
const categories = await client.categories({ language: "en" });
const market = await client.marketBySlug("market-slug");
```

## 2) Order book, history, trades

```ts
const outcomeId = 123;

const bids = await client.bids(outcomeId, 10, 1);
const asks = await client.asks(outcomeId, 10, 1);

const history = await client.marketHistory({
  marketPredictionId: 456,
  interval: "1h",
  first: 48,
  page: 1,
});

const trades = await client.tradesPaginated({
  marketPredictionId: 456,
  limit: 20,
});
```

## 3) My orders and positions

```ts
const myOrders = await client.myOrders({ first: 20, page: 1, status: "OPEN", outcomeId: 123 });
const positions = await client.positions(["politics"]);
```

## 4) Preview -> buy/sell

```ts
const buyFlow = await client.previewAndBuy({
  operation: "BUY",
  outcome_id: 123,
  amount: 100,
  slippage: 1,
  limit_price: 0.54,
});

const sellFlow = await client.previewAndSell({
  operation: "SELL",
  outcome_id: 123,
  amount: 30,
  slippage: 1,
  limit_price: 0.59,
});
```

## Operations used
- `marketsPredictions`
- `marketPrediction`
- `marketCategories`
- `marketHistory`
- `myOrders`
- `previewOrder`
- `buyClobOrder`
- `sellClobOrder`
- `userMarketPositions`
- `marketTransactions`
- `orderBookBids`
- `orderBookAsks`
