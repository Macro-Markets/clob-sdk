import "mocha";
import { expect } from "chai";
import { createGraphQLClient } from "../src/factories.ts";

describe("createGraphQLClient", () => {
    it("returns a GraphQL client instance with expected methods", () => {
        const client = createGraphQLClient("https://api.example.com/graphql", "test-token", "pt", {
            "X-Custom": "value",
        });

        expect(client).to.exist;
        expect(client.apollo).to.exist;
        expect(typeof client.markets).to.equal("function");
        expect(typeof client.me).to.equal("function");
        expect(typeof client.marketBySlug).to.equal("function");
        expect(typeof client.categories).to.equal("function");
        expect(typeof client.orderBook).to.equal("function");
        expect(typeof client.buy).to.equal("function");
        expect(typeof client.sell).to.equal("function");
    });

    it("uses default locale when not provided", () => {
        const client = createGraphQLClient("https://api.example.com/graphql", "token");
        expect(client).to.exist;
        expect(client.apollo).to.exist;
    });
});
