import { Command } from "commander";
import { getPublicClient } from "../auth.ts";
import { output, printJson, printText, runAction } from "../format.ts";

export const orderbookCommand = new Command("orderbook").description(
    "View order book data for outcomes",
);

orderbookCommand
    .command("show")
    .description("Full order book (bids + asks) for an outcome")
    .requiredOption("--outcome <id>", "Outcome ID")
    .option("--json", "Output raw JSON", false)
    .action((opts: { outcome: string; json?: boolean }) =>
        runAction(async () => {
            const client = await getPublicClient();
            const result = await client.orderBook(parseInt(opts.outcome, 10));

            if (opts.json) {
                printJson(result);
                return;
            }

            printText(`Last trade price: ${result.last_trade_price}`);

            const formatSizes = (s: unknown): string =>
                Array.isArray(s) ? (s as number[]).join(", ") : String(s ?? "");

            printText("BIDS:");
            if (result.bids?.length) {
                output(
                    result.bids.map((b: { price?: unknown; sizes?: unknown }) => ({
                        price: b.price,
                        sizes: formatSizes(b.sizes),
                    })),
                    false,
                );
            } else {
                printText("  (none)");
            }

            printText("ASKS:");
            if (result.asks?.length) {
                output(
                    result.asks.map((a: { price?: unknown; sizes?: unknown }) => ({
                        price: a.price,
                        sizes: formatSizes(a.sizes),
                    })),
                    false,
                );
            } else {
                printText("  (none)");
            }
        }),
    );

orderbookCommand
    .command("bids")
    .description("List bids for an outcome")
    .requiredOption("--outcome <id>", "Outcome ID")
    .option("--first <n>", "Results per page", "10")
    .option("--page <n>", "Page number", "1")
    .option("--json", "Output raw JSON", false)
    .action((opts: { outcome: string; first: string; page: string; json?: boolean }) =>
        runAction(async () => {
            const client = await getPublicClient();
            const result = await client.bids(
                parseInt(opts.outcome, 10),
                parseInt(opts.first, 10),
                parseInt(opts.page, 10),
            );

            if (opts.json) {
                printJson(result);
                return;
            }

            const items =
                (result as { data?: unknown[] })?.data ?? (Array.isArray(result) ? result : []);
            if (items.length === 0) {
                printText("No bids.");
                return;
            }
            output(
                items.map((b: Record<string, unknown>) => ({
                    price: b.price,
                    sizes: Array.isArray(b.sizes) ? (b.sizes as number[]).join(", ") : b.sizes,
                })),
                false,
            );
        }),
    );

orderbookCommand
    .command("asks")
    .description("List asks for an outcome")
    .requiredOption("--outcome <id>", "Outcome ID")
    .option("--first <n>", "Results per page", "10")
    .option("--page <n>", "Page number", "1")
    .option("--json", "Output raw JSON", false)
    .action((opts: { outcome: string; first: string; page: string; json?: boolean }) =>
        runAction(async () => {
            const client = await getPublicClient();
            const result = await client.asks(
                parseInt(opts.outcome, 10),
                parseInt(opts.first, 10),
                parseInt(opts.page, 10),
            );

            if (opts.json) {
                printJson(result);
                return;
            }

            const items =
                (result as { data?: unknown[] })?.data ?? (Array.isArray(result) ? result : []);
            if (items.length === 0) {
                printText("No asks.");
                return;
            }
            output(
                items.map((a: Record<string, unknown>) => ({
                    price: a.price,
                    sizes: Array.isArray(a.sizes) ? (a.sizes as number[]).join(", ") : a.sizes,
                })),
                false,
            );
        }),
    );
