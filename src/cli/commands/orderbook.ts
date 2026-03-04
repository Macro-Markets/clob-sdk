import { Command } from "commander";
import { getClient } from "../auth.ts";
import { output, printJson, printText, runAction } from "../format.ts";

export const orderbookCommand = new Command("orderbook").description(
    "View order book data for outcomes",
);

orderbookCommand
    .command("show <outcomeId>")
    .description("Full order book (bids + asks) for an outcome")
    .option("--json", "Output raw JSON", false)
    .action((outcomeId: string, opts) =>
        runAction(async () => {
            const client = await getClient();
            const result = await client.orderBook(parseInt(outcomeId, 10));

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
    .command("bids <outcomeId>")
    .description("List bids for an outcome")
    .option("--first <n>", "Results per page", "10")
    .option("--page <n>", "Page number", "1")
    .option("--json", "Output raw JSON", false)
    .action((outcomeId: string, opts) =>
        runAction(async () => {
            const client = await getClient();
            const result = await client.bids(
                parseInt(outcomeId, 10),
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
    .command("asks <outcomeId>")
    .description("List asks for an outcome")
    .option("--first <n>", "Results per page", "10")
    .option("--page <n>", "Page number", "1")
    .option("--json", "Output raw JSON", false)
    .action((outcomeId: string, opts) =>
        runAction(async () => {
            const client = await getClient();
            const result = await client.asks(
                parseInt(outcomeId, 10),
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
