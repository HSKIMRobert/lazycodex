import { existsSync } from "node:fs";
import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
export class CodexGoalSnapshotError extends Error {
}
function safeObject(value) {
    return value && typeof value === "object" && !Array.isArray(value) ? value : {};
}
function safeString(value) {
    return typeof value === "string" ? value : "";
}
function safeStatusString(value) {
    return typeof value === "string" ? value.trim() : "";
}
function normalizeStatus(value) {
    const status = safeStatusString(value).toLowerCase();
    if (status === "complete" || status === "completed" || status === "done")
        return "complete";
    if (status === "cancelled" || status === "canceled")
        return "cancelled";
    if (status === "failed" || status === "failure")
        return "failed";
    if (status === "paused")
        return "paused";
    if (status === "usage_limited")
        return "usage_limited";
    if (status === "budget_limited")
        return "budget_limited";
    if (status === "active" || status === "in_progress" || status === "pending" || status === "running")
        return "active";
    return "unknown";
}
function normalizeObjective(value) {
    return value.replace(/\s+/g, " ").trim();
}
export function parseCodexGoalSnapshot(value) {
    const root = safeObject(value);
    const goalValue = Object.hasOwn(root, "goal") ? root["goal"] : value;
    if (goalValue === null || goalValue === undefined || goalValue === false) {
        return { available: false, raw: value };
    }
    const goal = safeObject(goalValue);
    const objective = safeString(goal["objective"] ?? goal["goal"] ?? goal["description"] ?? goal["title"] ?? root["objective"] ?? root["title"]);
    const status = normalizeStatus(goal["status"] ?? root["status"]);
    return {
        available: Boolean(objective || status !== "unknown"),
        ...(objective ? { objective } : {}),
        status,
        raw: value,
    };
}
export async function readCodexGoalSnapshotInput(raw, cwd = process.cwd()) {
    if (!raw?.trim())
        return null;
    const trimmed = raw.trim();
    try {
        return parseCodexGoalSnapshot(JSON.parse(trimmed));
    }
    catch {
        const path = resolve(cwd, trimmed);
        if (!existsSync(path)) {
            throw new CodexGoalSnapshotError(`Codex goal snapshot is neither valid JSON nor a readable path: ${trimmed}`);
        }
        try {
            return parseCodexGoalSnapshot(JSON.parse(await readFile(path, "utf-8")));
        }
        catch (error) {
            throw new CodexGoalSnapshotError(`Codex goal snapshot path does not contain valid JSON: ${trimmed}${error instanceof Error ? ` (${error.message})` : ""}`);
        }
    }
}
export function reconcileCodexGoalSnapshot(snapshot, options) {
    const effectiveSnapshot = snapshot ?? { available: false, raw: null };
    const errors = [];
    const warnings = [];
    const expected = options.expectedObjective;
    const normalizedExpected = normalizeObjective(expected);
    if (!effectiveSnapshot.available) {
        warnings.push(`call get_goal; if none, create_goal with codexObjective "${expected}" verbatim`);
        return { ok: errors.length === 0, snapshot: effectiveSnapshot, warnings, errors };
    }
    const accepted = new Set([
        normalizedExpected,
        ...(options.acceptedObjectives ?? []).map((objective) => normalizeObjective(objective)),
    ].filter(Boolean));
    const actual = normalizeObjective(effectiveSnapshot.objective ?? "");
    if (actual && !accepted.has(normalizeObjective(actual))) {
        warnings.push(`driver_objective_differs: expected "${expected}", got "${actual}".`);
    }
    const actualStatus = effectiveSnapshot.status ?? "unknown";
    if (actualStatus === "paused" || actualStatus === "usage_limited" || actualStatus === "budget_limited") {
        warnings.push("/goal resume or raise the budget");
    }
    if (actualStatus === "complete")
        warnings.push(`driver closed early: call create_goal with codexObjective "${expected}" verbatim`);
    return { ok: errors.length === 0, snapshot: effectiveSnapshot, warnings, errors };
}
export function formatCodexGoalReconciliation(reconciliation) {
    const parts = [...reconciliation.errors, ...reconciliation.warnings];
    return parts.join(" ");
}
