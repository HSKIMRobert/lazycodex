import { describe, it } from "node:test"
import assert from "node:assert/strict"
import { execFileSync } from "node:child_process"
import { fileURLToPath } from "node:url"
import { dirname, join } from "node:path"

const here = dirname(fileURLToPath(import.meta.url))
const bin = join(here, "..", "bin", "lazycodex-ai.js")

describe("bin/lazycodex-ai.js spawn error handling", () => {
  it("prints a clear message and exits 1 when npx is not on PATH", () => {
    // Force ENOENT by stripping PATH to an empty string for the child.
    let stderr = ""
    let code = 0
    try {
      execFileSync(process.execPath, [bin, "--help"], {
        stdio: "pipe",
        env: { ...process.env, PATH: "" },
      })
    } catch (e) {
      stderr = e.stderr ? e.stderr.toString() : String(e)
      code = e.status ?? 1
    }
    assert.equal(code, 1)
    assert.match(stderr, /npx not found/, "stderr should mention missing npx")
    assert.match(stderr, /Node\.js/, "stderr should suggest installing Node.js")
  })
})
