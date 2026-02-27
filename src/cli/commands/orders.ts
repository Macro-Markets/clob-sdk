import { Command } from "commander";
import { getClient } from "../auth.ts";
import { printJson, runAction } from "../format.ts";

export const ordersCommand = new Command("orders").description("Place and manage orders");

ordersCommand
    .command("preview")
    .description("Preview an order before executing")
    .requiredOption("--outcome <id>", "Outcome ID")
    .requiredOption("--amount <n>", "Amount")
    .requiredOption("--side <BUY|SELL>", "Operation side: BUY or SELL")
    .option("--limit-price <n>", "Limit price")
    .option("--slippage <n>", "Slippage tolerance")
    .action((opts) =>
        runAction(async () => {
            const client = await getClient();
            const result = await client.previewOrder({
                outcome_id: parseInt(opts.outcome, 10),
                amount: parseFloat(opts.amount),
                operation: opts.side.toUpperCase() as "BUY" | "SELL",
                limit_price: opts.limitPrice ? parseFloat(opts.limitPrice) : undefined,
                slippage: opts.slippage ? parseFloat(opts.slippage) : undefined,
            });
            printJson(result);
        }),
    );

ordersCommand
    .command("buy")
    .description("Place a buy order (CLOB)")
    .requiredOption("--outcome <id>", "Outcome ID")
    .requiredOption("--amount <n>", "Amount to spend")
    .option("--limit-price <n>", "Limit price")
    .option("--preview", "Preview before executing", false)
    .action((opts) =>
        runAction(async () => {
            const client = await getClient();
            const input = {
                outcome_id: parseInt(opts.outcome, 10),
                amount: parseFloat(opts.amount),
                limit_price: opts.limitPrice ? parseFloat(opts.limitPrice) : undefined,
            };

            if (opts.preview) {
                const result = await client.previewAndBuy(input);
                console.log("Preview:");
                printJson(result.preview);
                console.log("\nOrder result:");
                printJson(result.order);
            } else {
                const result = await client.buy(input);
                printJson(result);
            }
        }),
    );

ordersCommand
    .command("sell")
    .description("Place a sell order (CLOB)")
    .requiredOption("--outcome <id>", "Outcome ID")
    .requiredOption("--amount <n>", "Amount of shares to sell")
    .option("--limit-price <n>", "Limit price")
    .option("--preview", "Preview before executing", false)
    .action((opts) =>
        runAction(async () => {
            const client = await getClient();
            const input = {
                outcome_id: parseInt(opts.outcome, 10),
                amount: parseFloat(opts.amount),
                limit_price: opts.limitPrice ? parseFloat(opts.limitPrice) : undefined,
            };

            if (opts.preview) {
                const result = await client.previewAndSell(input);
                console.log("Preview:");
                printJson(result.preview);
                console.log("\nOrder result:");
                printJson(result.order);
            } else {
                const result = await client.sell(input);
                printJson(result);
            }
        }),
    );

ordersCommand
    .command("cancel <orderId>")
    .description("Cancel an existing order")
    .action((orderId: string) =>
        runAction(async () => {
            const client = await getClient();
            const result = await client.cancelOrder({ order_id: orderId });
            printJson(result);
        }),
    );

ordersCommand
    .command("buy-amm")
    .description("Place a buy order via AMM")
    .requiredOption("--outcome <id>", "Outcome ID")
    .requiredOption("--amount <n>", "Amount to spend")
    .option("--target-price <n>", "Target price")
    .option("--slippage <n>", "Slippage tolerance")
    .action((opts) =>
        runAction(async () => {
            const client = await getClient();
            const result = await client.buyAmm({
                outcome_id: parseInt(opts.outcome, 10),
                amount: parseFloat(opts.amount),
                target_price: opts.targetPrice ? parseFloat(opts.targetPrice) : undefined,
                slippage: opts.slippage ? parseFloat(opts.slippage) : undefined,
            });
            printJson(result);
        }),
    );

ordersCommand
    .command("sell-amm")
    .description("Place a sell order via AMM")
    .requiredOption("--outcome <id>", "Outcome ID")
    .requiredOption("--amount <n>", "Amount of shares to sell")
    .option("--target-price <n>", "Target price")
    .option("--slippage <n>", "Slippage tolerance")
    .action((opts) =>
        runAction(async () => {
            const client = await getClient();
            const result = await client.sellAmm({
                outcome_id: parseInt(opts.outcome, 10),
                amount: parseFloat(opts.amount),
                target_price: opts.targetPrice ? parseFloat(opts.targetPrice) : undefined,
                slippage: opts.slippage ? parseFloat(opts.slippage) : undefined,
            });
            printJson(result);
        }),
    );
