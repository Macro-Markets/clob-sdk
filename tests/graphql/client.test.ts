import "mocha";
import { expect } from "chai";
import {
    BUY_AMM_ORDER_MUTATION,
    CANCEL_CLOB_ORDER_MUTATION,
    MARKET_QUERY,
    ME_QUERY,
    ORDER_BOOK_QUERY,
    SELL_AMM_ORDER_MUTATION,
} from "../../src/graphql/operations/index.ts";
import { buildClient } from "./helpers.ts";

describe("GraphQLSdkClient — me, marketBySlug, orderBook, mutations", () => {
    it("loads me (current user)", async () => {
        const mocks = [
            {
                request: { query: ME_QUERY },
                result: {
                    data: {
                        me: {
                            id: 42,
                            username: "jane",
                            display_name: "Jane",
                            email: "jane@example.com",
                            created_at: "2025-01-01T00:00:00Z",
                        },
                    },
                },
            },
        ];
        const client = buildClient(mocks);
        const me = await client.me();
        expect(me.id).to.equal(42);
        expect(me.username).to.equal("jane");
        expect(me.email).to.equal("jane@example.com");
    });

    it("loads market by slug", async () => {
        const mocks = [
            {
                request: { query: MARKET_QUERY, variables: { slug: "bitcoin-100k" } },
                result: {
                    data: {
                        marketPrediction: {
                            id: 7,
                            title: "Bitcoin $100k",
                            slug: "bitcoin-100k",
                            currency_code: "USDT",
                        },
                    },
                },
            },
        ];
        const client = buildClient(mocks);
        const market = await client.marketBySlug("bitcoin-100k");
        expect(market.id).to.equal(7);
        expect(market.slug).to.equal("bitcoin-100k");
        expect(market.currency_code).to.equal("USDT");
    });

    it("loads full order book", async () => {
        const mocks = [
            {
                request: { query: ORDER_BOOK_QUERY, variables: { outcomeId: 10 } },
                result: {
                    data: {
                        orderBook: {
                            asks: [{ price: 0.55, sizes: 20 }],
                            bids: [{ price: 0.45, sizes: 15 }],
                            last_trade_price: 0.5,
                        },
                    },
                },
            },
        ];
        const client = buildClient(mocks);
        const book = await client.orderBook(10);
        expect(book.asks).to.have.length(1);
        expect(book.asks[0].price).to.equal(0.55);
        expect(book.bids[0].price).to.equal(0.45);
        expect(book.last_trade_price).to.equal(0.5);
    });

    it("cancels CLOB order", async () => {
        const mocks = [
            {
                request: {
                    query: CANCEL_CLOB_ORDER_MUTATION,
                    variables: { input: { order_id: "ord-123" } },
                },
                result: {
                    data: {
                        cancelClobOrder: {
                            success: true,
                            title: "Cancelled",
                            description: "Order cancelled",
                        },
                    },
                },
            },
        ];
        const client = buildClient(mocks);
        const result = await client.cancelOrder({ order_id: "ord-123" });
        expect(result.success).to.equal(true);
        expect(result.title).to.equal("Cancelled");
    });

    it("executes buy AMM order", async () => {
        const mocks = [
            {
                request: {
                    query: BUY_AMM_ORDER_MUTATION,
                    variables: {
                        input: { amount: 50, outcome_id: 11, target_price: 0.6, slippage: 2 },
                    },
                },
                result: {
                    data: {
                        buyAmmOrder: {
                            success: true,
                            title: "Filled",
                            description: "AMM buy filled",
                            cost: 30,
                        },
                    },
                },
            },
        ];
        const client = buildClient(mocks);
        const result = await client.buyAmm({
            amount: 50,
            outcome_id: 11,
            target_price: 0.6,
            slippage: 2,
        });
        expect(result.success).to.equal(true);
        expect(result.cost).to.equal(30);
    });

    it("executes sell AMM order", async () => {
        const mocks = [
            {
                request: {
                    query: SELL_AMM_ORDER_MUTATION,
                    variables: {
                        input: { amount: 25, outcome_id: 11, target_price: 0.58 },
                    },
                },
                result: {
                    data: {
                        sellAmmOrder: {
                            success: true,
                            title: "Filled",
                            description: "AMM sell filled",
                            cost: 14.5,
                        },
                    },
                },
            },
        ];
        const client = buildClient(mocks);
        const result = await client.sellAmm({
            amount: 25,
            outcome_id: 11,
            target_price: 0.58,
        });
        expect(result.success).to.equal(true);
        expect(result.cost).to.equal(14.5);
    });
});
