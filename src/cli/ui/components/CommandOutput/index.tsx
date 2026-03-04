import React from "react";
import { Box, Text } from "ink";
import { type OutputItem, isTableOutputItem } from "../../../store/OutputStore.ts";
import { Table } from "../Table/index.tsx";

export interface CommandOutputProps {
    data: OutputItem;
}

/**
 * Renders a single output block (command result, error, or table) for use inside Ink Static.
 * Tables use the shared Table component (truncation, consistent layout).
 */
export function CommandOutput({ data }: CommandOutputProps): React.JSX.Element {
    if (isTableOutputItem(data)) {
        const { columns, rows } = data;
        return (
            <Box
                flexDirection="column"
                borderStyle="round"
                borderColor="cyan"
                paddingX={1}
                paddingY={0}
                marginY={1}
            >
                <Table data={rows} columns={columns} />
            </Box>
        );
    }

    const isError = data.type === "error";
    return (
        <Box flexDirection="column" paddingY={0}>
            <Text color={isError ? "red" : undefined}>{data.text}</Text>
        </Box>
    );
}
