import "mocha";
import { expect } from "chai";
import { Side as UtilsSide, SignatureType } from "@polymarket/order-utils";
import { ClobClient } from "../src/client.ts";
import { Chain, OrderType, Side } from "../src/types.ts";
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

class FlowTestClient extends TestClient {
    public async createOrder(userOrder: any): Promise<any> {
        return {
            salt: "1",
            maker: "0xmaker",
            signer: "0xsigner",
            taker: "0xtaker",
            tokenId: userOrder.tokenID,
            makerAmount: "100",
            takerAmount: "56",
            expiration: "9999999999",
            nonce: "1",
            feeRateBps: "0",
            side: userOrder.side === Side.BUY ? UtilsSide.BUY : UtilsSide.SELL,
            signatureType: SignatureType.EOA,
            signature: "0xsig",
        };
    }
}

describe("ClobClient sanctum functional compatibility", () => {
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

    it("calls wallet balances endpoint with Sanctum auth", async () => {
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

        client.getResponse = { balances: [] };

        await client.getWalletBalances({ token_ids: ["token-1"], include_zero_balances: true });

        expect(client.lastGet?.endpoint).to.equal("https://api.example.com/api/v1/clob/wallet/balances");
        expect(client.lastGet?.options?.headers).to.deep.equal({ Authorization: `Bearer ${sanctumToken}` });
        expect(client.lastGet?.options?.params).to.deep.equal({ token_ids: ["token-1"], include_zero_balances: true });
    });

    it("calls order preview endpoint and normalizes token id aliases", async () => {
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

        client.postResponse = { ok: true };

        await client.previewOrder({ tokenID: "token-2", side: Side.BUY, amount: 15, price: 0.62 } as any);

        expect(client.lastPost?.endpoint).to.equal("https://api.example.com/api/v1/clob/orders/preview");
        expect(client.lastPost?.options?.headers).to.deep.equal({ Authorization: `Bearer ${sanctumToken}` });
        expect(client.lastPost?.options?.data).to.include({ token_id: "token-2", outcome_id: "token-2", side: Side.BUY, amount: 15, price: 0.62 });
    });

    it("executes buy/sell flow with Sanctum auth: price, preview, orders, open orders and trades", async () => {
        const sanctumToken = "test-token";
        const client = new FlowTestClient(
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

        client.getResponse = { price: "0.56" };
        await client.getPrice("token-5", Side.BUY);
        expect(client.lastGet?.endpoint).to.equal("https://api.example.com/price");
        expect(client.lastGet?.options?.params).to.deep.equal({ token_id: "token-5", outcome_id: "token-5", side: Side.BUY });

        client.postResponse = { ok: true };
        await client.previewOrder({ token_id: "token-5", side: Side.BUY, amount: 10, price: 0.56 } as any);
        expect(client.lastPost?.endpoint).to.equal("https://api.example.com/api/v1/clob/orders/preview");

        await client.createAndPostOrder(
            { tokenID: "token-5", side: Side.BUY, price: 0.56, size: 10 },
            { tickSize: "0.01", negRisk: false },
            OrderType.GTC,
        );
        expect(client.lastPost?.endpoint).to.equal("https://api.example.com/order");
        expect(client.lastPost?.options?.headers).to.deep.equal({ Authorization: `Bearer ${sanctumToken}` });
        expect((client.lastPost?.options?.data as any).order.side).to.equal(Side.BUY);

        await client.createAndPostOrder(
            { tokenID: "token-5", side: Side.SELL, price: 0.57, size: 8 },
            { tickSize: "0.01", negRisk: false },
            OrderType.GTC,
        );
        expect(client.lastPost?.endpoint).to.equal("https://api.example.com/order");
        expect((client.lastPost?.options?.data as any).order.side).to.equal(Side.SELL);

        client.getResponse = { next_cursor: "LTE=", data: [{ id: "o1", outcome_id: "token-5" }] };
        await client.getOpenOrders({ asset_id: "token-5" } as any, true);
        expect(client.lastGet?.endpoint).to.equal("https://api.example.com/data/orders");

        client.getResponse = { next_cursor: "LTE=", data: [{ id: "t1", outcome_id: "token-5", maker_orders: [] }], limit: 1, count: 1 };
        await client.getTradesPaginated({ asset_id: "token-5" } as any);
        expect(client.lastGet?.endpoint).to.equal("https://api.example.com/data/trades");
    });
});
