import { handleLspMcpRequest } from "@oh-my-opencode/lsp-core/mcp";
import { runWithRequestContext } from "@oh-my-opencode/lsp-core/request-context";
import { isPlainRecord } from "@oh-my-opencode/mcp-stdio-core/record";
export const CONTEXT_KEY = "_context";
export function extractRequestContext(raw) {
    if (!isPlainRecord(raw) || raw["method"] !== "tools/call")
        return { input: raw, context: undefined };
    const params = raw["params"];
    if (!isPlainRecord(params))
        return { input: raw, context: undefined };
    const args = params["arguments"];
    if (!isPlainRecord(args))
        return { input: raw, context: undefined };
    const context = parseContext(args[CONTEXT_KEY]);
    if (!context)
        return { input: raw, context: undefined };
    const cleanedArgs = { ...args };
    delete cleanedArgs[CONTEXT_KEY];
    const cleaned = { ...raw, params: { ...params, arguments: cleanedArgs } };
    return { input: cleaned, context };
}
export function handleDaemonMessage(raw) {
    const { input, context } = extractRequestContext(raw);
    if (context)
        return runWithRequestContext(context, () => handleLspMcpRequest(input));
    return handleLspMcpRequest(input);
}
function parseContext(value) {
    if (!isPlainRecord(value))
        return undefined;
    const context = {};
    const cwd = value["cwd"];
    if (typeof cwd === "string")
        context.cwd = cwd;
    const env = value["env"];
    if (isStringRecord(env))
        context.env = env;
    return context.cwd === undefined && context.env === undefined ? undefined : context;
}
function isStringRecord(value) {
    return isPlainRecord(value) && Object.values(value).every((item) => typeof item === "string");
}
