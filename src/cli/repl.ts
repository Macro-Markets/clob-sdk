import * as readline from "node:readline";
import type { Command } from "commander";
import { getClient } from "./auth.ts";
import { setReplMode } from "./format.ts";
import type { MeUser } from "../graphql/types/index.ts";

const CYAN = "\x1b[36m";
const GREEN = "\x1b[32m";
const DIM = "\x1b[2m";
const BOLD = "\x1b[1m";
const RESET = "\x1b[0m";
const RED = "\x1b[31m";
const YELLOW = "\x1b[33m";
const WHITE = "\x1b[97m";

const BOX_W = 48;

function margin(): string {
    const cols = process.stdout.columns ?? 80;
    const total = BOX_W + 2;
    const left = Math.max(Math.floor((cols - total) / 2), 0);
    return " ".repeat(left);
}

function hLine(left: string, fill: string, right: string): string {
    return `${margin()}${CYAN}${left}${fill.repeat(BOX_W)}${right}${RESET}`;
}

function boxLine(content: string, rawLen: number): string {
    const pad = BOX_W - 2 - rawLen;
    return `${margin()}${CYAN}║${RESET} ${content}${" ".repeat(Math.max(pad, 0))} ${CYAN}║${RESET}`;
}

function printBanner(user?: MeUser | null): void {
    console.log();
    console.log(hLine("╔", "═", "╗"));
    console.log(boxLine(`${BOLD}${GREEN}M A C R O . M A R K E T S${RESET}`, 25));
    console.log(boxLine(`${DIM}Prediction Markets SDK  v1.0${RESET}`, 28));
    console.log(hLine("╠", "═", "╣"));

    if (user) {
        const name = user.display_name ?? user.username ?? "—";
        const email = user.email ?? "—";
        const since = user.created_at ? user.created_at.slice(0, 10) : "—";

        console.log(boxLine(`${WHITE}${BOLD}${name}${RESET}`, name.length));
        console.log(boxLine(`${DIM}${email}${RESET}`, email.length));
        console.log(boxLine(`${DIM}Member since ${since}${RESET}`, 13 + since.length));
    } else {
        console.log(boxLine(`${YELLOW}Could not load user profile${RESET}`, 28));
    }

    console.log(hLine("╟", "─", "╢"));
    const endpoint = process.env["ENDPOINT"] ?? "unknown";
    const maxEp = BOX_W - 4;
    const epDisplay = endpoint.length > maxEp ? endpoint.slice(0, maxEp - 3) + "..." : endpoint;
    console.log(boxLine(`${DIM}${epDisplay}${RESET}`, epDisplay.length));
    console.log(hLine("╚", "═", "╝"));
    console.log();
}

interface ConnectionResult {
    ok: boolean;
    user?: MeUser | null;
}

async function validateConnection(): Promise<ConnectionResult> {
    try {
        const client = await getClient();
        const user = await client.me();
        return { ok: true, user };
    } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        if (msg.includes("Missing required env var")) {
            console.log();
            console.error(`  ${RED}${msg}${RESET}`);
            console.log();
            return { ok: false };
        }
        console.log();
        console.log(`  ${YELLOW}Warning: could not validate connection${RESET}`);
        console.log(`  ${DIM}${msg}${RESET}`);
        console.log();
        return { ok: true, user: null };
    }
}

function printHelp(program: Command): void {
    console.log();
    console.log(`  ${BOLD}Available commands:${RESET}`);
    console.log();
    for (const cmd of program.commands) {
        const name = cmd.name();
        const desc = cmd.description();
        console.log(`  ${GREEN}${name.padEnd(14)}${RESET} ${DIM}${desc}${RESET}`);

        for (const sub of cmd.commands) {
            const usage = sub.usage() ? ` ${sub.usage()}` : "";
            console.log(
                `    ${sub.name()}${usage}`.padEnd(30) + `${DIM}${sub.description()}${RESET}`,
            );
        }
    }
    console.log();
    console.log(`  ${GREEN}${"help".padEnd(14)}${RESET} ${DIM}Show this help${RESET}`);
    console.log(`  ${GREEN}${"clear".padEnd(14)}${RESET} ${DIM}Clear the screen${RESET}`);
    console.log(`  ${GREEN}${"exit".padEnd(14)}${RESET} ${DIM}Exit the shell${RESET}`);
    console.log();
}

export async function startRepl(program: Command): Promise<void> {
    setReplMode(true);

    program.exitOverride();
    program.configureOutput({
        writeErr: str => {
            if (!str.includes("(outputHelp)")) {
                process.stderr.write(str);
            }
        },
    });

    const { ok, user } = await validateConnection();
    if (!ok) {
        process.exit(1);
    }

    printBanner(user);

    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
        prompt: `${GREEN}macro>${RESET} `,
    });

    rl.prompt();

    rl.on("line", async (line: string) => {
        const trimmed = line.trim();

        if (!trimmed) {
            rl.prompt();
            return;
        }

        if (trimmed === "exit" || trimmed === "quit") {
            console.log(`\n  ${DIM}Goodbye!${RESET}\n`);
            process.exit(0);
        }

        if (trimmed === "help") {
            printHelp(program);
            rl.prompt();
            return;
        }

        if (trimmed === "clear") {
            console.clear();
            rl.prompt();
            return;
        }

        const tokens = trimmed.match(/(?:[^\s"']+|"[^"]*"|'[^']*')+/g) ?? [];
        const args = ["node", "market-sdk", ...tokens];

        try {
            await program.parseAsync(args);
        } catch {
            // Commander prints its own errors via exitOverride
        }

        console.log();
        rl.prompt();
    });

    rl.on("close", () => {
        console.log(`\n  ${DIM}Goodbye!${RESET}\n`);
        process.exit(0);
    });
}
