import "mocha";
import { expect } from "chai";
import {
    MARKET_CATEGORIES_QUERY,
    MARKET_HISTORY_QUERY,
    MARKETS_QUERY,
    MY_ORDER_BOOKS_QUERY,
} from "../../src/graphql/operations/index.ts";
import { buildClient } from "./helpers.ts";

describe("GraphQLSdkClient — markets", () => {
    it("loads markets list", async () => {
        const mocks = [
            {
                request: {
                    query: MARKETS_QUERY,
                    variables: { first: 10, page: 1, language: "pt" },
                },
                result: {
                    data: {
                        marketsPredictions: {
                            data: [{ id: 1, title: "M1" }],
                            paginatorInfo: { total: 1, currentPage: 1 },
                        },
                    },
                },
            },
        ];

        const client = buildClient(mocks);
        const result = await client.markets({ first: 10, page: 1, language: "pt" });
        expect(result.data).to.have.length(1);
    });

    it("loads categories", async () => {
        const mocks = [
            {
                request: { query: MARKET_CATEGORIES_QUERY, variables: { language: "pt" } },
                result: {
                    data: {
                        marketPredictionCategories: {
                            data: [{ id: 1, slug: "politica", name: "Política", total_markets: 3 }],
                        },
                    },
                },
            },
        ];

        const client = buildClient(mocks);
        const categories = await client.categories({ language: "pt" });
        expect(categories.data[0].slug).to.equal("politica");
    });

    it("loads market history", async () => {
        const mocks = [
            {
                request: {
                    query: MARKET_HISTORY_QUERY,
                    variables: { slug: "bitcoin-100k", period: "1h" },
                },
                result: {
                    data: {
                        marketHistory: [
                            {
                                outcome_id: 1,
                                outcome_title: "Yes",
                                history: [{ t: "2026-01-01T00:00:00Z", p: 0.52 }],
                            },
                        ],
                    },
                },
            },
        ];

        const client = buildClient(mocks);
        const history = await client.marketHistory({ slug: "bitcoin-100k", period: "1h" });
        expect(history[0].history[0].p).to.equal(0.52);
    });

    it("loads my order books", async () => {
        const mocks = [
            {
                request: {
                    query: MY_ORDER_BOOKS_QUERY,
                    variables: { marketPredictionId: 11, status: ["OPEN"], first: 10, page: 1 },
                },
                result: {
                    data: {
                        myOrderBooks: {
                            data: [{ id: 99, status: "OPEN", outcome_id: 22 }],
                            paginatorInfo: { total: 1, currentPage: 1 },
                        },
                    },
                },
            },
        ];

        const client = buildClient(mocks);
        const myOrderBooks = await client.myOrderBooks({
            marketPredictionId: 11,
            status: ["OPEN"],
            first: 10,
            page: 1,
        });
        expect(myOrderBooks.data[0].id).to.equal(99);
    });
});
