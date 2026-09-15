import { join } from "node:path";
import { ulwLoopDir } from "./paths.js";
import { readOptional, readRecords, reconcilePlan } from "./plan-log.js";
export function readLedgerAt(dir) {
    const entries = new Map();
    const lines = (readOptional(join(dir, "ledger.jsonl")) ?? "").split(/\r?\n/);
    for (const [index, line] of lines.entries()) {
        if (line.trim().length === 0)
            continue;
        try {
            const entry = JSON.parse(line);
            entry.revision ??= 0;
            entry.id ??= `legacy-${index + 1}`;
            entries.set(entry.id, entry);
        }
        catch (error) {
            if (!(error instanceof SyntaxError))
                throw error;
        }
    }
    for (const record of readRecords(dir))
        for (const [seq, entry] of record.ledger.entries()) {
            const id = entry.id ?? `${record.revision}-${seq}`;
            entries.set(id, { ...entry, revision: record.revision, id });
        }
    const reset = reconcilePlan(dir)?.ledgerResetRevision ?? 0;
    const sequence = (entry) => Number(entry.id?.split("-").at(-1) ?? 0);
    return [...entries.values()]
        .filter((entry) => (entry.revision ?? 0) >= reset)
        .sort((a, b) => (a.revision ?? 0) - (b.revision ?? 0) || sequence(a) - sequence(b));
}
export function readLedger(repoRoot, scope) {
    return readLedgerAt(ulwLoopDir(repoRoot, scope));
}
