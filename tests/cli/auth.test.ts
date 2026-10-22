import "mocha";
import { expect } from "chai";
import { getClient, getPublicClient } from "../../src/cli/auth.ts";

describe("CLI authentication boundary", () => {
    let endpoint: string | undefined;
    let token: string | undefined;

    beforeEach(() => {
        endpoint = process.env["ENDPOINT"];
        token = process.env["API_TOKEN"];
        process.env["ENDPOINT"] = "https://api.example.com/graphql";
        delete process.env["API_TOKEN"];
    });

    afterEach(() => {
        if (endpoint === undefined) delete process.env["ENDPOINT"];
        else process.env["ENDPOINT"] = endpoint;
        if (token === undefined) delete process.env["API_TOKEN"];
        else process.env["API_TOKEN"] = token;
    });

    it("constructs public clients without a token", async () => {
        const client = await getPublicClient("en");
        expect(client.apollo).to.exist;
    });

    it("still rejects private commands without a token", async () => {
        try {
            await getClient();
            expect.fail("private client must require a token");
        } catch (error) {
            expect((error as Error).message).to.include("Missing required env var: API_TOKEN");
        }
    });

    it("requires an explicit endpoint even for public commands", async () => {
        delete process.env["ENDPOINT"];
        try {
            await getPublicClient();
            expect.fail("public client must require an endpoint");
        } catch (error) {
            expect((error as Error).message).to.include("Missing required env var: ENDPOINT");
        }
    });
});
