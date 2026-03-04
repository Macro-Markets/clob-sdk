import { outputStore } from "./store/OutputStore.ts";

/** Options for table output: exclude columns and format date fields (American format). */
export interface TableOptions {
    excludeColumns?: string[];
    dateKeys?: string[];
}

/**
 * Format a value as American date-time (MM/DD/YYYY HH:mm:ss). Accepts ISO strings or Date.
 */
function formatAmericanDateTime(value: unknown): string {
    if (value == null) return "";
    const d = typeof value === "string" ? new Date(value) : value instanceof Date ? value : null;
    if (!d || Number.isNaN(d.getTime())) return String(value);
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    const yyyy = d.getFullYear();
    const hh = String(d.getHours()).padStart(2, "0");
    const min = String(d.getMinutes()).padStart(2, "0");
    const ss = String(d.getSeconds()).padStart(2, "0");
    return `${mm}/${dd}/${yyyy} ${hh}:${min}:${ss}`;
}

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
 * Options: excludeColumns (e.g. transaction_type, __typename), dateKeys (formatted as MM/DD/YYYY HH:mm:ss).
 */
export function printTable(data: unknown, options?: TableOptions): void {
    if (!Array.isArray(data)) {
        printJson(data);
        return;
    }
    if (data.length === 0) {
        printText("No data.");
        return;
    }

    const rawRows = data as Record<string, unknown>[];
    const allKeys = Object.keys(rawRows[0]!);
    const columns = options?.excludeColumns?.length
        ? allKeys.filter(k => !options.excludeColumns!.includes(k))
        : allKeys;

    const dateKeys = new Set(options?.dateKeys ?? []);
    const rows =
        dateKeys.size === 0
            ? rawRows
            : rawRows.map(row => {
                  const r = { ...row };
                  for (const key of dateKeys) {
                      if (key in r) r[key] = formatAmericanDateTime(r[key]);
                  }
                  return r;
              });

    outputStore.push({ type: "table", columns, rows });
}

/**
 * Output based on --json flag: push to store as JSON or table.
 * When json is false, tableOptions can be used to exclude columns and format dates (e.g. American format).
 */
export function output(data: unknown, json: boolean, tableOptions?: TableOptions): void {
    if (json) {
        printJson(data);
    } else {
        printTable(data, tableOptions);
    }
}

let replMode = false;

export function setReplMode(enabled: boolean): void {
    replMode = enabled;
}

/** Apollo/GraphQL error with graphQLErrors (and Lighthouse validation in extensions). */
interface GraphQLFormattedError {
    message: string;
    extensions?: { validation?: Record<string, string[]> };
}

/**
 * Build a readable error message from GraphQL/Apollo errors, including Lighthouse validation details.
 */
function formatError(err: unknown): string {
    const anyErr = err as {
        message?: string;
        graphQLErrors?: GraphQLFormattedError[];
    };
    const gqlErrors = anyErr?.graphQLErrors;
    if (!Array.isArray(gqlErrors) || gqlErrors.length === 0) {
        return err instanceof Error ? err.message : String(err);
    }
    const lines: string[] = [];
    for (const e of gqlErrors) {
        lines.push(e.message ?? "Unknown error");
        const validation = e.extensions?.validation;
        if (validation && typeof validation === "object") {
            for (const [field, messages] of Object.entries(validation)) {
                const list = Array.isArray(messages) ? messages : [String(messages)];
                lines.push(...list.map(m => `  ${field}: ${m}`));
            }
        }
    }
    return lines.join("\n");
}

/**
 * Wrap an async action with consistent error handling.
 * GraphQL validation errors (e.g. Lighthouse) show field-level messages; others show the error message.
 * In REPL mode, errors are pushed to the output store; otherwise stderr and exit(1).
 */
export async function runAction(fn: () => Promise<void>): Promise<void> {
    try {
        await fn();
    } catch (err) {
        const msg = formatError(err);
        if (replMode) {
            outputStore.push({ type: "error", text: `Error: ${msg}` });
        } else {
            process.stderr.write(`Error: ${msg}\n`);
            process.exit(1);
        }
    }
}
