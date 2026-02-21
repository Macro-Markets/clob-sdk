# CLOB SDK — Usage Guide (Sanctum + GraphQL)

> Note: despite this filename, this guide is in English by request.

## Naming
- `marketPredictionId`: market identifier
- `outcomeId`: outcome identifier
- `currencyCode`: internal wallet currency
- `orderAmount`: order amount
- `limitPrice`: limit price

## 1) Initialize REST client (Sanctum)

```ts
import { createSanctumClient } from "@polymarket/clob-client";

const client = createSanctumClient(
  "https://api.your-domain.com",
  "YOUR_SANCTUM_TOKEN",
);
```

## 2) Market data

```ts
const market = await client.getMarket("MARKET_PREDICTION_ID");
const book = await client.getOrderBook("OUTCOME_ID");
const price = await client.getPrice("OUTCOME_ID", "buy");
```

## 3) Order preview and execution

```ts
const preview = await client.previewOrder({
  outcome_id: "OUTCOME_ID",
  side: "BUY",
  amount: 100,
  price: 0.56,
});

if (preview?.errors?.length) throw new Error(preview.errors.join(", "));

const order = await client.createAndPostOrder(
  { tokenID: "OUTCOME_ID", side: "BUY", price: 0.56, size: 100 },
  { tickSize: "0.01", negRisk: false },
  "GTC",
);
```

## 4) Post-trade

```ts
const openOrders = await client.getOpenOrders({ asset_id: "OUTCOME_ID" });
const trades = await client.getTrades({ asset_id: "OUTCOME_ID" });
```

## 5) Tests (mocked)

### Suites
- `tests/client.compat.test.ts`
- `tests/graphql.client.mock.test.ts`

### Run
```bash
pnpm mocha --node-option import=tsx --require jsdom-global/register \
  "tests/client.compat.test.ts" \
  "tests/graphql.client.mock.test.ts" \
  --timeout 120000 --exit
```

### Expected
- `14 passing`
