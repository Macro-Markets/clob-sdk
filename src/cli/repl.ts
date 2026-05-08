import { createElement } from "react";
import { render } from "ink";
import type { Command } from "commander";
import { getClient } from "./auth.ts";
import { setReplMode } from "./format.ts";
import { outputStore } from "./store/OutputStore.ts";
import { localeStore } from "./store/localeStore.ts";
import { printBanner } from "./printBanner.ts";
import { CLI } from "./ui/index.ts";
import type { MeUser } from "../graphql/types/index.ts";

const RED = "\x1b[31m";
const YELLOW = "\x1b[33m";
const DIM = "\x1b[2m";
const RESET = "\x1b[0m";

interface ConnectionResult {
    ok: boolean;
    user?: MeUser | null;
}

export async function validateConnection(): Promise<ConnectionResult> {
    try {
        const client = await getClient();
        const user = await client.me();
        return { ok: true, user };
    } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        if (msg.includes("Missing required env var")) {
            process.stdout.write("\n");
            process.stderr.write(`  ${RED}${msg}${RESET}\n`);
            process.stdout.write("\n");
            return { ok: false };
        }
        process.stdout.write("\n");
        process.stdout.write(`  ${YELLOW}Warning: could not validate connection${RESET}\n`);
        process.stdout.write(`  ${DIM}${msg}${RESET}\n`);
        process.stdout.write("\n");
        return { ok: true, user: null };
    }
}

/**
 * Bootstrap: validate connection, then run the Ink CLI.
 * Replaces the procedural readline loop with Ink's render() and CLI component.
 * Requires an interactive TTY (stdin); otherwise prints a message and exits.
 */
export async function startRepl(program: Command): Promise<void> {
    setReplMode(true);

    program.exitOverride();
    program.configureOutput({
        writeErr: (str: string) => {
            if (!str.includes("(outputHelp)")) {
                const text = str.trim();
                if (text) outputStore.push({ type: "error", text });
            }
        },
    });

    const { ok, user } = await validateConnection();
    if (!ok) {
        process.exit(1);
    }

    printBanner(user ?? null, { locale: localeStore.getLocale() });

    if (!process.stdin.isTTY) {
        process.stderr.write(
            "Interactive REPL requires a TTY. Run the CLI without piping input.\n",
        );
        process.exit(1);
    }

    render(createElement(CLI, { program }));
}
