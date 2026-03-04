import React, { useEffect, useRef, useState } from "react";
import { Box, Text, useInput } from "ink";

export interface CommandInputProps {
    value: string;
    onChange: (value: string) => void;
    onSubmit: (value: string) => void;
    history?: readonly string[];
}

export function CommandInput({
    value,
    onChange,
    onSubmit,
    history = [],
}: CommandInputProps): React.JSX.Element {
    const [historyIndex, setHistoryIndex] = useState(-1);
    const draftRef = useRef(value);
    const actualValueRef = useRef(value);

    const [cursor, setCursor] = useState(value.length);
    const cursorRef = useRef(cursor);

    const setCursorSync = (pos: number) => {
        cursorRef.current = pos;
        setCursor(pos);
    };

    useEffect(() => {
        actualValueRef.current = value;
        if (value === "") {
            setHistoryIndex(-1);
            setCursorSync(0);
        }
    }, [value]);

    useInput((char, key) => {
        let currentValue = actualValueRef.current;
        const currentCursor = cursorRef.current;

        if (key.return) {
            onSubmit(currentValue);
            return;
        }

        if (key.leftArrow) {
            setCursorSync(Math.max(0, currentCursor - 1));
            return;
        }

        if (key.rightArrow) {
            setCursorSync(Math.min(currentValue.length, currentCursor + 1));
            return;
        }

        if (key.backspace || key.delete || char === "\x08" || char === "\x7F") {
            if (currentCursor > 0) {
                currentValue =
                    currentValue.slice(0, currentCursor - 1) + currentValue.slice(currentCursor);
                actualValueRef.current = currentValue;
                setCursorSync(currentCursor - 1);
                onChange(currentValue);
            }
            return;
        }

        if (key.upArrow && history.length > 0) {
            const nextIndex = historyIndex <= 0 ? history.length - 1 : historyIndex - 1;
            setHistoryIndex(nextIndex);

            currentValue = history[nextIndex] ?? "";
            actualValueRef.current = currentValue;
            setCursorSync(currentValue.length);
            onChange(currentValue);
            return;
        }

        if (key.downArrow && historyIndex >= 0) {
            const nextIndex = historyIndex >= history.length - 1 ? -1 : historyIndex + 1;
            setHistoryIndex(nextIndex);

            currentValue = nextIndex === -1 ? draftRef.current : history[nextIndex] ?? "";
            actualValueRef.current = currentValue;
            setCursorSync(currentValue.length);
            onChange(currentValue);
            return;
        }

        if (key.ctrl || key.meta) {
            return;
        }

        if (char && char !== "\x08" && char !== "\x7F") {
            currentValue =
                currentValue.slice(0, currentCursor) + char + currentValue.slice(currentCursor);
            actualValueRef.current = currentValue;
            setCursorSync(currentCursor + char.length);

            if (historyIndex === -1) draftRef.current = currentValue;
            onChange(currentValue);
        }
    });

    const [cursorVisible, setCursorVisible] = useState(true);
    useEffect(() => {
        const timer = setInterval(() => setCursorVisible(v => !v), 500);
        return () => clearInterval(timer);
    }, []);

    const beforeCursor = value.slice(0, cursor);
    const atCursor = value.slice(cursor, cursor + 1) || " ";
    const afterCursor = value.slice(cursor + 1);

    return (
        <Box flexDirection="row">
            <Text color="green" bold>
                ➜{" "}
            </Text>
            <Box paddingLeft={1}>
                <Text>
                    {beforeCursor}
                    <Text inverse={cursorVisible}>{atCursor}</Text>
                    {afterCursor}
                </Text>
            </Box>
        </Box>
    );
}
