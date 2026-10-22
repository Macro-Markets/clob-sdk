import { Command } from "commander";
import { SDK_VERSION } from "../version.ts";
import { marketsCommand } from "./commands/markets.ts";
import { orderbookCommand } from "./commands/orderbook.ts";
import { portfolioCommand } from "./commands/portfolio.ts";
import { ordersCommand } from "./commands/orders.ts";
import { activityCommand, tradesCommand } from "./commands/activity.ts";
import { startRepl } from "./repl.ts";
import { outputStore, isTableOutputItem } from "./store/OutputStore.ts";

const program = new Command();

program
    .name("market-sdk")
    .description(
        "CLI for Macro Markets SDK — browse prediction markets, manage orders, view portfolio",
    )
    .version(SDK_VERSION);

program.addCommand(marketsCommand);
program.addCommand(orderbookCommand);
program.addCommand(portfolioCommand);
program.addCommand(ordersCommand);
program.addCommand(activityCommand);
program.addCommand(tradesCommand);

const argv = process.argv.filter((a, i) => !(i >= 2 && a === "--"));
const userArgs = argv.slice(2);

if (userArgs.length === 0) {
    startRepl(program);
} else {
    // Non-interactive commands have no Ink renderer: flush each output block to stdout.
    const unsubscribe = outputStore.subscribe(() => {
        const item = outputStore.getItems().at(-1);
        if (!item) return;
        if (isTableOutputItem(item)) {
            console.table(item.rows, item.columns);
        } else {
            process.stdout.write(`${item.text}\n`);
        }
    });
    try {
        await program.parseAsync(argv);
    } finally {
        unsubscribe();
    }
}
