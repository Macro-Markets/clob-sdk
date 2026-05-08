import React from "react";
import { Box, Text } from "ink";
import { Table } from "../Table/index.tsx";

export interface HelpPanelProps {
    content?: string;
    tableData?: Record<string, unknown>[];
    columns?: string[];
    title?: string;
}

/**
 * Renders help as plain text or as a styled table with title.
 * When tableData is provided, shows a bordered block with title and Table.
 */
export function HelpPanel({
    content,
    tableData,
    columns,
    title = "Available commands",
}: HelpPanelProps): React.JSX.Element {
    if (tableData != null && tableData.length > 0) {
        const first = tableData[0];
        const cols =
            columns ?? (first ? (Object.keys(first) as string[]) : ["Command", "Description"]);
        return (
            <Box flexDirection="column" paddingY={1}>
                <Box
                    borderStyle="round"
                    borderColor="cyan"
                    paddingX={2}
                    paddingY={1}
                    flexDirection="column"
                >
                    <Box marginBottom={1}>
                        <Text bold color="green">
                            {title}
                        </Text>
                    </Box>
                    <Table
                        data={tableData}
                        columns={cols}
                        minColWidth={6}
                        maxColWidth={cols.includes("Usage") ? 50 : 25}
                    />
                </Box>
            </Box>
        );
    }

    return (
        <Box flexDirection="column" paddingY={1}>
            <Text dimColor>{content ?? ""}</Text>
        </Box>
    );
}
