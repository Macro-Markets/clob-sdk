/**
 * Central help data: exact usage and description for every command.
 * This is the single source of truth for the help guide (searches and queries).
 */
export interface HelpRow {
    Command: string;
    Usage: string;
    Description: string;
}

export const HELP_ROWS: HelpRow[] = [
    {
        Command: "markets list",
        Usage: "[--first <n>] [--page <n>] [--language <lang>] [--keyword <kw>] [--category <slug...>]",
        Description: "List markets with pagination (--language sent as Accept-Language header)",
    },
    {
        Command: "markets get",
        Usage: "<slug> [--language <lang>]",
        Description: "Get a single market by slug (--language sent as Accept-Language header)",
    },
    {
        Command: "markets categories",
        Usage: "[--language <lang>]",
        Description: "List market categories (--language sent as Accept-Language header)",
    },
    {
        Command: "markets history",
        Usage: "<slug> [--language <lang>] [--period 1h|1d|1w|1m|all]",
        Description: "Get market price history (--language sent as Accept-Language header)",
    },
    // --- orderbook ---
    {
        Command: "orderbook show",
        Usage: "<outcomeId>",
        Description: "Full order book (bids + asks) for an outcome",
    },
    {
        Command: "orderbook bids",
        Usage: "<outcomeId> [--first <n>] [--page <n>]",
        Description: "List bids for an outcome",
    },
    {
        Command: "orderbook asks",
        Usage: "<outcomeId> [--first <n>] [--page <n>]",
        Description: "List asks for an outcome",
    },
    // --- portfolio ---
    {
        Command: "portfolio positions",
        Usage: "[--category <slug...>]",
        Description: "List your open positions across markets",
    },
    {
        Command: "portfolio my-orders",
        Usage: "[--market-id <id>] [--status <open|filled|cancelled...>] [--first <n>] [--page <n>]",
        Description: "List your order book entries",
    },
    {
        Command: "portfolio details",
        Usage: "<slug>",
        Description: "Get your details for a specific market prediction",
    },
    // --- orders ---
    {
        Command: "orders preview",
        Usage: "--outcome <id> --amount <n> --side BUY|SELL [--limit-price <n>] [--slippage <n>]",
        Description: "Preview an order before executing",
    },
    {
        Command: "orders buy-clob",
        Usage: "--outcome <id> --amount <n> [--limit-price <n>] [--preview]",
        Description: "Place a buy order via CLOB",
    },
    {
        Command: "orders sell-clob",
        Usage: "--outcome <id> --amount <n> [--limit-price <n>] [--preview]",
        Description: "Place a sell order via CLOB",
    },
    {
        Command: "orders cancel",
        Usage: "<orderId>",
        Description: "Cancel an existing order",
    },
    {
        Command: "orders buy-amm",
        Usage: "--outcome <id> --amount <n> [--target-price <n>] [--slippage <n>]",
        Description: "Place a buy order via AMM",
    },
    {
        Command: "orders sell-amm",
        Usage: "--outcome <id> --amount <n> [--target-price <n>] [--slippage <n>]",
        Description: "Place a sell order via AMM",
    },
    // --- activity & trades ---
    {
        Command: "activity",
        Usage: "[--market-prediction-id <id>] [--market-id <id>] [--outcome-id <id>] [--first <n>]",
        Description: "View market activity/transactions (limit 10–100)",
    },
    {
        Command: "trades",
        Usage: "[--market-prediction-id <id>] [--market-id <id>] [--outcome-id <id>] [--first <n>]",
        Description: "View paginated trade history (limit 10–100)",
    },
    // --- shell ---
    { Command: "help", Usage: "", Description: "Show this help" },
    { Command: "clear", Usage: "", Description: "Clear the screen" },
    { Command: "exit", Usage: "", Description: "Exit the shell" },
];

export function getHelpTableData(): { columns: string[]; rows: Record<string, unknown>[] } {
    return {
        columns: ["Command", "Usage", "Description"],
        rows: HELP_ROWS.map(row => ({ ...row })),
    };
}
