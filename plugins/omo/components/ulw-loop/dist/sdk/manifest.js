export const ULW_LOOP_OPERATIONS = [
    "help",
    "create-goals",
    "status",
    "complete-goals",
    "checkpoint",
    "steer",
    "add-goal",
    "criteria",
    "record-evidence",
    "record-review-blockers",
];
export const ULW_LOOP_MANIFEST = {
    version: 1,
    name: "ulw-loop",
    operations: [
        { name: "help", mutating: false },
        { name: "create-goals", mutating: true },
        { name: "status", mutating: false },
        { name: "complete-goals", mutating: true },
        { name: "checkpoint", mutating: true },
        { name: "steer", mutating: true },
        { name: "add-goal", mutating: true },
        { name: "criteria", mutating: false },
        { name: "record-evidence", mutating: true },
        { name: "record-review-blockers", mutating: true },
    ],
};
