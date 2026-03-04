import React, { useCallback, useState } from "react";
import { Box, Static } from "ink";
import type { Command } from "commander";
import { outputStore } from "../store/OutputStore.ts";
import { useOutputStore } from "../store/useOutputStore.ts";
import { getHelpTableData } from "../helpData.ts";
import { CommandOutput, MarketDashboard, CommandInput } from "./components/index.ts";
import type { OutputItem } from "../store/OutputStore.ts";

export interface CLIProps {
    program: Command;
}

const COMMAND_HISTORY_MAX = 100;

export function CLI({ program }: CLIProps): React.JSX.Element {
    const [inputValue, setInputValue] = useState("");
    const [history, setHistory] = useState<string[]>([]);
    const outputBlocks = useOutputStore();

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
                const { columns, rows } = getHelpTableData();
                outputStore.push({ type: "table", columns, rows });
                return;
            }

            if (trimmed === "clear") {
                outputStore.clear();
                process.stdout.write("\x1Bc");
                return;
            }

            const tokens = trimmed.match(/(?:[^\s"']+|"[^"]*"|'[^']*')+/g) ?? [];
            const args = ["node", "market-sdk", ...tokens];
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
                        placeholder="Type a command..."
                    />
                }
            />
        </Box>
    );
}
