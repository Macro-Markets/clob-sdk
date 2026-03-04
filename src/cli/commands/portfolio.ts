import { Command } from "commander";
import { getClient } from "../auth.ts";
import { output, printJson, printText, runAction } from "../format.ts";

export const portfolioCommand = new Command("portfolio").description(
    "View your portfolio and positions",
);

portfolioCommand
    .command("positions")
    .description("List your open positions across markets")
    .option("--category <slugs...>", "Filter by category slugs")
    .option("--json", "Output raw JSON", false)
    .action(opts =>
        runAction(async () => {
            const client = await getClient();
            const result = await client.positions(opts.category);

            if (opts.json) {
                printJson(result);
                return;
            }

            if (Array.isArray(result) && result.length > 0) {
                const rows = result.map(p => ({
                    market: p.marketPredictionTitle,
                    outcome: p.outcomeTitle,
                    shares: p.shares,
                    avgPrice: p.avgPrice,
                    current: p.currentPrice,
                    value: p.estimatedValue,
                    pnl: p.profitLoss,
                    pnlPct: `${p.profitLossPercentage}%`,
                    currency: p.currencyCode,
                    status: p.status,
                }));
                output(rows, false);
            } else {
                printText("No open positions.");
            }
        }),
    );

portfolioCommand
    .command("my-orders")
    .description("List your order book entries")
    .option("--market-id <id>", "Filter by market prediction ID")
    .option("--status <statuses...>", "Filter by status (e.g. open filled cancelled)")
    .option("--first <n>", "Results per page", "10")
    .option("--page <n>", "Page number", "1")
    .option("--json", "Output raw JSON", false)
    .action(opts =>
        runAction(async () => {
            const client = await getClient();
            const result = await client.myOrderBooks({
                marketPredictionId: opts.marketId ? parseInt(opts.marketId, 10) : undefined,
                status: opts.status,
                first: parseInt(opts.first, 10),
                page: parseInt(opts.page, 10),
            });

            if (opts.json) {
                printJson(result);
                return;
            }

            const items =
                (result as { data?: unknown[] })?.data ?? (Array.isArray(result) ? result : []);
            if (items.length === 0) {
                printText("No orders.");
                return;
            }
            output(items, false, {
                excludeColumns: ["updated_at", "__typename"],
                dateKeys: ["created_at"],
            });
        }),
    );

portfolioCommand
    .command("details <slug>")
    .description("Get your details for a specific market prediction")
    .option("--json", "Output raw JSON", false)
    .action((slug: string, opts) =>
        runAction(async () => {
            const client = await getClient();
            const result = await client.userMarketDetails(slug);

            if (opts.json) {
                printJson(result);
                return;
            }

            printText(`Watching: ${result.isWatching ? "yes" : "no"}`);

            if (result.shareTotalsByOutcome?.length > 0) {
                printText("Share totals by outcome:");
                output(
                    result.shareTotalsByOutcome.map(s => ({
                        outcomeId: s.market_outcome_id,
                        marketId: s.market_id,
                        amount: s.amount,
                        wagered: s.wagered,
                        avgPrice: s.avg_price,
                    })),
                    false,
                );
            } else {
                printText("No shares in this market.");
            }
        }),
    );
