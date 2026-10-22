import "mocha";
import { expect } from "chai";
import { spawn } from "node:child_process";
import { createServer, type Server } from "node:http";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

describe("CLI non-interactive public data", () => {
    let server: Server;
    let endpoint: string;
    let directory: string;
    let requests: Array<{ query: string; authorization?: string }>;
    const cli = fileURLToPath(new URL("../../src/cli/index.ts", import.meta.url));

    beforeEach(async () => {
        requests = [];
        directory = await mkdtemp(join(tmpdir(), "macro-sdk-cli-test-"));
        server = createServer((request, response) => {
            let body = "";
            request.on("data", chunk => {
                body += chunk;
            });
            request.on("end", () => {
                const { query } = JSON.parse(body);
                requests.push({ query, authorization: request.headers.authorization });
                response.setHeader("Content-Type", "application/json");
                response.end(
                    JSON.stringify({
                        data: {
                            marketsPredictions: {
                                data: [
                                    {
                                        id: "1",
                                        title: "Fixture market",
                                        slug: "fixture-market",
                                        volume: 0,
                                        currency_code: "USDC",
                                        status: true,
                                    },
                                ],
                                paginatorInfo: { total: 1, currentPage: 1 },
                            },
                        },
                    }),
                );
            });
        });
        await new Promise<void>(resolve => server.listen(0, "127.0.0.1", resolve));
        const address = server.address();
        if (!address || typeof address === "string") throw new Error("test server has no port");
        endpoint = `http://127.0.0.1:${address.port}/graphql`;
    });

    afterEach(async () => {
        await new Promise<void>((resolve, reject) =>
            server.close(error => (error ? reject(error) : resolve())),
        );
        await rm(directory, { recursive: true, force: true });
    });

    const run = (
        args: string[],
    ): Promise<{ code: number | null; stdout: string; stderr: string }> =>
        new Promise((resolve, reject) => {
            const child = spawn(
                process.execPath,
                ["--import", import.meta.resolve("tsx/esm"), cli, ...args],
                {
                    cwd: directory,
                    env: { ...process.env, ENDPOINT: endpoint, API_TOKEN: "" },
                    stdio: ["ignore", "pipe", "pipe"],
                    timeout: 20000,
                },
            );
            let stdout = "";
            let stderr = "";
            child.stdout.on("data", chunk => {
                stdout += chunk;
            });
            child.stderr.on("data", chunk => {
                stderr += chunk;
            });
            child.on("error", reject);
            child.on("close", code => resolve({ code, stdout, stderr }));
        });

    it("writes valid JSON to stdout without a token or a TTY", async () => {
        const result = await run(["markets", "list", "--json"]);
        expect(result.code, result.stderr).to.equal(0);
        expect(JSON.parse(result.stdout).data[0].slug).to.equal("fixture-market");
        expect(requests).to.have.length(1);
        expect(requests[0].authorization).to.equal(undefined);
    });

    it("writes a readable table without a TTY", async () => {
        const result = await run(["markets", "list"]);
        expect(result.code, result.stderr).to.equal(0);
        expect(result.stdout).to.include("Fixture market");
    });

    for (const args of [
        ["portfolio", "positions"],
        ["orders", "cancel", "fixture-order"],
        ["orders", "buy-clob", "--outcome", "1", "--amount", "1"],
        ["activity"],
        ["trades"],
    ]) {
        it(`blocks ${args.join(" ")} without a token before HTTP`, async () => {
            const result = await run(args);
            expect(result.code).to.equal(1);
            expect(result.stderr).to.include("Missing required env var: API_TOKEN");
            expect(requests).to.have.length(0);
        });
    }
});
