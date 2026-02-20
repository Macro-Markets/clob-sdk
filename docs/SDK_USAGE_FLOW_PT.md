# CLOB SDK — Guia de uso (API interna / Sanctum)

Documentação revisada com nomenclatura alinhada ao back.

## Convenção de nomes (usar sempre)
- `marketPredictionId` → identificador do mercado (`market_prediction_id`)
- `outcomeId` → identificador do outcome (`outcome_id`)
- `currencyCode` → moeda da wallet interna (`currency_code`)
- `orderAmount` → valor/quantidade da ordem
- `limitPrice` → preço limite

> Observação de compatibilidade da SDK:
> - alguns métodos legados ainda usam `tokenID`/`asset_id` na assinatura;
> - trate `tokenID` como equivalente a `outcomeId`.

---

## Fluxo completo (compra e venda)
1. Autenticar com Sanctum (`authToken`)
2. Consultar mercado / book / preço
3. Consultar wallet interna (`/api/v1/clob/wallet/balances`)
4. Fazer preview (`/api/v1/clob/orders/preview`)
5. Executar BUY/SELL (`/order`)
6. Consultar open orders e trades

---

## 1) Inicialização (Sanctum-first)

```ts
import { ClobClient, Chain, Side, OrderType } from "@polymarket/clob-client";

const host = "https://api.seu-dominio.com";
const chain = Chain.AMOY;
const authToken = process.env.CLOB_TOKEN!;

// helper local para esconder parâmetros legados opcionais
const createSanctumClient = (host: string, chain: Chain, authToken: string) =>
  new ClobClient(
    host,
    chain,
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

const client = createSanctumClient(host, chain, authToken);
```

---

## 2) Mercado / book / preço

```ts
const marketPredictionId = "SEU_MARKET_PREDICTION_ID";
const outcomeId = "SEU_OUTCOME_ID";

const market = await client.getMarket(marketPredictionId);
const book = await client.getOrderBook(outcomeId);
const priceBuy = await client.getPrice(outcomeId, "buy");
const spread = await client.getSpread(outcomeId);
```

---

## 3) Wallet interna (por currency)

```ts
const balances = await client.getWalletBalances();

// opcional
// const balances = await client.getWalletBalances({ include_zero_balances: true });
```

Endpoint:
- `GET /api/v1/clob/wallet/balances`

---

## 4) Preview da ordem

```ts
const outcomeId = "SEU_OUTCOME_ID";
const orderAmount = 100;
const limitPrice = 0.56;

const preview = await client.previewOrder({
  outcome_id: outcomeId,
  side: Side.BUY,
  order_type: OrderType.FOK,
  amount: orderAmount,
  price: limitPrice,
});
```

Endpoint:
- `POST /api/v1/clob/orders/preview`

---

## 5) Executar compra/venda

### Ordem limite (BUY e SELL)
```ts
const outcomeId = "SEU_OUTCOME_ID";

const buyOrder = await client.createAndPostOrder(
  {
    // assinatura legada da SDK: tokenID == outcome_id
    tokenID: outcomeId,
    side: Side.BUY,
    price: 0.56,
    size: 120,
  },
  { tickSize: "0.01", negRisk: false },
  OrderType.GTC,
);

const sellOrder = await client.createAndPostOrder(
  {
    tokenID: outcomeId,
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
    tokenID: outcomeId,
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
const outcomeId = "SEU_OUTCOME_ID";

// assinatura legada usa asset_id; equivale ao outcomeId no fluxo compat
const openOrders = await client.getOpenOrders({ asset_id: outcomeId });
const trades = await client.getTrades({ asset_id: outcomeId });
```

---

## Erros de validação esperados
- saldo insuficiente
- shares insuficientes para SELL
- `limit_price` inválido
- ordem abaixo do mínimo

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

## Observações finais
- Sem wallet externa de usuário (wallet interna no back).
- Auth oficial do fluxo: Sanctum token.
- Testes atuais da SDK são mockados (contrato/fluxo); E2E fica para etapa posterior.
