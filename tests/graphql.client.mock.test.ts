import "mocha";
import { expect } from "chai";
import { ApolloClient, InMemoryCache } from "@apollo/client/core";
import { MockLink } from "@apollo/client/testing/core";
import { PrevisionsGraphQLClient } from "../src/graphql/client.ts";
import {
  BUY_CLOB_ORDER_MUTATION,
  MARKET_ACTIVITY_QUERY,
  MARKETS_QUERY,
  ORDER_BOOK_ASKS_QUERY,
  ORDER_BOOK_BIDS_QUERY,
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

  it("loads positions and activity", async () => {
    const mocks = [
      {
        request: { query: USER_MARKET_POSITIONS_QUERY, variables: { categorySlugIn: ["politica"] } },
        result: { data: { userMarketPositions: [{ marketPredictionId: 1, shares: 12 }] } },
      },
      {
        request: { query: MARKET_ACTIVITY_QUERY, variables: { filters: { marketPredictionId: 1 } } },
        result: { data: { marketTransactions: { results: [{ id: "tx1", operation: "buy" }] } } },
      },
    ];

    const client = buildClient(mocks);
    const positions = await client.positions(["politica"]);
    const activity = await client.activity({ marketPredictionId: 1 });

    expect(positions[0].shares).to.equal(12);
    expect(activity.results[0].id).to.equal("tx1");
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
