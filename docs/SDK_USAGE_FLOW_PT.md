# SDK CLOB — Guia de uso (fluxo completo)

Este guia mostra o fluxo prático para usar o SDK:
- buscar mercados,
- buscar livro/preço,
- criar e enviar ordens,
- consultar ordens abertas,
- consultar trades,
- cancelar ordens.

> Exemplos em TypeScript.

---

## 1) Instalação

```bash
npm i @polymarket/clob-client ethers
# ou
pnpm add @polymarket/clob-client ethers
```

---

## 2) Inicialização do cliente

```ts
import { ClobClient, Chain, Side, OrderType } from "@polymarket/clob-client";
import { Wallet } from "@ethersproject/wallet";

const host = "https://SEU_HOST_CLOB"; // ex.: endpoint da API CLOB
const chainId = Chain.AMOY; // ou Chain.POLYGON

// carteira que assina (L1)
const signer = new Wallet(process.env.PRIVATE_KEY as string);

// funder/profile address (quando necessário no seu fluxo)
const funderAddress = process.env.FUNDER as string;

// assinatura: 0 = browser wallet, 1 = magic/email
const signatureType = 1;

// 1) cria/deriva credenciais de API (L2)
const creds = await new ClobClient(host, chainId, signer).createOrDeriveApiKey();

// 2) cliente final autenticado
const client = new ClobClient(host, chainId, signer, creds, signatureType, funderAddress);
```

---

## 3) Buscar mercados

```ts
// paginação de mercados
const marketsPage = await client.getMarkets();
console.log("markets:", marketsPage);

// buscar um mercado específico pelo conditionID
const conditionId = "SEU_CONDITION_ID";
const market = await client.getMarket(conditionId);
console.log("market:", market);
```

---

## 4) Buscar livro, preço e spread

> No SDK compatível com PREVISIONS, use `outcomeId` nos métodos de leitura.

```ts
const outcomeId = "12345";

const book = await client.getOrderBook(outcomeId);
console.log("book:", book);

const priceBuy = await client.getPrice(outcomeId, "buy");
const priceSell = await client.getPrice(outcomeId, "sell");
console.log({ priceBuy, priceSell });

const spread = await client.getSpread(outcomeId);
console.log("spread:", spread);
```

Batch:

```ts
const books = await client.getOrderBooks([
  { token_id: "12345", side: Side.BUY },
  { token_id: "67890", side: Side.SELL },
]);

const prices = await client.getPrices([
  { token_id: "12345", side: Side.BUY },
  { token_id: "67890", side: Side.SELL },
]);
```

---

## 5) Criar + enviar ordem limite (trade)

```ts
const order = await client.createOrder(
  {
    tokenID: "12345",       // token/outcome do mercado
    side: Side.BUY,          // Side.BUY | Side.SELL
    price: 0.52,             // preço
    size: 100,               // quantidade
  },
  {
    tickSize: "0.01",
    negRisk: false,
  }
);

// envia a ordem ao CLOB
const posted = await client.postOrder(order, OrderType.GTC);
console.log("order posted:", posted);
```

Atalho (cria e posta em uma chamada):

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
  OrderType.GTC
);
```

---

## 6) Ordem de mercado (execução imediata)

```ts
const marketFill = await client.createAndPostMarketOrder(
  {
    tokenID: "12345",
    side: Side.BUY,
    amount: 250, // BUY: valor; SELL: shares
  },
  {
    tickSize: "0.01",
    negRisk: false,
  },
  OrderType.FOK // ou FAK
);

console.log("market order result:", marketFill);
```

---

## 7) Buscar ordens abertas

```ts
const openOrders = await client.getOpenOrders({
  market: "SEU_CONDITION_ID", // opcional
  asset_id: "12345",          // opcional
});

console.log("open orders:", openOrders);
```

Buscar ordem por id/hash:

```ts
const orderById = await client.getOrder("ORDER_HASH_OU_ID");
console.log(orderById);
```

---

## 8) Buscar trades

```ts
const trades = await client.getTrades({
  market: "SEU_CONDITION_ID", // opcional
  asset_id: "12345",          // opcional
});

console.log("trades:", trades);
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

Cancelar uma:

```ts
await client.cancelOrder({ orderID: "ORDER_HASH_OU_ID" } as any);
```

Cancelar várias:

```ts
await client.cancelOrders(["ORDER_HASH_1", "ORDER_HASH_2"]);
```

Cancelar todas:

```ts
await client.cancelAll();
```

---

## 10) Fluxo completo (resumo)

```ts
// 1. init client
// 2. getMarkets / getMarket
// 3. getOrderBook + getPrice
// 4. createAndPostOrder (ou createAndPostMarketOrder)
// 5. getOpenOrders
// 6. getTrades
// 7. cancelOrder(s) quando necessário
```

---

## Notas importantes

1. **Ambiente**: confira `host`, `chainId`, `signatureType` e `funderAddress` corretos.
2. **Tick size e negRisk**: passe os valores corretos do mercado para evitar rejeição.
3. **Compat PREVISIONS**: nos métodos de leitura do SDK compatível, a camada de compatibilidade trata mapeamentos necessários entre `outcomeId` e campos internos.
4. **Produção**: sempre adicionar retries, observabilidade e tratamento explícito de erros de rede/assinatura.
