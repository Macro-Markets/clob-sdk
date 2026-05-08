/**
 * Session locale (language) for the REPL.
 * Used as default Accept-Language for markets commands and shown in the prompt.
 */

type Listener = () => void;

let currentLocale = "en";
const listeners = new Set<Listener>();

function notify(): void {
    listeners.forEach(cb => cb());
}

export const localeStore = {
    getLocale(): string {
        return currentLocale;
    },

    setLocale(locale: string): void {
        currentLocale = locale;
        notify();
    },

    subscribe(listener: Listener): () => void {
        listeners.add(listener);
        return () => {
            listeners.delete(listener);
        };
    },
};
