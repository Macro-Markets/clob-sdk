# CLOB SDK — Guia de uso (Previsions / Sanctum)

Guia prático da SDK no fluxo real da API interna (Sanctum-first), sem depender de Polymarket em nível de URL.

## O que você vai ver
- Inicialização com **Bearer token (Sanctum)**
- Buscar mercados
- Buscar book / preço / spreads
- Criar e enviar ordens
- Buscar ordens abertas
- Buscar trades
- Cancelar ordens

---

## 1) Instalação

```bash
npm i @polymarket/clob-client ethers
# ou
pnpm add @polymarket/clob-client ethers
```

> Observação: o pacote ainda mantém nome legado, mas o uso abaixo já está no padrão da API interna.

---

## 2) Inicialização (Sanctum-first)

```ts
import { ClobClient, Chain, Side, OrderType } from "@polymarket/clob-client";

const host = "https://api.seu-dominio.com";
const chainId = Chain.AMOY;

// Token Sanctum do usuário
const authToken = process.env.CLOB_TOKEN!;

// signer/creds podem ficar undefined no fluxo Sanctum-first
const client = new ClobClient(
  host,
  chainId,
  undefined,
  undefined,
  undefined,
  undefined,
  undefined,
  undefined,
  undefined,
  undefined,
  undefined,
  undefined,
  authToken,
);
```

---

## 3) Buscar mercados

```ts
const markets = await client.getMarkets();
console.log(markets);

const conditionId = "SEU_CONDITION_ID";
const market = await client.getMarket(conditionId);
console.log(market);
```

---

## 4) Buscar book, preço e spread

Use `outcomeId` nos métodos de leitura.

```ts
const outcomeId = "12345";

const book = await client.getOrderBook(outcomeId);
const buy = await client.getPrice(outcomeId, "buy");
const sell = await client.getPrice(outcomeId, "sell");
const spread = await client.getSpread(outcomeId);

console.log({ book, buy, sell, spread });
```

### Batch

```ts
const books = await client.getOrderBooks([
  { token_id: "12345", side: Side.BUY },
  { token_id: "67890", side: Side.SELL },
]);

const prices = await client.getPrices([
  { token_id: "12345", side: Side.BUY },
  { token_id: "67890", side: Side.SELL },
]);

const spreads = await client.getSpreads([
  { token_id: "12345", side: Side.BUY },
  { token_id: "67890", side: Side.SELL },
]);

console.log({ books, prices, spreads });
```

---

## 5) Criar e enviar ordem limite

```ts
const signed = await client.createOrder(
  {
    tokenID: "12345",
    side: Side.BUY,
    price: 0.52,
    size: 100,
  },
  {
    tickSize: "0.01",
    negRisk: false,
  },
);

const posted = await client.postOrder(signed, OrderType.GTC);
console.log(posted);
```

Atalho:

```ts
const postedDirect = await client.createAndPostOrder(
  {
    tokenID: "12345",
    side: Side.BUY,
    price: 0.52,
    size: 100,
  },
  {
    tickSize: "0.01",
    negRisk: false,
  },
  OrderType.GTC,
);
```

---

## 6) Ordem de mercado

```ts
const result = await client.createAndPostMarketOrder(
  {
    tokenID: "12345",
    side: Side.BUY,
    amount: 250,
  },
  {
    tickSize: "0.01",
    negRisk: false,
  },
  OrderType.FOK,
);

console.log(result);
```

---

## 7) Buscar ordens abertas

```ts
const openOrders = await client.getOpenOrders({
  market: "SEU_CONDITION_ID", // opcional
  asset_id: "12345",          // opcional
});

console.log(openOrders);
```

Buscar ordem específica:

```ts
const order = await client.getOrder("ORDER_ID_OU_HASH");
console.log(order);
```

---

## 8) Buscar trades

```ts
const trades = await client.getTrades({
  market: "SEU_CONDITION_ID", // opcional
  asset_id: "12345",          // opcional
});

console.log(trades);
```

Paginado:

```ts
const tradesPage = await client.getTradesPaginated({
  market: "SEU_CONDITION_ID",
  asset_id: "12345",
});

console.log(tradesPage);
```

---

## 9) Cancelar ordens

```ts
await client.cancelOrder({ orderID: "ORDER_ID_OU_HASH" } as any);

await client.cancelOrders(["ORDER_1", "ORDER_2"]);

await client.cancelAll();
```

---

## 10) Fluxo completo (resumo)

```ts
// 1) init client com authToken (Sanctum)
// 2) getMarkets / getMarket
// 3) getOrderBook / getPrice / getSpread
// 4) createAndPostOrder (ou createAndPostMarketOrder)
// 5) getOpenOrders
// 6) getTrades
// 7) cancelOrder(s) quando necessário
```

---

## Notas importantes

1. **Sanctum-first**: para API interna, priorize `authToken` no client.
2. **Compat funcional**: a SDK mantém mapeamentos necessários de payload/response nos métodos, sem depender de heurística por host.
3. **Campos de mercado**: use `outcomeId` nos métodos de leitura e `tokenID` nos payloads de criação de ordem, conforme contratos atuais da SDK.
4. **Produção**: adicione retry, timeout e tratamento de erro explícito.
