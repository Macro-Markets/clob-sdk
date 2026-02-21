# Previsions SDK GraphQL (Apollo) — uso final

Este guia cobre o client `PrevisionsGraphQLClient` (GraphQL-only, Apollo), incluindo fluxo real de preview -> execução.

## Inicialização

```ts
import { PrevisionsGraphQLClient } from "@polymarket/clob-client";

const client = new PrevisionsGraphQLClient({
  endpoint: "https://api.seu-dominio.com/graphql",
  token: process.env.PREVISIONS_TOKEN,
  locale: "pt-BR",
});
```

## 1) Descoberta de mercado

```ts
const markets = await client.markets({
  first: 20,
  page: 1,
  language: "pt",
  categorySlugIn: ["politica"],
});

const categories = await client.categories({ language: "pt" });
const market = await client.marketBySlug("eleicao-presidencial-2026");
```

## 2) Livro de ofertas, histórico e trades paginados

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
  exclusive_start_key: null,
});
```

## 3) Minhas ordens e posições

```ts
const myOrders = await client.myOrders({
  first: 20,
  page: 1,
  status: "OPEN",
  outcomeId: 123,
});

const positions = await client.positions(["politica"]);
```

## 4) Fluxo real preview -> buy/sell

### Opção A: manual

```ts
const previewBuy = await client.previewOrder({
  operation: "BUY",
  outcome_id: 123,
  amount: 100,
  slippage: 1,
});

if (!previewBuy.has_liquidity || previewBuy.insufficient_balance || previewBuy.errors.length > 0) {
  throw new Error(`Preview inválido: ${previewBuy.errors.join(", ")}`);
}

const buy = await client.buy({
  outcome_id: 123,
  amount: 100,
  slippage: 1,
  limit_price: 0.54,
});
```

### Opção B: helper pronto (recomendado)

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

console.log(buyFlow.preview, buyFlow.order);
console.log(sellFlow.preview, sellFlow.order);
```

## Operações GraphQL usadas

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

> Se algum schema em ambiente legado não expuser `marketCategories`, `marketHistory` ou `myOrders`, mantenha os métodos e ajuste apenas o documento GraphQL em `src/graphql/operations.ts` para o nome real do resolver nesse ambiente.
