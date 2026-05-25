import { test, expect } from "@playwright/test"

test.describe("coming-soon page — content", () => {
  test("renders the splash wordmark, tagline, status, and footer", async ({ page }) => {
    await page.goto("/")

    await expect(page.getByRole("heading", { level: 1, name: "LazyCodex" })).toBeVisible()

    await expect(page.getByText("OmO in Codex", { exact: true })).toBeVisible()
    await expect(page.getByText("CODEX FOR NO-BRAINERS", { exact: true })).toBeVisible()
    await expect(page.getByText("Coming June 2026", { exact: false })).toBeVisible()
    await expect(page.getByText("OpenCode", { exact: false })).toBeVisible()

    await expect(page.getByText("You don't need to think.", { exact: true })).toBeVisible()
    await expect(page.getByText("Just prompt with ultrawork.", { exact: true })).toBeVisible()
    await expect(page.getByText("lazycodex.ai", { exact: true })).toBeVisible()
  })

  test("has a single h1 and no broken landmarks", async ({ page }) => {
    await page.goto("/")
    const h1s = await page.locator("h1").count()
    expect(h1s).toBe(1)
    await expect(page.locator("main")).toHaveCount(1)
    await expect(page.locator("footer")).toHaveCount(1)
  })

  test("skip-link is hidden until focused", async ({ page }) => {
    await page.goto("/")
    const skip = page.getByRole("link", { name: "Skip to main content" })
    await expect(skip).toHaveClass(/sr-only/)
    await skip.focus()
    await expect(skip).toBeFocused()
  })
})
