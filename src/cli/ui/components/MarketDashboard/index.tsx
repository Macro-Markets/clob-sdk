import React from "react";
import { Box } from "ink";

export interface MarketDashboardProps {
    children?: React.ReactNode;
    input: React.ReactNode;
}

export function MarketDashboard({ children, input }: MarketDashboardProps): React.JSX.Element {
    return (
        <Box flexDirection="column" width="100%">
            {children ? <Box flexDirection="column">{children}</Box> : null}

            <Box paddingX={1} paddingY={0}>
                {input}
            </Box>
        </Box>
    );
}
