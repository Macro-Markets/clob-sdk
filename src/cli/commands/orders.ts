import { Command } from "commander";
import { getClient } from "../auth.ts";
import { output, printJson, printText, runAction } from "../format.ts";

export const ordersCommand = new Command("orders").description("Place and manage orders");

function formatErrors(err: unknown): string {
    if (err == null) return "";
    if (Array.isArray(err)) return err.length ? String(err[0]) : "";
    if (typeof err === "object") return JSON.stringify(err);
    return String(err);
}

ordersCommand
    .command("preview")
    .description("Preview an order before executing")
    .requiredOption("--outcome <id>", "Outcome ID")
    .requiredOption("--amount <n>", "Amount")
    .requiredOption("--side <BUY|SELL>", "Operation side: BUY or SELL")
    .option("--limit-price <n>", "Limit price")
    .option("--slippage <n>", "Slippage tolerance")
    .option("--json", "Output raw JSON", false)
    .action(opts =>
        runAction(async () => {
            const client = await getClient();
            const result = await client.previewOrder({
                outcome_id: parseInt(opts.outcome, 10),
                amount: parseFloat(opts.amount),
                operation: opts.side.toUpperCase() as "BUY" | "SELL",
                limit_price: opts.limitPrice ? parseFloat(opts.limitPrice) : undefined,
                slippage: opts.slippage ? parseFloat(opts.slippage) : undefined,
            });
            if (opts.json) {
                printJson(result);
                return;
            }
            const r = result as Record<string, unknown>;
            const row = {
                estimated_cost: r.estimated_cost,
                estimated_shares: r.estimated_shares,
                fee_amount: r.fee_amount,
                fee_percentage: r.fee_percentage,
                execution_price: r.execution_price,
                worst_price: r.worst_price,
                price_impact: r.price_impact,
                has_liquidity: r.has_liquidity,
                insufficient_balance: r.insufficient_balance,
                insufficient_shares: r.insufficient_shares,
                errors: formatErrors(r.errors),
            };
            output([row], false);
        }),
    );

ordersCommand
    .command("buy-clob")
    .description("Place a buy order via CLOB")
    .requiredOption("--outcome <id>", "Outcome ID")
    .requiredOption("--amount <n>", "Amount to spend")
    .option("--limit-price <n>", "Limit price")
    .option("--preview", "Preview before executing", false)
    .option("--json", "Output raw JSON", false)
    .action(opts =>
        runAction(async () => {
            const client = await getClient();
            const input = {
                outcome_id: parseInt(opts.outcome, 10),
                amount: parseFloat(opts.amount),
                limit_price: opts.limitPrice ? parseFloat(opts.limitPrice) : undefined,
            };

            if (opts.preview) {
                const result = await client.previewAndBuy(input);
                if (opts.json) {
                    printText("Preview:");
                    printJson(result.preview);
                    printText("Order result:");
                    printJson(result.order);
                    return;
                }
                const pr = result.preview as unknown as Record<string, unknown>;
                printText("Preview:");
                output(
                    [
                        {
                            estimated_cost: pr.estimated_cost,
                            estimated_shares: pr.estimated_shares,
                            execution_price: pr.execution_price,
                            errors: formatErrors(pr.errors),
                        },
                    ],
                    false,
                );
                printText("Order result:");
                const or = result.order as unknown as Record<string, unknown>;
                output(
                    [
                        {
                            success: or.success,
                            title: or.title,
                            description: or.description,
                            cost: or.cost,
                        },
                    ],
                    false,
                );
            } else {
                const result = await client.buy(input);
                if (opts.json) {
                    printJson(result);
                    return;
                }
                const r = result as Record<string, unknown>;
                output(
                    [
                        {
                            success: r.success,
                            title: r.title,
                            description: r.description,
                            cost: r.cost,
                        },
                    ],
                    false,
                );
            }
        }),
    );

