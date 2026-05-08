import "mocha";
import { expect } from "chai";
import {
    output,
    printJson,
    printTable,
    printText,
    runAction,
    setReplMode,
} from "../../src/cli/format.ts";
import { outputStore } from "../../src/cli/store/OutputStore.ts";

describe("CLI format", () => {
    beforeEach(() => {
        outputStore.clear();
        setReplMode(false);
    });

    describe("printText", () => {
        it("pushes command block when text is non-empty", () => {
            printText("hello");
            const items = outputStore.getItems();
            expect(items).to.have.length(1);
            expect(items[0].type).to.equal("command");
            expect((items[0] as { text: string }).text).to.equal("hello");
        });

        it("does nothing when text is empty or whitespace", () => {
            printText("");
            printText("   ");
            expect(outputStore.getItems()).to.have.length(0);
        });
    });

    describe("printJson", () => {
        it("pushes stringified JSON with indent", () => {
            printJson({ a: 1, b: "x" });
            const items = outputStore.getItems();
            expect(items).to.have.length(1);
            expect((items[0] as { text: string }).text).to.include('"a": 1');
            expect((items[0] as { text: string }).text).to.include('"b": "x"');
        });
    });

    describe("printTable", () => {
        it("pushes table with columns and rows for array of objects", () => {
            printTable([
                { id: 1, name: "A" },
                { id: 2, name: "B" },
            ]);
            const items = outputStore.getItems();
            expect(items).to.have.length(1);
            expect(items[0].type).to.equal("table");
            const table = items[0] as { columns: string[]; rows: Record<string, unknown>[] };
            expect(table.columns).to.deep.equal(["id", "name"]);
            expect(table.rows).to.have.length(2);
            expect(table.rows[0]).to.deep.equal({ id: 1, name: "A" });
        });

        it("excludes columns when excludeColumns option is set", () => {
            printTable([{ id: 1, secret: "x", name: "A" }], { excludeColumns: ["secret"] });
            const items = outputStore.getItems();
            const table = items[0] as { columns: string[]; rows: Record<string, unknown>[] };
            expect(table.columns).to.deep.equal(["id", "name"]);
            expect(table.columns).to.not.include("secret");
        });

        it("formats dateKeys as American date-time", () => {
            printTable([{ created_at: "2025-03-05T14:30:00.000Z" }], { dateKeys: ["created_at"] });
            const items = outputStore.getItems();
            const table = items[0] as { columns: string[]; rows: Record<string, unknown>[] };
            expect(table.rows[0].created_at).to.match(/^\d{2}\/\d{2}\/\d{4} \d{2}:\d{2}:\d{2}$/);
            expect(String(table.rows[0].created_at)).to.include("03/05/2025");
        });

        it("pushes 'No data.' for empty array", () => {
            printTable([]);
            const items = outputStore.getItems();
            expect(items).to.have.length(1);
            expect((items[0] as { text: string }).text).to.equal("No data.");
        });

        it("falls back to printJson for non-array", () => {
            printTable({ foo: "bar" });
            const items = outputStore.getItems();
            expect(items).to.have.length(1);
            expect((items[0] as { text: string }).text).to.include("foo");
        });
    });

    describe("output", () => {
        it("calls printJson when json is true", () => {
            output({ x: 1 }, true);
            const items = outputStore.getItems();
            expect(items).to.have.length(1);
            expect((items[0] as { text: string }).text).to.include('"x": 1');
        });

        it("calls printTable when json is false", () => {
            output([{ a: 1 }], false);
            const items = outputStore.getItems();
            expect(items[0].type).to.equal("table");
        });
    });

    describe("runAction", () => {
        it("pushes error to store in REPL mode when fn throws", async () => {
            setReplMode(true);
            await runAction(async () => {
                throw new Error("fail");
            });
            const items = outputStore.getItems();
            expect(items).to.have.length(1);
            expect(items[0].type).to.equal("error");
            expect((items[0] as { text: string }).text).to.include("Error: fail");
        });

        it("writes to stderr and exits with 1 when not in REPL mode", async () => {
            setReplMode(false);
            let exitCode: number | undefined;
            let stderrData = "";
            const origExit = process.exit;
            const origStderrWrite = process.stderr.write.bind(process.stderr);
            process.exit = ((code?: number) => {
                exitCode = code;
            }) as typeof process.exit;
            process.stderr.write = ((chunk: any) => {
                stderrData += chunk;
                return true;
            }) as typeof process.stderr.write;

            await runAction(async () => {
                throw new Error("not repl");
            });

            expect(exitCode).to.equal(1);
            expect(stderrData).to.include("Error: not repl");

            process.exit = origExit;
            process.stderr.write = origStderrWrite;
        });

        it("formats GraphQL validation errors when fn throws Apollo error", async () => {
            setReplMode(true);
            const gqlError = new Error("Validation failed");
            (gqlError as any).graphQLErrors = [
                {
                    message: "Validation failed for the field [buyClobOrder].",
                    extensions: {
                        validation: {
                            "input.amount": ["Amount must be positive"],
                            "input.outcome_id": ["Outcome not found"],
                        },
                    },
                },
            ];
            await runAction(async () => {
                throw gqlError;
            });
            const items = outputStore.getItems();
            const text = (items[0] as { text: string }).text;
            expect(text).to.include("Validation failed");
            expect(text).to.include("input.amount");
            expect(text).to.include("Amount must be positive");
            expect(text).to.include("input.outcome_id");
        });
    });
});
