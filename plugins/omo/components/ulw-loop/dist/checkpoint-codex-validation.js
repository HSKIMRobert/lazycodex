import { CodexGoalSnapshotError, formatCodexGoalReconciliation, readCodexGoalSnapshotInput, reconcileCodexGoalSnapshot, } from "./codex-goal-snapshot.js";
import { codexGoalMode, compatibleCodexObjectives, expectedCodexObjective } from "./goal-status.js";
import { UlwLoopError } from "./types.js";
export async function validateCheckpointCodexGoal(input) {
    const snapshot = await readCodexGoalSnapshotInput(input.raw, input.repoRoot);
    const expected = expectedCodexObjective(input.plan, input.goal);
    const reconciliation = reconcileCodexGoalSnapshot(snapshot, {
        expectedObjective: expected,
        ...(codexGoalMode(input.plan) === "aggregate"
            ? { acceptedObjectives: compatibleCodexObjectives(input.plan) }
            : {}),
    });
    if (!reconciliation.ok)
        throw new CodexGoalSnapshotError(formatCodexGoalReconciliation(reconciliation));
    return {
        raw: snapshot?.raw,
        nextActions: reconciliation.warnings,
        warnings: reconciliation.warnings.filter((warning) => warning.startsWith("driver_objective_differs")),
    };
}
export function combineCheckpointValidationErrors(codexError, gateError) {
    return new UlwLoopError(`${codexError.message}\n${gateError.message}`, "ULW_LOOP_QUALITY_GATE_INVALID", {
        details: { ...(codexError.details ?? {}), ...(gateError.details ?? {}) },
    });
}
