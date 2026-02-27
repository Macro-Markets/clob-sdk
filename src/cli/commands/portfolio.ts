import { Command } from "commander";
import { getClient } from "../auth.ts";
import { output, printJson, runAction } from "../format.ts";

export const portfolioCommand = new Command("portfolio").description(
    "View your portfolio and positions",
);

portfolioCommand
    .command("positions")
    .description("List your open positions across markets")
    .option("--category <slugs...>", "Filter by category slugs")
    .option("--json", "Output raw JSON", false)
    .action((opts) =>
        runAction(async () => {
            const client = await getClient();
            const result = await client.positions(opts.category);

            if (opts.json) {
                printJson(result);
                return;
            }

            if (Array.isArray(result) && result.length > 0) {
                const rows = result.map((p) => ({
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
                console.log("No open positions.");
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
    .action((opts) =>
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

            const items = result?.data ?? result;
            if (Array.isArray(items) && items.length > 0) {
                output(items, false);
            } else {
                printJson(result);
            }
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

            console.log(`Watching: ${result.isWatching ? "yes" : "no"}\n`);

            if (result.shareTotalsByOutcome?.length > 0) {
                console.log("Share totals by outcome:");
                output(
                    result.shareTotalsByOutcome.map((s) => ({
                        outcomeId: s.market_outcome_id,
                        marketId: s.market_id,
                        amount: s.amount,
                        wagered: s.wagered,
                        avgPrice: s.avg_price,
                    })),
                    false,
                );
            } else {
                console.log("No shares in this market.");
            }
        }),
    );
