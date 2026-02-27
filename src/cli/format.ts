/**
 * Print data as formatted JSON to stdout.
 */
export function printJson(data: unknown): void {
    console.log(JSON.stringify(data, null, 2));
}

/**
 * Print an array of objects as an aligned table.
 * Falls back to JSON for non-array or empty data.
 */
export function printTable(data: unknown): void {
    if (!Array.isArray(data) || data.length === 0) {
        printJson(data);
        return;
    }

    const rows = data as Record<string, unknown>[];
    const keys = Object.keys(rows[0]!);

    const widths = keys.map(k => {
        const maxVal = rows.reduce((max, row) => {
            const len = String(row[k] ?? "").length;
            return len > max ? len : max;
        }, 0);
        return Math.max(k.length, maxVal);
    });

    const header = keys.map((k, i) => k.padEnd(widths[i]!)).join("  ");
    const separator = widths.map(w => "─".repeat(w)).join("──");

    console.log(header);
    console.log(separator);

    for (const row of rows) {
        const line = keys.map((k, i) => String(row[k] ?? "").padEnd(widths[i]!)).join("  ");
        console.log(line);
    }
}

/**
 * Output based on --json flag.
 */
export function output(data: unknown, json: boolean): void {
    if (json) {
        printJson(data);
    } else {
        printTable(data);
    }
}

let replMode = false;

export function setReplMode(enabled: boolean): void {
    replMode = enabled;
}

/**
 * Wrap an async action with consistent error handling.
 */
export async function runAction(fn: () => Promise<void>): Promise<void> {
    try {
        await fn();
    } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        console.error(`Error: ${msg}`);
        if (!replMode) process.exit(1);
    }
}
