import { Command } from "commander";
import { getClient } from "../auth.ts";
import { output, printJson, runAction } from "../format.ts";

export const marketsCommand = new Command("markets").description("Browse prediction markets");

marketsCommand
    .command("list")
    .description("List markets with pagination")
    .option("--first <n>", "Number of results per page", "10")
    .option("--page <n>", "Page number", "1")
    .option("--language <lang>", "Language code", "en")
    .option("--keyword <kw>", "Search keyword")
    .option("--category <slugs...>", "Filter by category slugs")
    .option("--json", "Output raw JSON", false)
    .action((opts) =>
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

            const items = result?.data ?? result;
            if (Array.isArray(items)) {
                const rows = items.map((m: Record<string, unknown>) => ({
                    id: m.id,
                    slug: m.slug,
                    title: m.title,
                    status: m.status ? "active" : "inactive",
                    volume: m.volume,
                }));
                output(rows, false);
            } else {
                printJson(result);
            }
        }),
    );

marketsCommand
    .command("get <slug>")
    .description("Get a single market by slug")
    .option("--json", "Output raw JSON", false)
    .action((slug: string, _opts) =>
        runAction(async () => {
            const client = await getClient();
            const result = await client.marketBySlug(slug);
            printJson(result);
        }),
    );

marketsCommand
    .command("categories")
    .description("List market categories")
    .option("--language <lang>", "Language code", "en")
    .option("--json", "Output raw JSON", false)
    .action((opts) =>
        runAction(async () => {
            const client = await getClient(opts.language);
            const result = await client.categories({ language: opts.language });

            if (opts.json) {
                printJson(result);
                return;
            }

            if (Array.isArray(result)) {
                const rows = result.map((c: Record<string, unknown>) => ({
                    id: c.id,
                    slug: c.slug,
                    title: c.title,
                }));
                output(rows, false);
            } else {
                printJson(result);
            }
        }),
    );

marketsCommand
    .command("history <slug>")
    .description("Get market price history")
    .option("--period <period>", "Time period (e.g. 1h, 1d, 1w, 1m, all)", "all")
    .option("--json", "Output raw JSON", false)
    .action((slug: string, opts) =>
        runAction(async () => {
            const client = await getClient();
            const result = await client.marketHistory({ slug, period: opts.period });
            printJson(result);
        }),
    );
