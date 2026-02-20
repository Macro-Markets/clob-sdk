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

describe("ClobClient previsions compatibility", () => {
    const fakeCreds = { key: "k", secret: "cw==", passphrase: "p" };
    const fakeSigner = {
        getAddress: async () => "0x0000000000000000000000000000000000000001",
    } as any;

    it("maps token_id to outcome_id on batch book/price/spread endpoints", async () => {
        const client = new TestClient("https://api.previsions.ai", Chain.POLYGON);
        client.postResponse = [];

        const params = [{ token_id: "123", side: Side.BUY }];

        await client.getOrderBooks(params as any);
        expect(client.lastPost?.options?.data).to.deep.equal([{ outcome_id: "123", side: Side.BUY }]);

        await client.getPrices(params as any);
        expect(client.lastPost?.options?.data).to.deep.equal([{ outcome_id: "123", side: Side.BUY }]);

        await client.getSpreads(params as any);
        expect(client.lastPost?.options?.data).to.deep.equal([{ outcome_id: "123", side: Side.BUY }]);

        await client.getMidpoints(params as any);
        expect(client.lastPost?.options?.data).to.deep.equal([{ outcome_id: "123", side: Side.BUY }]);

        await client.getLastTradesPrices(params as any);
        expect(client.lastPost?.options?.data).to.deep.equal([{ outcome_id: "123", side: Side.BUY }]);
    });

    it("normalizes order book/trades/open orders responses with outcome_id back to asset_id", async () => {
        const client = new TestClient("https://api.previsions.ai", Chain.POLYGON, fakeSigner, fakeCreds as any);

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
        };
        const tradesResult = await client.getTradesPaginated({ asset_id: "outcome-2" } as any);
        expect(client.lastGet?.options?.params).to.include({ outcome_id: "outcome-2" });
        expect((tradesResult as any).trades[0].asset_id).to.equal("outcome-2");
        expect((tradesResult as any).trades[0].maker_orders[0].asset_id).to.equal("outcome-2");

        client.getResponse = {
            next_cursor: "LTE=",
            data: [{ id: "o1", outcome_id: "outcome-3" }],
        };
        const openOrders = await client.getOpenOrders({ asset_id: "outcome-3" } as any);
        expect(client.lastGet?.options?.params).to.include({ outcome_id: "outcome-3" });
        expect((openOrders as any)[0].asset_id).to.equal("outcome-3");
    });

    it("keeps public token_id/asset_id contract on non-compat hosts", async () => {
        const client = new TestClient("https://clob.polymarket.com", Chain.POLYGON, fakeSigner, fakeCreds as any);
        client.postResponse = [];
        client.getResponse = { next_cursor: "LTE=", data: [] };

        await client.getPrices([{ token_id: "123", side: Side.BUY }] as any);
        expect(client.lastPost?.options?.data).to.deep.equal([{ token_id: "123", side: Side.BUY }]);

        await client.getTradesPaginated({ asset_id: "asset-1" } as any);
        expect(client.lastGet?.options?.params).to.include({ asset_id: "asset-1" });

        await client.getOpenOrders({ asset_id: "asset-2" } as any);
        expect(client.lastGet?.options?.params).to.include({ asset_id: "asset-2" });
    });
});
