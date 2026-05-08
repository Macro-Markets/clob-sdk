import "mocha";
import { expect } from "chai";
import {
    BUY_CLOB_ORDER_MUTATION,
    PREVIEW_ORDER_MUTATION,
    SELL_CLOB_ORDER_MUTATION,
} from "../../src/graphql/operations/index.ts";
import { buildClient } from "./helpers.ts";

describe("GraphQLSdkClient — orders", () => {
    it("previews order", async () => {
        const mocks = [
            {
                request: {
                    query: PREVIEW_ORDER_MUTATION,
                    variables: {
                        input: { operation: "BUY", amount: 12, outcome_id: 22, slippage: 1 },
                    },
                },
                result: {
                    data: {
                        previewOrder: {
                            estimated_cost: 6.5,
                            estimated_shares: 12,
                            fee_amount: 0.1,
                            fee_percentage: 2,
                            execution_price: 0.54,
                            worst_price: 0.55,
                            price_impact: 0.4,
                            has_liquidity: true,
                            insufficient_balance: false,
                            insufficient_shares: false,
                            errors: [],
                        },
                    },
                },
            },
        ];

        const client = buildClient(mocks);
        const result = await client.previewOrder({
            operation: "BUY",
            amount: 12,
            outcome_id: 22,
            slippage: 1,
        });
        expect(result.estimated_cost).to.equal(6.5);
    });

    it("executes buy and sell mutations", async () => {
        const mocks = [
            {
                request: {
                    query: BUY_CLOB_ORDER_MUTATION,
                    variables: { input: { amount: 10, outcome_id: 22, limit_price: 0.6 } },
                },
                result: {
                    data: {
                        buyClobOrder: { success: true, title: "ok", description: "ok", cost: 6 },
                    },
                },
            },
            {
                request: {
                    query: SELL_CLOB_ORDER_MUTATION,
                    variables: { input: { amount: 8, outcome_id: 22, limit_price: 0.58 } },
                },
                result: {
                    data: {
                        sellClobOrder: { success: true, title: "ok", description: "ok", cost: 4.5 },
                    },
                },
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
                request: {
                    query: PREVIEW_ORDER_MUTATION,
                    variables: {
                        input: { operation: "BUY", amount: 10, outcome_id: 33, limit_price: 0.5 },
                    },
                },
                result: {
                    data: {
                        previewOrder: {
                            estimated_cost: 5,
                            estimated_shares: 10,
                            fee_amount: 0.1,
                            fee_percentage: 2,
                            execution_price: 0.5,
                            worst_price: 0.51,
                            price_impact: 0.4,
                            has_liquidity: true,
                            insufficient_balance: false,
                            insufficient_shares: false,
                            errors: [],
                        },
                    },
                },
            },
            {
                request: {
                    query: BUY_CLOB_ORDER_MUTATION,
                    variables: { input: { amount: 10, outcome_id: 33, limit_price: 0.5 } },
                },
                result: { data: { buyClobOrder: { success: true, cost: 5 } } },
            },
            {
                request: {
                    query: PREVIEW_ORDER_MUTATION,
                    variables: {
                        input: { operation: "SELL", amount: 6, outcome_id: 33, limit_price: 0.53 },
                    },
                },
                result: {
                    data: {
                        previewOrder: {
                            estimated_cost: 3.2,
                            estimated_shares: 6,
                            fee_amount: 0.1,
                            fee_percentage: 2,
                            execution_price: 0.53,
                            worst_price: 0.52,
                            price_impact: 0.3,
                            has_liquidity: true,
                            insufficient_balance: false,
                            insufficient_shares: false,
                            errors: [],
                        },
                    },
                },
            },
            {
                request: {
                    query: SELL_CLOB_ORDER_MUTATION,
                    variables: { input: { amount: 6, outcome_id: 33, limit_price: 0.53 } },
                },
                result: { data: { sellClobOrder: { success: true, cost: 3.2 } } },
            },
        ];

        const client = buildClient(mocks);
        const buyFlow = await client.previewAndBuy({
            amount: 10,
            outcome_id: 33,
            limit_price: 0.5,
        });
        const sellFlow = await client.previewAndSell({
            amount: 6,
            outcome_id: 33,
            limit_price: 0.53,
        });

        expect((buyFlow.order as any).success).to.equal(true);
        expect(sellFlow.preview.execution_price).to.equal(0.53);
    });

    it("blocks preview helper when preview returns actionable errors", async () => {
        const mocks = [
            {
                request: {
                    query: PREVIEW_ORDER_MUTATION,
                    variables: { input: { operation: "BUY", amount: 10, outcome_id: 33 } },
                },
                result: {
                    data: {
                        previewOrder: {
                            estimated_cost: 0,
                            estimated_shares: 0,
                            fee_amount: 0,
                            fee_percentage: 0,
                            execution_price: 0,
                            worst_price: 0,
                            price_impact: 0,
                            has_liquidity: false,
                            insufficient_balance: true,
                            insufficient_shares: false,
                            errors: ["INSUFFICIENT_BALANCE"],
                        },
                    },
                },
            },
        ];

        const client = buildClient(mocks);

        let errorMessage = "";
        try {
            await client.previewAndBuy({ amount: 10, outcome_id: 33 });
        } catch (error: any) {
            errorMessage = error.message;
        }

        expect(errorMessage).to.equal("Preview BUY failed: no liquidity");
    });
});
