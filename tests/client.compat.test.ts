import "mocha";
import { expect } from "chai";
import { ClobClient } from "../src/client.ts";
import { Chain, Side } from "../src/types.ts";
import type { RequestOptions } from "../src/http-helpers/index.ts";

class TestClient extends ClobClient {
    public lastGet?: { endpoint: string; options?: RequestOptions };
    public lastPost?: { endpoint: string; options?: RequestOptions };
    public getResponse: any = {};
    public postResponse: any = {};

    protected async get(endpoint: string, options?: RequestOptions) {
        this.lastGet = { endpoint, options };
        return this.getResponse;
    }

    protected async post(endpoint: string, options?: RequestOptions) {
        this.lastPost = { endpoint, options };
        return this.postResponse;
    }
}

describe("ClobClient previsions functional compatibility", () => {
    it("maps token_id to outcome_id on batch endpoints without host-coupling", async () => {
        const client = new TestClient("https://clob.polymarket.com", Chain.POLYGON);
        client.postResponse = [];

        const params = [{ token_id: "123", side: Side.BUY }];

        await client.getOrderBooks(params as any);
        expect(client.lastPost?.options?.data).to.deep.equal([
            { token_id: "123", outcome_id: "123", side: Side.BUY },
        ]);

        await client.getPrices(params as any);
        expect(client.lastPost?.options?.data).to.deep.equal([
            { token_id: "123", outcome_id: "123", side: Side.BUY },
        ]);

        await client.getSpreads(params as any);
        expect(client.lastPost?.options?.data).to.deep.equal([
            { token_id: "123", outcome_id: "123", side: Side.BUY },
        ]);
    });

    it("normalizes outcome_id responses back to asset_id", async () => {
        const client = new TestClient(
            "https://api.example.com",
            Chain.POLYGON,
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
            "test-token",
        );

        client.postResponse = [{ outcome_id: "outcome-1", bids: [], asks: [], tick_size: "0.01" }];
        const books = await client.getOrderBooks([{ token_id: "outcome-1", side: Side.BUY }] as any);
        expect(books[0].asset_id).to.equal("outcome-1");

        client.getResponse = {
            next_cursor: "LTE=",
            data: [
                {
                    id: "t1",
                    outcome_id: "outcome-2",
                    maker_orders: [{ outcome_id: "outcome-2" }],
                },
            ],
            limit: 1,
            count: 1,
        };

        const tradesResult = await client.getTradesPaginated({ asset_id: "outcome-2" } as any);
        expect(client.lastGet?.options?.params).to.include({ asset_id: "outcome-2", outcome_id: "outcome-2" });
        expect((tradesResult as any).trades[0].asset_id).to.equal("outcome-2");
        expect((tradesResult as any).trades[0].maker_orders[0].asset_id).to.equal("outcome-2");
    });

    it("allows L2 requests with Sanctum token and no signer", async () => {
        const sanctumToken = "test-token";
        const client = new TestClient(
            "https://api.example.com",
            Chain.POLYGON,
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
            sanctumToken,
        );

        client.getResponse = { next_cursor: "LTE=", data: [{ id: "o1", outcome_id: "outcome-3" }] };

        const openOrders = await client.getOpenOrders({ asset_id: "outcome-3" } as any, true);

        expect(client.lastGet?.options?.headers).to.deep.equal({ Authorization: `Bearer ${sanctumToken}` });
        expect(client.lastGet?.options?.params).to.include({ asset_id: "outcome-3", outcome_id: "outcome-3" });
        expect((openOrders as any)[0].asset_id).to.equal("outcome-3");
    });
});
