import "mocha";
import { expect } from "chai";
import { ApolloClient, InMemoryCache } from "@apollo/client/core";
import { MockLink } from "@apollo/client/testing/core";
import { PrevisionsGraphQLClient } from "../src/graphql/client.ts";
import {
  BUY_CLOB_ORDER_MUTATION,
  MARKET_ACTIVITY_QUERY,
  MARKET_CATEGORIES_QUERY,
  MARKET_HISTORY_QUERY,
  MARKETS_QUERY,
  MY_ORDERS_QUERY,
  ORDER_BOOK_ASKS_QUERY,
  ORDER_BOOK_BIDS_QUERY,
  PAGINATED_TRADES_QUERY,
  PREVIEW_ORDER_MUTATION,
  SELL_CLOB_ORDER_MUTATION,
  USER_MARKET_POSITIONS_QUERY,
} from "../src/graphql/operations.ts";

describe("PrevisionsGraphQLClient mocked coverage", () => {
  const endpoint = "https://api.example.com/graphql";

  const buildClient = (mocks: any[]) => {
    const apollo = new ApolloClient({
      cache: new InMemoryCache(),
      link: new MockLink(mocks),
      defaultOptions: { query: { fetchPolicy: "no-cache" } },
    });

    return new PrevisionsGraphQLClient({ endpoint }, apollo);
  };

  it("loads markets list", async () => {
    const mocks = [{
      request: {
        query: MARKETS_QUERY,
        variables: { first: 10, page: 1, language: "pt" },
      },
      result: {
        data: { marketsPredictions: { data: [{ id: 1, title: "M1" }], paginatorInfo: { total: 1, currentPage: 1 } } },
      },
    }];

    const client = buildClient(mocks);
    const result = await client.markets({ first: 10, page: 1, language: "pt" });
    expect(result.data).to.have.length(1);
  });

  it("loads categories, market history and my orders", async () => {
    const mocks = [
      {
        request: { query: MARKET_CATEGORIES_QUERY, variables: { language: "pt" } },
        result: { data: { marketCategories: [{ id: 1, slug: "politica", name: "Política", markets_count: 3 }] } },
      },
      {
        request: { query: MARKET_HISTORY_QUERY, variables: { marketPredictionId: 11, interval: "1h", first: 2, page: 1 } },
        result: { data: { marketHistory: { data: [{ timestamp: "2026-01-01T00:00:00Z", price: 0.52, volume: 320 }], paginatorInfo: { total: 1, currentPage: 1 } } } },
      },
      {
        request: { query: MY_ORDERS_QUERY, variables: { first: 10, page: 1, status: "OPEN", outcomeId: 22 } },
        result: { data: { myOrders: { data: [{ id: 99, status: "OPEN", outcome_id: 22 }], paginatorInfo: { total: 1, currentPage: 1 } } } },
      },
    ];

    const client = buildClient(mocks);
    const categories = await client.categories({ language: "pt" });
    const history = await client.marketHistory({ marketPredictionId: 11, interval: "1h", first: 2, page: 1 });
    const myOrders = await client.myOrders({ first: 10, page: 1, status: "OPEN", outcomeId: 22 });

    expect(categories[0].slug).to.equal("politica");
    expect(history.data[0].price).to.equal(0.52);
    expect(myOrders.data[0].id).to.equal(99);
  });

  it("previews order", async () => {
    const mocks = [{
      request: {
        query: PREVIEW_ORDER_MUTATION,
        variables: { input: { operation: "BUY", amount: 12, outcome_id: 22, slippage: 1 } },
      },
      result: {
        data: { previewOrder: { estimated_cost: 6.5, estimated_shares: 12, fee_amount: 0.1, fee_percentage: 2, execution_price: 0.54, worst_price: 0.55, price_impact: 0.4, has_liquidity: true, insufficient_balance: false, insufficient_shares: false, errors: [] } },
      },
    }];

    const client = buildClient(mocks);
    const result = await client.previewOrder({ operation: "BUY", amount: 12, outcome_id: 22, slippage: 1 });
    expect(result.estimated_cost).to.equal(6.5);
  });

  it("executes buy and sell mutations", async () => {
    const mocks = [
      {
        request: { query: BUY_CLOB_ORDER_MUTATION, variables: { input: { amount: 10, outcome_id: 22, limit_price: 0.6 } } },
        result: { data: { buyClobOrder: { success: true, title: "ok", description: "ok", cost: 6 } } },
      },
      {
        request: { query: SELL_CLOB_ORDER_MUTATION, variables: { input: { amount: 8, outcome_id: 22, limit_price: 0.58 } } },
        result: { data: { sellClobOrder: { success: true, title: "ok", description: "ok", cost: 4.5 } } },
      },
    ];

    const client = buildClient(mocks);
    const buy = await client.buy({ amount: 10, outcome_id: 22, limit_price: 0.6 });
    const sell = await client.sell({ amount: 8, outcome_id: 22, limit_price: 0.58 });

    expect(buy.success).to.equal(true);
    expect(sell.cost).to.equal(4.5);
  });

  it("runs preview -> buy/sell helpers", async () => {
    const mocks = [
      {
        request: { query: PREVIEW_ORDER_MUTATION, variables: { input: { operation: "BUY", amount: 10, outcome_id: 33, slippage: 1 } } },
        result: { data: { previewOrder: { estimated_cost: 5, estimated_shares: 10, fee_amount: 0.1, fee_percentage: 2, execution_price: 0.5, worst_price: 0.51, price_impact: 0.4, has_liquidity: true, insufficient_balance: false, insufficient_shares: false, errors: [] } } },
      },
      {
        request: { query: BUY_CLOB_ORDER_MUTATION, variables: { input: { amount: 10, outcome_id: 33, slippage: 1, target_price: undefined, limit_price: 0.5 } } },
        result: { data: { buyClobOrder: { success: true, cost: 5 } } },
      },
      {
        request: { query: PREVIEW_ORDER_MUTATION, variables: { input: { operation: "SELL", amount: 6, outcome_id: 33, slippage: 1 } } },
        result: { data: { previewOrder: { estimated_cost: 3.2, estimated_shares: 6, fee_amount: 0.1, fee_percentage: 2, execution_price: 0.53, worst_price: 0.52, price_impact: 0.3, has_liquidity: true, insufficient_balance: false, insufficient_shares: false, errors: [] } } },
      },
      {
        request: { query: SELL_CLOB_ORDER_MUTATION, variables: { input: { amount: 6, outcome_id: 33, slippage: 1, target_price: undefined, limit_price: 0.53 } } },
        result: { data: { sellClobOrder: { success: true, cost: 3.2 } } },
      },
    ];

    const client = buildClient(mocks);
    const buyFlow = await client.previewAndBuy({ operation: "BUY", amount: 10, outcome_id: 33, slippage: 1, limit_price: 0.5 });
    const sellFlow = await client.previewAndSell({ operation: "SELL", amount: 6, outcome_id: 33, slippage: 1, limit_price: 0.53 });

    expect(buyFlow.order.success).to.equal(true);
    expect(sellFlow.preview.execution_price).to.equal(0.53);
  });

  it("blocks preview helper when preview returns actionable errors", async () => {
    const mocks = [{
      request: { query: PREVIEW_ORDER_MUTATION, variables: { input: { operation: "BUY", amount: 10, outcome_id: 33, slippage: 1 } } },
      result: { data: { previewOrder: { estimated_cost: 0, estimated_shares: 0, fee_amount: 0, fee_percentage: 0, execution_price: 0, worst_price: 0, price_impact: 0, has_liquidity: false, insufficient_balance: true, insufficient_shares: false, errors: ["INSUFFICIENT_BALANCE"] } } },
    }];

    const client = buildClient(mocks);

    let errorMessage = "";
    try {
      await client.previewAndBuy({ operation: "BUY", amount: 10, outcome_id: 33, slippage: 1 });
    } catch (error: any) {
      errorMessage = error.message;
    }

    expect(errorMessage).to.equal("Preview BUY failed: no liquidity");
  });

  it("loads positions, activity and paginated trades", async () => {
    const mocks = [
      {
        request: { query: USER_MARKET_POSITIONS_QUERY, variables: { categorySlugIn: ["politica"] } },
        result: { data: { userMarketPositions: [{ marketPredictionId: 1, shares: 12 }] } },
      },
      {
        request: { query: MARKET_ACTIVITY_QUERY, variables: { filters: { marketPredictionId: 1 } } },
        result: { data: { marketTransactions: { results: [{ id: "tx1", operation: "buy" }] } } },
      },
      {
        request: { query: PAGINATED_TRADES_QUERY, variables: { filters: { marketPredictionId: 1, limit: 20, exclusive_start_key: "abc" } } },
        result: { data: { marketTransactions: { results: [{ id: "tx2", operation: "sell" }], paginate: { exclusive_start_key: "next", page_count: 1 } } } },
      },
    ];

    const client = buildClient(mocks);
    const positions = await client.positions(["politica"]);
    const activity = await client.activity({ marketPredictionId: 1 });
    const trades = await client.tradesPaginated({ marketPredictionId: 1, limit: 20, exclusive_start_key: "abc" });

    expect(positions[0].shares).to.equal(12);
    expect(activity.results[0].id).to.equal("tx1");
    expect(trades.paginate.exclusive_start_key).to.equal("next");
  });

  it("loads orderbook asks/bids", async () => {
    const mocks = [
      {
        request: { query: ORDER_BOOK_BIDS_QUERY, variables: { outcomeId: 44, first: 10, page: 1 } },
        result: { data: { orderBookBids: { data: [{ price: 0.51, sizes: 10 }] } } },
      },
      {
        request: { query: ORDER_BOOK_ASKS_QUERY, variables: { outcomeId: 44, first: 10, page: 1 } },
        result: { data: { orderBookAsks: { data: [{ price: 0.52, sizes: 9 }] } } },
      },
    ];

    const client = buildClient(mocks);
    const bids = await client.bids(44);
    const asks = await client.asks(44);

    expect(bids.data[0].price).to.equal(0.51);
    expect(asks.data[0].price).to.equal(0.52);
  });
});
