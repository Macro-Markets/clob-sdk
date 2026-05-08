/**
 * Text output (command result, error, or help).
 */
export interface TextOutputItem {
    id: string;
    type: "command" | "error" | "help";
    text: string;
}

/**
 * Structured table output, rendered with Box + Text (native Ink).
 */
export interface TableOutputItem {
    id: string;
    type: "table";
    columns: string[];
    rows: Record<string, unknown>[];
}

export type OutputItem = TextOutputItem | TableOutputItem;

export function isTableOutputItem(item: OutputItem): item is TableOutputItem {
    return item.type === "table";
}

/** Max items kept in memory (FIFO). Prevents unbounded growth in long REPL sessions. */
export const OUTPUT_BUFFER_MAX = 200;

type Listener = () => void;

let nextId = 0;

function generateId(): string {
    return `out-${Date.now()}-${++nextId}`;
}

const items: OutputItem[] = [];
const listeners = new Set<Listener>();

function notify(): void {
    listeners.forEach(cb => cb());
}

/**
 * Output store: holds command/error/help blocks for the REPL.
 * Format layer pushes here; CLI subscribes and renders via Ink Static.
 * Buffer is capped at OUTPUT_BUFFER_MAX (FIFO) to avoid memory growth.
 *
 * Testability: in unit tests that use the store, call outputStore.clear() in
 * beforeEach to avoid state leaking between assertions.
 */
type PushPayload =
    | { type: "command" | "error" | "help"; text: string }
    | { type: "table"; columns: string[]; rows: Record<string, unknown>[] };

export const outputStore = {
    push(payload: PushPayload): void {
        while (items.length >= OUTPUT_BUFFER_MAX) {
            items.shift();
        }
        const id = generateId();
        if (payload.type === "table") {
            items.push({
                id,
                type: "table",
                columns: payload.columns,
                rows: payload.rows,
            });
        } else {
            items.push({
                id,
                type: payload.type,
                text: payload.text,
            });
        }
        notify();
    },

    clear(): void {
        items.length = 0;
        notify();
    },

    getItems(): readonly OutputItem[] {
        return items;
    },

    subscribe(listener: Listener): () => void {
        listeners.add(listener);
        return () => {
            listeners.delete(listener);
        };
    },
};
