import { Command } from "commander";
import { getClient } from "../auth.ts";
import { output, printJson, printText, runAction } from "../format.ts";

export const marketsCommand = new Command("markets").description("Browse prediction markets");

marketsCommand
    .command("list")
    .description("List markets with pagination")
    .option("--first <n>", "Number of results per page", "10")
    .option("--page <n>", "Page number", "1")
    .option("--language <lang>", "Language code (sent as Accept-Language header)", "en")
    .option("--keyword <kw>", "Search keyword")
    .option("--category <slugs...>", "Filter by category slugs")
    .option("--json", "Output raw JSON", false)
    .action(opts =>
        runAction(async () => {
            const client = await getClient(opts.language);
            const result = await client.markets({
                first: parseInt(opts.first, 10),
                page: parseInt(opts.page, 10),
                language: opts.language,
                keyword: opts.keyword,
                categorySlugIn: opts.category,
            });

            if (opts.json) {
                printJson(result);
                return;
            }

            const items =
                (result as { data?: unknown[] })?.data ?? (Array.isArray(result) ? result : []);
            if (items.length === 0) {
                printText("No markets.");
                return;
            }
            const rows = items.map((m: Record<string, unknown>) => ({
                id: m.id,
                slug: m.slug,
                title: m.title,
                status:
                    m.status === true
                        ? "Active"
                        : m.status === false
                        ? "Inactive"
                        : String(m.status ?? "—"),
                volume: m.volume,
            }));
            output(rows, false);
        }),
    );

marketsCommand
    .command("get <slug>")
    .description("Get a single market by slug")
    .option("--language <lang>", "Language code (sent as Accept-Language header)", "en")
    .option("--json", "Output raw JSON", false)
    .action((slug: string, opts) =>
        runAction(async () => {
            const client = await getClient(opts.language);
            const result = await client.marketBySlug(slug);
            if (opts.json) {
                printJson(result);
                return;
            }
            if (!result) {
                printText("Market not found.");
                return;
            }
            const row = {
                id: (result as Record<string, unknown>).id,
                title: (result as Record<string, unknown>).title,
                slug: (result as Record<string, unknown>).slug,
                currency_code: (result as Record<string, unknown>).currency_code,
            };
            output([row], false);
        }),
    );

marketsCommand
    .command("categories")
    .description("List market categories")
    .option("--language <lang>", "Language code (sent as Accept-Language header)", "en")
    .option("--json", "Output raw JSON", false)
    .action(opts =>
        runAction(async () => {
            const client = await getClient(opts.language);
            const result = await client.categories({ language: opts.language });

            if (opts.json) {
                printJson(result);
                return;
            }

            const items =
                (result as { data?: unknown[] })?.data ?? (Array.isArray(result) ? result : []);
            if (items.length === 0) {
                printText("No categories.");
                return;
            }
            const rows = items.map((c: Record<string, unknown>) => ({
                id: c.id,
                slug: c.slug,
                title: c.name ?? c.title,
                total_markets: c.total_markets,
            }));
            output(rows, false);
        }),
    );

marketsCommand
    .command("history <slug>")
    .description("Get market price history")
    .option("--language <lang>", "Language code (sent as Accept-Language header)", "en")
    .option("--period <period>", "Time period (e.g. 1h, 1d, 1w, 1m, all)", "all")
    .option("--json", "Output raw JSON", false)
    .action((slug: string, opts) =>
        runAction(async () => {
            const client = await getClient(opts.language);
            const result = await client.marketHistory({ slug, period: opts.period });
            if (opts.json) {
                printJson(result);
                return;
            }
            const items = Array.isArray(result) ? result : result ? [result] : [];
            const rows: {
                outcome_title: unknown;
                market_title: unknown;
                time: unknown;
                price: unknown;
            }[] = [];
            for (const item of items) {
                const rec = item as {
                    outcome_title?: unknown;
                    market_title?: unknown;
                    history?: Array<{ t?: unknown; p?: unknown }>;
                };
                const history = rec.history ?? [];
                for (const h of history) {
                    rows.push({
                        outcome_title: rec.outcome_title,
                        market_title: rec.market_title,
                        time: h.t,
                        price: h.p,
                    });
                }
            }
            if (rows.length === 0) {
                printText("No history.");
                return;
            }
            output(rows, false);
        }),
    );
