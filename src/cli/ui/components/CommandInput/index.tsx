import React, { useEffect, useRef, useState } from "react";
import { Box, Text, useInput } from "ink";
import TextInput from "ink-text-input";

export interface CommandInputProps {
    value: string;
    onChange: (value: string) => void;
    onSubmit: (value: string) => void;
    history?: readonly string[];
    placeholder?: string;
}

export function CommandInput({
    value,
    onChange,
    onSubmit,
    history = [],
    placeholder = "Type a command...",
}: CommandInputProps): React.JSX.Element {
    const [historyIndex, setHistoryIndex] = useState(-1);
    const historyIndexRef = useRef(-1);
    const draftRef = useRef(value);

    historyIndexRef.current = historyIndex;

    useEffect(() => {
        if (value === "") {
            setHistoryIndex(-1);
        }
    }, [value]);

    useEffect(() => {
        if (historyIndex === -1) draftRef.current = value;
    }, [value, historyIndex]);

    const handleChange = (next: string): void => {
        if (historyIndex === -1) draftRef.current = next;
        onChange(next);
    };

    useInput(
        (_input, key) => {
            const idx = historyIndexRef.current;
            if (key.upArrow && history.length > 0) {
                const nextIndex = idx <= 0 ? history.length - 1 : idx - 1;
                historyIndexRef.current = nextIndex;
                setHistoryIndex(nextIndex);
                onChange(history[nextIndex] ?? "");
                return;
            }
            if (key.downArrow && idx >= 0) {
                const nextIndex = idx >= history.length - 1 ? -1 : idx + 1;
                historyIndexRef.current = nextIndex;
                setHistoryIndex(nextIndex);
                onChange(nextIndex === -1 ? draftRef.current : history[nextIndex] ?? "");
                return;
            }
        },
        { isActive: true },
    );

    return (
        <Box flexDirection="row">
            <Text color="green" bold>
                ➜{" "}
            </Text>
            <Box paddingLeft={1}>
                <TextInput
                    value={value}
                    onChange={handleChange}
                    onSubmit={onSubmit}
                    placeholder={placeholder}
                    showCursor
                />
            </Box>
        </Box>
    );
}
