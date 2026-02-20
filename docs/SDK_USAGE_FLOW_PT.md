# CLOB SDK — Guia de uso (Previsions / Sanctum)

Fluxo atualizado da SDK para a API interna, com **Sanctum-first**, wallet interna e preview antes da ordem.

## Fluxo real recomendado
1. Inicializar client com `authToken` (Sanctum)
2. Consultar mercados / book
3. Consultar **wallet interna** (`/api/v1/clob/wallet/balances`)
4. Fazer **preview** da ordem (`/api/v1/clob/orders/preview`)
5. Enviar ordem (compra/trade)
6. Consultar ordens abertas e trades

---

## 1) Inicialização (Sanctum-first)

```ts
import { ClobClient, Chain, Side, OrderType } from "@polymarket/clob-client";

const client = new ClobClient(
  "https://api.seu-dominio.com",
  Chain.AMOY,
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
  process.env.CLOB_TOKEN, // Bearer token Sanctum
);
```

---

## 2) Mercado e book

```ts
const market = await client.getMarket("SEU_CONDITION_ID");
const book = await client.getOrderBook("TOKEN_ID");
const spread = await client.getSpread("TOKEN_ID");
```

---

## 3) Wallet interna (novo endpoint)

```ts
const balances = await client.getWalletBalances({
  token_ids: ["TOKEN_ID"],
  include_zero_balances: false,
});

console.log(balances);
```

Endpoint utilizado pela SDK:
- `GET /api/v1/clob/wallet/balances`

---

## 4) Preview da ordem (novo endpoint)

> Faça preview antes de enviar ordem para validar execução esperada, custos e campos internos.

```ts
const preview = await client.previewOrder({
  tokenID: "TOKEN_ID", // SDK aceita tokenID e mapeia para token_id/outcome_id
  side: Side.BUY,
  order_type: OrderType.FOK,
  amount: 100,
  price: 0.56,
});

console.log(preview);
```

Endpoint utilizado pela SDK:
- `POST /api/v1/clob/orders/preview`

---

## 5) Compra / trade

### Ordem limite
```ts
const posted = await client.createAndPostOrder(
  {
    tokenID: "TOKEN_ID",
    side: Side.BUY,
    price: 0.56,
    size: 120,
  },
  {
    tickSize: "0.01",
    negRisk: false,
  },
  OrderType.GTC,
);
```

### Ordem de mercado
```ts
const postedMarket = await client.createAndPostMarketOrder(
  {
    tokenID: "TOKEN_ID",
    side: Side.BUY,
    amount: 250,
  },
  {
    tickSize: "0.01",
    negRisk: false,
  },
  OrderType.FOK,
);
```

---

## 6) Pós-envio

```ts
const openOrders = await client.getOpenOrders({ asset_id: "TOKEN_ID" });
const trades = await client.getTrades({ asset_id: "TOKEN_ID" });
```

---

## Notas de compatibilidade
- SDK mantém mapeamentos de compatibilidade (`token_id`/`outcome_id` e `asset_id` de retorno).
- Fluxo interno recomendado é Sanctum-first (`authToken`) sem depender de signer no cliente.
- Para criação/assinatura de ordens (`createOrder`/`createAndPostOrder`), signer continua necessário.