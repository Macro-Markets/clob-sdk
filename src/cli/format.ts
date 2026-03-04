import { outputStore } from "./store/OutputStore.ts";

/**
 * Push plain text as a command output block (no JSON/table formatting).
 */
export function printText(text: string): void {
    if (!text.trim()) return;
    outputStore.push({ type: "command", text });
}

/**
 * Format data as JSON string and push to output store.
 */
export function printJson(data: unknown): void {
    const text = JSON.stringify(data, null, 2);
    outputStore.push({ type: "command", text });
}

/**
 * Format an array of objects as a table and push to output store (type "table").
 * Rendered with native Ink Box + Text. Falls back to JSON for non-array or empty data.
 */
export function printTable(data: unknown): void {
    if (!Array.isArray(data) || data.length === 0) {
        printJson(data);
        return;
    }

    const rows = data as Record<string, unknown>[];
    const columns = Object.keys(rows[0]!);
    outputStore.push({ type: "table", columns, rows });
}

/**
 * Output based on --json flag: push to store as JSON or table.
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
 * In REPL mode, errors are pushed to the output store; otherwise stderr and exit(1).
 */
export async function runAction(fn: () => Promise<void>): Promise<void> {
    try {
        await fn();
    } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        if (replMode) {
            outputStore.push({ type: "error", text: `Error: ${msg}` });
        } else {
            process.stderr.write(`Error: ${msg}\n`);
            process.exit(1);
        }
    }
}
