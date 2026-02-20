# CLOB SDK — Guia de uso (API interna / Sanctum)

Documentação atualizada para o modelo **interno** (sem wallet externa de usuário):
- autenticação via **Sanctum Bearer Token**;
- carteira/saldos vindos do **back**;
- preview antes da ordem;
- compra/venda + acompanhamento de ordens/trades.

## Fluxo completo (objetivo final)
1. Autenticar com Sanctum (`authToken`)
2. Consultar mercado/book/preço
3. Consultar wallet interna (`/api/v1/clob/wallet/balances`)
4. Fazer preview (`/api/v1/clob/orders/preview`)
5. Executar compra/venda (`/order`)
6. Consultar open orders e trades

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

## 2) Mercado / book / preço

```ts
const market = await client.getMarket("SEU_CONDITION_ID");
const book = await client.getOrderBook("TOKEN_ID");
const priceBuy = await client.getPrice("TOKEN_ID", "buy");
const spread = await client.getSpread("TOKEN_ID");
```

---

## 3) Wallet interna

```ts
const balances = await client.getWalletBalances({
  token_ids: ["TOKEN_ID"],
  include_zero_balances: false,
});
```

Endpoint usado:
- `GET /api/v1/clob/wallet/balances`

---

## 4) Preview da ordem

```ts
const preview = await client.previewOrder({
  tokenID: "TOKEN_ID",
  side: Side.BUY,
  order_type: OrderType.FOK,
  amount: 100,
  price: 0.56,
});
```

Endpoint usado:
- `POST /api/v1/clob/orders/preview`

---

## 5) Compra / venda

### Ordem limite (BUY/SELL)
```ts
const buyOrder = await client.createAndPostOrder(
  {
    tokenID: "TOKEN_ID",
    side: Side.BUY,
    price: 0.56,
    size: 120,
  },
  { tickSize: "0.01", negRisk: false },
  OrderType.GTC,
);

const sellOrder = await client.createAndPostOrder(
  {
    tokenID: "TOKEN_ID",
    side: Side.SELL,
    price: 0.58,
    size: 80,
  },
  { tickSize: "0.01", negRisk: false },
  OrderType.GTC,
);
```

### Ordem de mercado
```ts
const marketBuy = await client.createAndPostMarketOrder(
  {
    tokenID: "TOKEN_ID",
    side: Side.BUY,
    amount: 250,
  },
  { tickSize: "0.01", negRisk: false },
  OrderType.FOK,
);
```

---

## 6) Pós-execução

```ts
const openOrders = await client.getOpenOrders({ asset_id: "TOKEN_ID" });
const trades = await client.getTrades({ asset_id: "TOKEN_ID" });
```

---

## Erros de validação esperados (exemplos)

No fluxo real, trate erros de validação do back (4xx), por exemplo:
- saldo insuficiente;
- shares insuficientes para SELL;
- `limit_price` inválido;
- ordem abaixo do mínimo.

Padrão recomendado:
```ts
try {
  await client.previewOrder(payload);
  await client.createAndPostOrder(order, opts, OrderType.GTC);
} catch (err: any) {
  const message = err?.response?.data?.message || "Falha ao executar ordem";
  const errors = err?.response?.data?.errors || {};
  console.error({ message, errors });
}
```

---

## Observações importantes

- **Sem wallet externa de usuário**: a carteira é interna no back.
- **Auth oficial do fluxo**: Sanctum token.
- A SDK mantém normalização de campos para compatibilidade (`token_id`/`outcome_id`/`asset_id`).
- Testes atuais da SDK cobrem fluxo com API mockada; ideal complementar com E2E contra back real.
