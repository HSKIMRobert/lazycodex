import type { UlwLoopScope } from "./paths.js";
import type { UlwLoopAggregateCompletion, UlwLoopItem, UlwLoopLedgerEntry, UlwLoopPlan } from "./types.js";
export interface CheckpointUlwLoopArgs {
    readonly goalId: string;
    readonly status: "complete" | "failed" | "blocked";
    readonly evidence: string;
    readonly codexGoalJson?: string;
    readonly qualityGateJson?: string;
}
export interface CheckpointUlwLoopResult {
    readonly plan: UlwLoopPlan;
    readonly goal: UlwLoopItem;
    readonly ledgerEntry: UlwLoopLedgerEntry;
    readonly aggregateCompletion?: UlwLoopAggregateCompletion;
    readonly nextActions: readonly string[];
    readonly warnings: readonly string[];
}
export declare function checkpointUlwLoop(repoRoot: string, args: CheckpointUlwLoopArgs, scope?: UlwLoopScope): Promise<CheckpointUlwLoopResult>;
