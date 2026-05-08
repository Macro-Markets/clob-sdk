import "mocha";
import { expect } from "chai";
import {
    ORDER_BOOK_ASKS_QUERY,
    ORDER_BOOK_BIDS_QUERY,
} from "../../src/graphql/operations/index.ts";
import { buildClient } from "./helpers.ts";

describe("GraphQLSdkClient — orderbook", () => {
    it("loads orderbook asks and bids", async () => {
        const mocks = [
            {
                request: {
                    query: ORDER_BOOK_BIDS_QUERY,
                    variables: { outcomeId: 44, first: 10, page: 1 },
                },
                result: { data: { orderBookBids: { data: [{ price: 0.51, sizes: 10 }] } } },
            },
            {
                request: {
                    query: ORDER_BOOK_ASKS_QUERY,
                    variables: { outcomeId: 44, first: 10, page: 1 },
                },
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
