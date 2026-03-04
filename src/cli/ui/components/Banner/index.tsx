import React from "react";
import { Box, Text } from "ink";
import type { MeUser } from "../../../../graphql/types/index.ts";

const BOX_WIDTH = 48;

export interface BannerProps {
    user?: MeUser | null;
}

/**
 * Stateless banner shown once when the terminal opens.
 * Rendered inside Ink's <Static> so its output is preserved and not redrawn.
 */
export function Banner({ user }: BannerProps): React.JSX.Element {
    const endpoint = process.env["ENDPOINT"] ?? "unknown";
    const maxEp = BOX_WIDTH - 4;
    const epDisplay = endpoint.length > maxEp ? endpoint.slice(0, maxEp - 3) + "..." : endpoint;

    return (
        <Box flexDirection="column" marginBottom={1}>
            <Box justifyContent="center">
                <Box
                    borderStyle="double"
                    borderColor="cyan"
                    width={BOX_WIDTH + 2}
                    flexDirection="column"
                    paddingX={1}
                >
                    <Box key="title">
                        <Text bold color="green">
                            M A C R O . M A R K E T S
                        </Text>
                    </Box>
                    <Box key="subtitle">
                        <Text dimColor>Prediction Markets SDK v1.0</Text>
                    </Box>
                    <Box key="user" borderStyle="round" borderTop borderColor="cyan" paddingX={1}>
                        {user ? (
                            <Box flexDirection="column" width="100%">
                                <Box>
                                    <Text bold color="white">
                                        {user.display_name ?? user.username ?? "—"}
                                    </Text>
                                </Box>
                                <Box>
                                    <Text dimColor>{user.email ?? "—"}</Text>
                                </Box>
                                <Box>
                                    <Text dimColor>
                                        Member since{" "}
                                        {user.created_at ? user.created_at.slice(0, 10) : "—"}
                                    </Text>
                                </Box>
                            </Box>
                        ) : (
                            <Box>
                                <Text color="yellow">Could not load user profile</Text>
                            </Box>
                        )}
                    </Box>
                    <Box
                        key="endpoint"
                        borderStyle="round"
                        borderTop
                        borderColor="cyan"
                        paddingX={1}
                    >
                        <Text dimColor>{epDisplay}</Text>
                    </Box>
                </Box>
            </Box>
        </Box>
    );
}
