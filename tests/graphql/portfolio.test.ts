import "mocha";
import { expect } from "chai";
import {
    MARKET_ACTIVITY_QUERY,
    PAGINATED_TRADES_QUERY,
    USER_MARKET_POSITIONS_QUERY,
} from "../../src/graphql/operations/index.ts";
import { buildClient } from "./helpers.ts";

describe("GraphQLSdkClient — portfolio", () => {
    it("loads positions, activity and paginated trades", async () => {
        const mocks = [
            {
                request: {
                    query: USER_MARKET_POSITIONS_QUERY,
                    variables: { categorySlugIn: ["politica"] },
                },
                result: { data: { userMarketPositions: [{ marketPredictionId: 1, shares: 12 }] } },
            },
            {
                request: {
                    query: MARKET_ACTIVITY_QUERY,
                    variables: { filter: { market_prediction_id: 1 } },
                },
                result: {
                    data: { marketTransactions: { results: [{ id: "tx1", operation: "buy" }] } },
                },
            },
            {
                request: {
                    query: PAGINATED_TRADES_QUERY,
                    variables: { filter: { market_prediction_id: 1, exclusive_start_key: "abc" } },
                },
                result: {
                    data: {
                        marketTransactions: {
                            results: [{ id: "tx2", operation: "sell" }],
                            paginate: { exclusive_start_key: "next", page_count: 1 },
                        },
                    },
                },
            },
        ];

        const client = buildClient(mocks);
        const positions = await client.positions(["politica"]);
        const activity = await client.activity({ market_prediction_id: 1 });
        const trades = await client.tradesPaginated({
            market_prediction_id: 1,
            exclusive_start_key: "abc",
        });

        expect(positions[0].shares).to.equal(12);
        expect(activity.results[0].id).to.equal("tx1");
        expect(trades.paginate.exclusive_start_key).to.equal("next");
    });
});
