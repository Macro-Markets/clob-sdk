import React, { useMemo } from "react";
import { Box, Text } from "ink";

export interface TableProps {
    data: Record<string, unknown>[];
    columns?: string[];
    minColWidth?: number;
    maxColWidth?: number;
}

export function Table({
    data,
    columns,
    minColWidth = 5,
    maxColWidth = 25,
}: TableProps): React.JSX.Element | null {
    const { percentWidths, keys } = useMemo(() => {
        if (!Array.isArray(data) || data.length === 0) {
            return { percentWidths: [], keys: [] };
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

    return (
        <Box flexDirection="column" paddingY={1} width="100%">
            <Box flexDirection="row" width="100%">
                {keys.map((key, i) => (
                    <Box
                        key={key}
                        width={percentWidths[i]}
                        paddingRight={i === keys.length - 1 ? 0 : 1}
                        minWidth={0}
                        flexShrink={1}
                    >
                        <Text bold color="cyan" wrap="truncate-middle">
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
                        paddingRight={i === keys.length - 1 ? 0 : 1}
                        minWidth={0}
                        flexShrink={1}
                    >
                        <Text dimColor wrap="truncate-middle">
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
                            paddingRight={i === keys.length - 1 ? 0 : 1}
                            minWidth={0}
                            flexShrink={1}
                        >
                            <Text wrap="truncate-middle">{String(row[key] ?? "")}</Text>
                        </Box>
                    ))}
                </Box>
            ))}
        </Box>
    );
}
