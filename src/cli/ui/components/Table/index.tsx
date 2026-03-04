import React, { useMemo } from "react";
import { Box, Text } from "ink";

export interface TableProps {
    data: Record<string, unknown>[];
    columns?: string[];
    minColWidth?: number;
    maxColWidth?: number;
}

/**
 * Vertical key-value layout for a single row (one line per column).
 */
function VerticalRow({
    keys,
    row,
}: {
    keys: string[];
    row: Record<string, unknown>;
}): React.JSX.Element {
    return (
        <Box flexDirection="column" paddingY={1} width="100%">
            {keys.map(key => (
                <Box key={key} flexDirection="row" width="100%">
                    <Box minWidth={2}>
                        <Text bold color="cyan">
                            {key}:
                        </Text>
                    </Box>
                    <Box paddingLeft={1} minWidth={0} flexGrow={1}>
                        <Text wrap="truncate-middle">{String(row[key] ?? "")}</Text>
                    </Box>
                </Box>
            ))}
        </Box>
    );
}

export function Table({
    data,
    columns,
    minColWidth = 5,
    maxColWidth = 25,
}: TableProps): React.JSX.Element | null {
    const { percentWidths, keys } = useMemo(() => {
        if (!Array.isArray(data) || data.length === 0) {
            return { percentWidths: [] as string[], keys: [] as string[] };
        }

        const k = columns ?? (Object.keys(data[0]!) as string[]);

        const absoluteWidths = k.map(key => {
            const maxVal = data.reduce((max, row) => {
                const len = String(row[key] ?? "").length;
                return len > max ? len : max;
            }, 0);

            return Math.min(Math.max(key.length, maxVal, minColWidth), maxColWidth);
        });

        const total = absoluteWidths.reduce((acc, curr) => acc + curr, 0);
        const pWidths = absoluteWidths.map(w => `${Math.floor((w / total) * 100)}%`);

        return { percentWidths: pWidths, keys: k };
    }, [data, columns, minColWidth, maxColWidth]);

    if (keys.length === 0) {
        return null;
    }

    if (data.length === 1) {
        return <VerticalRow keys={keys} row={data[0]!} />;
    }

    return (
        <Box flexDirection="column" paddingY={0} width="100%">
            <Box flexDirection="row" width="100%">
                {keys.map((key, i) => (
                    <Box
                        key={key}
                        width={percentWidths[i]}
                        paddingLeft={i === 0 ? 0 : 1}
                        paddingRight={i === keys.length - 1 ? 0 : 1}
                        minWidth={0}
                        flexShrink={1}
                    >
                        <Text bold color="cyan" wrap="truncate-end">
                            {key}
                        </Text>
                    </Box>
                ))}
            </Box>

            <Box flexDirection="row" width="100%">
                {percentWidths.map((w, i) => (
                    <Box
                        key={i}
                        width={w}
                        paddingLeft={i === 0 ? 0 : 1}
                        paddingRight={i === keys.length - 1 ? 0 : 1}
                        minWidth={0}
                        flexShrink={1}
                    >
                        <Text dimColor wrap="truncate-end">
                            {"─".repeat(50)}
                        </Text>
                    </Box>
                ))}
            </Box>

            {data.map((row, rowIndex) => (
                <Box key={rowIndex} flexDirection="row" width="100%">
                    {keys.map((key, i) => (
                        <Box
                            key={key}
                            width={percentWidths[i]}
                            paddingLeft={i === 0 ? 0 : 1}
                            paddingRight={i === keys.length - 1 ? 0 : 1}
                            minWidth={0}
                            flexShrink={1}
                        >
                            <Text wrap="truncate-end">{String(row[key] ?? "")}</Text>
                        </Box>
                    ))}
                </Box>
            ))}
        </Box>
    );
}
