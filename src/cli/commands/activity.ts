import { Command } from "commander";
import { getClient } from "../auth.ts";
import { printJson, runAction } from "../format.ts";
import type { MarketFilter } from "../../graphql/types/index.ts";

export const activityCommand = new Command("activity")
    .description("View market activity / transactions")
    .option("--market-prediction-id <id>", "Filter by market prediction ID")
    .option("--market-id <id>", "Filter by market ID")
    .option("--outcome-id <id>", "Filter by outcome ID")
    .option("--first <n>", "Number of results", "20")
    .option("--json", "Output raw JSON", false)
    .action((opts) =>
        runAction(async () => {
            const client = await getClient();
            const filter: MarketFilter = {};
            if (opts.marketPredictionId)
                filter.market_prediction_id = parseInt(opts.marketPredictionId, 10);
            if (opts.marketId) filter.market_id = parseInt(opts.marketId, 10);
            if (opts.outcomeId) filter.outcome_id = parseInt(opts.outcomeId, 10);
            if (opts.first) filter.first = parseInt(opts.first, 10);

            const result = await client.activity(filter);
            printJson(result);
        }),
    );

export const tradesCommand = new Command("trades")
    .description("View paginated trade history")
    .option("--market-prediction-id <id>", "Filter by market prediction ID")
    .option("--market-id <id>", "Filter by market ID")
    .option("--outcome-id <id>", "Filter by outcome ID")
    .option("--first <n>", "Number of results", "20")   
    .option("--json", "Output raw JSON", false)
    .action((opts) =>
        runAction(async () => {
            const client = await getClient();
            const filter: MarketFilter = {};
            if (opts.marketPredictionId)
                filter.market_prediction_id = parseInt(opts.marketPredictionId, 10);
            if (opts.marketId) filter.market_id = parseInt(opts.marketId, 10);
            if (opts.outcomeId) filter.outcome_id = parseInt(opts.outcomeId, 10);
            if (opts.first) filter.first = parseInt(opts.first, 10);

            const result = await client.tradesPaginated(filter);
            printJson(result);
        }),
    );
