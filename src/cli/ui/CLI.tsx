import React, { useCallback, useEffect, useState } from "react";
import { Box, Static } from "ink";
import type { Command } from "commander";
import { outputStore } from "../store/OutputStore.ts";
import { useOutputStore } from "../store/useOutputStore.ts";
import { localeStore } from "../store/localeStore.ts";
import { getHelpTableData } from "../helpData.ts";
import { CommandOutput, MarketDashboard, CommandInput } from "./components/index.ts";
import type { OutputItem } from "../store/OutputStore.ts";

const LOCALE_CODE_REGEX = /^[a-zA-Z]{2,5}$/;

function useLocale(): string {
    const [locale, setLocale] = useState(localeStore.getLocale());
    useEffect(() => {
        return localeStore.subscribe(() => setLocale(localeStore.getLocale()));
    }, []);
    return locale;
}

export interface CLIProps {
    program: Command;
}

const COMMAND_HISTORY_MAX = 100;

export function CLI({ program }: CLIProps): React.JSX.Element {
    const [inputValue, setInputValue] = useState("");
    const [history, setHistory] = useState<string[]>([]);
    const outputBlocks = useOutputStore();
    const locale = useLocale();

    const handleSubmit = useCallback(
        async (value: string) => {
            const trimmed = value.trim();
            if (!trimmed) return;

            setInputValue("");
            setHistory(prev => {
                if (prev.length > 0 && prev[prev.length - 1] === trimmed) return prev;
                const next = [...prev, trimmed];
                return next.length > COMMAND_HISTORY_MAX ? next.slice(-COMMAND_HISTORY_MAX) : next;
            });

            if (trimmed === "exit" || trimmed === "quit") {
                process.exit(0);
            }

            if (trimmed === "help") {
                outputStore.push({ type: "command", text: trimmed });
                const { columns, rows } = getHelpTableData();
                outputStore.push({ type: "table", columns, rows });
                return;
            }

            if (trimmed === "clear") {
                outputStore.clear();
                process.stdout.write("\x1Bc");
                return;
            }

            const tokens: string[] = trimmed.match(/(?:[^\s"']+|"[^"]*"|'[^']*')+/g) ?? [];
            const firstToken = tokens[0]?.toLowerCase();

            if (firstToken === "language") {
                outputStore.push({ type: "command", text: trimmed });
                if (tokens.length === 1) {
                    outputStore.push({
                        type: "help",
                        text: `Current language: ${localeStore.getLocale()}`,
                    });
                    return;
                }
                const code = tokens[1];
                if (!code || !LOCALE_CODE_REGEX.test(code)) {
                    outputStore.push({
                        type: "error",
                        text: "Invalid language code. Use 2–5 letters (e.g. en, pt).",
                    });
                    return;
                }
                localeStore.setLocale(code);
                outputStore.push({ type: "help", text: `Language set to ${code}` });
                return;
            }

            outputStore.push({ type: "command", text: trimmed });
            let argsTokens: string[] = [...tokens];
            if (firstToken === "markets" && !tokens.includes("--language")) {
                const lang = localeStore.getLocale();
                argsTokens = [...tokens.slice(0, 2), "--language", lang, ...tokens.slice(2)];
            }
            const args = ["node", "market-sdk", ...argsTokens];
            try {
                await program.parseAsync(args);
            } catch {
                // Commander handles its own errors via exitOverride
            }
        },
        [program],
    );

    return (
        <Box flexDirection="column" width="100%">
            <Static items={outputBlocks as OutputItem[]}>
                {item => <CommandOutput key={item.id} data={item} />}
            </Static>

            <MarketDashboard
                input={
                    <CommandInput
                        value={inputValue}
                        onChange={setInputValue}
                        onSubmit={handleSubmit}
                        history={history}
                        locale={locale}
                    />
                }
            />
        </Box>
    );
}
