import { useEffect, useState } from "react";
import type { OutputItem } from "./OutputStore.ts";
import { outputStore } from "./OutputStore.ts";

/**
 * Subscribe to output store and re-render when items change.
 */
export function useOutputStore(): OutputItem[] {
    const [items, setItems] = useState<OutputItem[]>(() => [...outputStore.getItems()]);

    useEffect(() => {
        const unsubscribe = outputStore.subscribe(() => {
            setItems([...outputStore.getItems()]);
        });
        return unsubscribe;
    }, []);

    return items;
}
