import "mocha";
import { expect } from "chai";
import {
    PREVIEW_ORDER_MUTATION,
    BUY_CLOB_ORDER_MUTATION,
} from "../../src/graphql/operations/index.ts";
import { buildClient } from "./helpers.ts";

const validPreview = {
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
};

describe("GraphQLSdkClient — previewAndBuy / previewAndSell (ensurePreviewCanExecute)", () => {
    it("throws when preview response is null/empty", async () => {
        const mocks = [
            {
                request: {
                    query: PREVIEW_ORDER_MUTATION,
                    variables: {
                        input: { operation: "BUY", amount: 10, outcome_id: 1, limit_price: 0.5 },
                    },
                },
                result: { data: { previewOrder: null } },
            },
        ];
        const client = buildClient(mocks);
        let errMsg = "";
        try {
            await client.previewAndBuy({ amount: 10, outcome_id: 1, limit_price: 0.5 });
        } catch (e: any) {
            errMsg = e.message;
        }
        expect(errMsg).to.equal("Preview BUY failed: empty response");
    });

    it("throws when has_liquidity is false", async () => {
        const mocks = [
            {
                request: {
                    query: PREVIEW_ORDER_MUTATION,
                    variables: {
                        input: { operation: "BUY", amount: 10, outcome_id: 2, limit_price: 0.5 },
                    },
                },
                result: {
                    data: {
                        previewOrder: {
                            ...validPreview,
                            has_liquidity: false,
                        },
                    },
                },
            },
        ];
        const client = buildClient(mocks);
        let errMsg = "";
        try {
            await client.previewAndBuy({ amount: 10, outcome_id: 2, limit_price: 0.5 });
        } catch (e: any) {
            errMsg = e.message;
        }
        expect(errMsg).to.equal("Preview BUY failed: no liquidity");
    });

    it("throws when insufficient_balance and allowInsufficientBalance is false", async () => {
        const mocks = [
            {
                request: {
                    query: PREVIEW_ORDER_MUTATION,
                    variables: {
                        input: { operation: "BUY", amount: 10, outcome_id: 3, limit_price: 0.5 },
                    },
                },
                result: {
                    data: {
                        previewOrder: {
                            ...validPreview,
                            insufficient_balance: true,
                        },
                    },
                },
            },
        ];
        const client = buildClient(mocks);
        let errMsg = "";
        try {
            await client.previewAndBuy(
                { amount: 10, outcome_id: 3, limit_price: 0.5 },
                { allowInsufficientBalance: false },
            );
        } catch (e: any) {
            errMsg = e.message;
        }
        expect(errMsg).to.equal("Preview BUY failed: insufficient balance");
    });

    it("succeeds when insufficient_balance but allowInsufficientBalance is true", async () => {
        const mocks = [
            {
                request: {
                    query: PREVIEW_ORDER_MUTATION,
                    variables: {
                        input: { operation: "BUY", amount: 10, outcome_id: 4, limit_price: 0.5 },
                    },
                },
                result: {
                    data: {
                        previewOrder: {
                            ...validPreview,
                            insufficient_balance: true,
                        },
                    },
                },
            },
            {
                request: {
                    query: BUY_CLOB_ORDER_MUTATION,
                    variables: { input: { amount: 10, outcome_id: 4, limit_price: 0.5 } },
                },
                result: { data: { buyClobOrder: { success: true, cost: 5 } } },
            },
        ];
        const client = buildClient(mocks);
        const result = await client.previewAndBuy(
            { amount: 10, outcome_id: 4, limit_price: 0.5 },
            { allowInsufficientBalance: true },
        );
        expect(result.preview.insufficient_balance).to.equal(true);
        expect((result.order as any).success).to.equal(true);
    });

    it("throws when insufficient_shares and allowInsufficientShares is false", async () => {
        const mocks = [
            {
                request: {
                    query: PREVIEW_ORDER_MUTATION,
                    variables: {
                        input: { operation: "SELL", amount: 100, outcome_id: 5, limit_price: 0.5 },
                    },
                },
                result: {
                    data: {
                        previewOrder: {
                            ...validPreview,
                            operation: "SELL",
                            insufficient_shares: true,
                        },
                    },
                },
            },
        ];
        const client = buildClient(mocks);
        let errMsg = "";
        try {
            await client.previewAndSell(
                { amount: 100, outcome_id: 5, limit_price: 0.5 },
                { allowInsufficientShares: false },
            );
        } catch (e: any) {
            errMsg = e.message;
        }
        expect(errMsg).to.equal("Preview SELL failed: insufficient shares");
    });

    it("throws when preview.errors is non-empty", async () => {
        const mocks = [
            {
                request: {
                    query: PREVIEW_ORDER_MUTATION,
                    variables: {
                        input: { operation: "BUY", amount: 10, outcome_id: 6, limit_price: 0.5 },
                    },
                },
                result: {
                    data: {
                        previewOrder: {
                            ...validPreview,
                            errors: ["MARKET_CLOSED", "INVALID_PRICE"],
                        },
                    },
                },
            },
        ];
        const client = buildClient(mocks);
        let errMsg = "";
        try {
            await client.previewAndBuy({ amount: 10, outcome_id: 6, limit_price: 0.5 });
        } catch (e: any) {
            errMsg = e.message;
        }
        expect(errMsg).to.include("Preview BUY failed:");
        expect(errMsg).to.include("MARKET_CLOSED");
        expect(errMsg).to.include("INVALID_PRICE");
    });
});
