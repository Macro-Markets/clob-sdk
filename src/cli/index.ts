import { Command } from "commander";
import { marketsCommand } from "./commands/markets.ts";
import { orderbookCommand } from "./commands/orderbook.ts";
import { portfolioCommand } from "./commands/portfolio.ts";
import { ordersCommand } from "./commands/orders.ts";
import { activityCommand, tradesCommand } from "./commands/activity.ts";
import { startRepl } from "./repl.ts";

const program = new Command();

program
    .name("market-sdk")
    .description(
        "CLI for Macro Markets SDK — browse prediction markets, manage orders, view portfolio",
    )
    .version("1.0.0");

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
    program.parse(argv);
}
