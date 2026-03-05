import type { MeUser } from "../graphql/types/index.ts";
import { SDK_VERSION } from "../version.ts";

const BOX_WIDTH = 48;
const CYAN = "\x1b[36m";
const GREEN = "\x1b[32m";
const WHITE = "\x1b[37m";
const YELLOW = "\x1b[33m";
const DIM = "\x1b[2m";
const BOLD = "\x1b[1m";
const RESET = "\x1b[0m";

export interface PrintBannerOptions {
    user?: MeUser | null;
    locale?: string;
    version?: string;
}

/**
 * Prints the CLI banner once to stdout before Ink takes over.
 * Guarantees the banner appears when the terminal opens.
 */
export function printBanner(
    user: MeUser | null | undefined,
    options: PrintBannerOptions = {},
): void {
    const { locale = "en", version = SDK_VERSION } = options;
    const endpoint = process.env["ENDPOINT"] ?? "unknown";
    const maxEp = BOX_WIDTH - 4;
    const epDisplay = endpoint.length > maxEp ? endpoint.slice(0, maxEp - 3) + "..." : endpoint;

    const w = BOX_WIDTH + 2;
    const top = CYAN + "╔" + "═".repeat(w - 2) + "╗" + RESET;
    const bottom = CYAN + "╚" + "═".repeat(w - 2) + "╝" + RESET;
    const side = CYAN + "║" + RESET;
    const divider = CYAN + "╠" + "═".repeat(w - 2) + "╣" + RESET;

    const ansiEscape = String.fromCharCode(0x1b);
    const stripAnsi = (s: string) => s.replace(new RegExp(`${ansiEscape}\\[[0-9;]*m`, "g"), "");
    const pad = (s: string, len: number) => {
        const n = Math.max(0, len - stripAnsi(s).length);
        return s + " ".repeat(n);
    };

    const lines: string[] = [
        "",
        top,
        side + "  " + pad("", w - 4) + side,
        side + "  " + pad(BOLD + GREEN + "M A C R O . M A R K E T S" + RESET, w - 4) + side,
        side + "  " + pad(DIM + "Prediction Markets SDK v" + version + RESET, w - 4) + side,
        side + "  " + pad("", w - 4) + side,
        divider,
    ];

    if (user) {
        const name = user.display_name ?? user.username ?? "—";
        const email = user.email ?? "—";
        const since = user.created_at ? user.created_at.slice(0, 10) : "—";
        lines.push(
            side + "  " + pad(BOLD + WHITE + name + RESET, w - 4) + side,
            side + "  " + pad(DIM + email + RESET, w - 4) + side,
            side + "  " + pad(DIM + "Member since " + since + RESET, w - 4) + side,
            side + "  " + pad(GREEN + "● Connected" + RESET, w - 4) + side,
        );
    } else {
        lines.push(
            side + "  " + pad(YELLOW + "Could not load user profile" + RESET, w - 4) + side,
            side + "  " + pad(DIM + "Check API_TOKEN and ENDPOINT" + RESET, w - 4) + side,
        );
    }

    lines.push(
        divider,
        side + "  " + pad(DIM + epDisplay + RESET, w - 4) + side,
        side + "  " + pad(DIM + "Accept-Language: " + locale + RESET, w - 4) + side,
        divider,
        side + "  " + pad(DIM + "help — list commands" + RESET, w - 4) + side,
        side + "  " + pad(DIM + "exit — quit" + RESET, w - 4) + side,
        bottom,
        "",
    );

    process.stdout.write(lines.join("\n") + "\n");
}