ordersCommand
    .command("sell-clob")
    .description("Place a sell order via CLOB")
    .requiredOption("--outcome <id>", "Outcome ID")
    .requiredOption("--amount <n>", "Amount of shares to sell")
    .option("--limit-price <n>", "Limit price")
    .option("--preview", "Preview before executing", false)
    .option("--json", "Output raw JSON", false)
    .action(opts =>
        runAction(async () => {
            const client = await getClient();
            const input = {
                outcome_id: parseInt(opts.outcome, 10),
                amount: parseFloat(opts.amount),
                limit_price: opts.limitPrice ? parseFloat(opts.limitPrice) : undefined,
            };

            if (opts.preview) {
                const result = await client.previewAndSell(input);
                if (opts.json) {
                    printText("Preview:");
                    printJson(result.preview);
                    printText("Order result:");
                    printJson(result.order);
                    return;
                }
                const pr = result.preview as unknown as Record<string, unknown>;
                printText("Preview:");
                output(
                    [
                        {
                            estimated_cost: pr.estimated_cost,
                            estimated_shares: pr.estimated_shares,
                            execution_price: pr.execution_price,
                            errors: formatErrors(pr.errors),
                        },
                    ],
                    false,
                );
                printText("Order result:");
                const or = result.order as unknown as Record<string, unknown>;
                output(
                    [
                        {
                            success: or.success,
                            title: or.title,
                            description: or.description,
                            cost: or.cost,
                        },
                    ],
                    false,
                );
            } else {
                const result = await client.sell(input);
                if (opts.json) {
                    printJson(result);
                    return;
                }
                const r = result as Record<string, unknown>;
                output(
                    [
                        {
                            success: r.success,
                            title: r.title,
                            description: r.description,
                            cost: r.cost,
                        },
                    ],
                    false,
                );
            }
        }),
    );

ordersCommand
    .command("cancel <orderId>")
    .description("Cancel an existing order")
    .option("--json", "Output raw JSON", false)
    .action((orderId: string, opts) =>
        runAction(async () => {
            const client = await getClient();
            const result = await client.cancelOrder({ order_id: orderId });
            if (opts.json) {
                printJson(result);
                return;
            }
            const r = result as Record<string, unknown>;
            output(
                [
                    {
                        success: r.success,
                        title: r.title,
                        description: r.description,
                    },
                ],
                false,
            );
        }),
    );

ordersCommand
    .command("buy-amm")
    .description("Place a buy order via AMM")
    .requiredOption("--outcome <id>", "Outcome ID")
    .requiredOption("--amount <n>", "Amount to spend")
    .option("--target-price <n>", "Target price")
    .option("--slippage <n>", "Slippage tolerance")
    .option("--json", "Output raw JSON", false)
    .action(opts =>
        runAction(async () => {
            const client = await getClient();
            const result = await client.buyAmm({
                outcome_id: parseInt(opts.outcome, 10),
                amount: parseFloat(opts.amount),
                target_price: opts.targetPrice ? parseFloat(opts.targetPrice) : undefined,
                slippage: opts.slippage ? parseFloat(opts.slippage) : undefined,
            });
            if (opts.json) {
                printJson(result);
                return;
            }
            const r = result as Record<string, unknown>;
            output(
                [
                    {
                        success: r.success,
                        title: r.title,
                        description: r.description,
                        cost: r.cost,
                    },
                ],
                false,
            );
        }),
    );

ordersCommand
    .command("sell-amm")
    .description("Place a sell order via AMM")
    .requiredOption("--outcome <id>", "Outcome ID")
    .requiredOption("--amount <n>", "Amount of shares to sell")
    .option("--target-price <n>", "Target price")
    .option("--slippage <n>", "Slippage tolerance")
    .option("--json", "Output raw JSON", false)
    .action(opts =>
        runAction(async () => {
            const client = await getClient();
            const result = await client.sellAmm({
                outcome_id: parseInt(opts.outcome, 10),
                amount: parseFloat(opts.amount),
                target_price: opts.targetPrice ? parseFloat(opts.targetPrice) : undefined,
                slippage: opts.slippage ? parseFloat(opts.slippage) : undefined,
            });
            if (opts.json) {
                printJson(result);
                return;
            }
            const r = result as Record<string, unknown>;
            output(
                [
                    {
                        success: r.success,
                        title: r.title,
                        description: r.description,
                        cost: r.cost,
                    },
                ],
                false,
            );
        }),
    );
