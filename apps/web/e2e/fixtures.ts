import { test as base, Page, expect } from "@playwright/test";

interface Fixtures {
  adminPage: Page;
  agentPage: Page;
  supervisorPage: Page;
  newAdminPage: Page;
  cleanTestDb: void;
}

export const test = base.extend<Fixtures>({
  cleanTestDb: [
    async ({ request }, _use) => {
      await _use();
      // Teardown: reset DB after each test to ensure next test starts clean
      const maxAttempts = 3;
      let lastError: unknown = null;
      for (let attempt = 1; attempt <= maxAttempts; attempt++) {
        try {
          const response = await request.post("/api/test/reset");
          if (response.ok()) {
            lastError = null;
            break;
          }
          const body = await response.text();
          lastError = new Error(`reset failed ${response.status()} ${body}`);
          if (response.status() === 403) break;
        } catch (err) {
          lastError = err;
        }
        if (attempt < maxAttempts) {
          await new Promise<void>((resolve) => setTimeout(resolve, 500 * attempt));
        }
      }
      if (lastError) {
        try {
          const baseURL = process.env.E2E_BASE_URL || "http://localhost:3000";
          const res = await fetch(`${baseURL}/api/test/reset`, { method: "POST" });
          if (!res.ok) {
            const text = await res.text();
            throw new Error(`fetch reset failed ${res.status} ${text}`);
          }
          lastError = null;
        } catch {
          // ignore
        }
      }
      if (lastError) {
        console.warn("cleanTestDb teardown reset failed:", lastError);
      }
    },
    { auto: true, scope: "test" },
  ],

  adminPage: [
    async ({ browser, cleanTestDb: _cleanTestDb }, _use) => {
      const context = await browser.newContext();
      const page = await context.newPage();
      await loginAs(page, "admin@example.com", "AdminPass123!");
      await expect(page.locator("h1")).toContainText("Tableau de bord");
      await _use(page);
      await context.close();
    },
    { scope: "test" },
  ],

  supervisorPage: [
    async ({ browser, cleanTestDb: _cleanTestDb }, _use) => {
      const context = await browser.newContext();
      const page = await context.newPage();
      await loginAs(page, "supervisor@example.com", "SupervisorPass123!");
      await expect(page.locator("h1")).toContainText("Tableau de bord");
      await _use(page);
      await context.close();
    },
    { scope: "test" },
  ],

  agentPage: [
    async ({ browser, cleanTestDb: _cleanTestDb }, _use) => {
      const context = await browser.newContext();
      const page = await context.newPage();
      await loginAs(page, "agent@example.com", "AgentPass123!");
      await expect(page.locator("h1")).toContainText("Tableau de bord");
      await _use(page);
      await context.close();
    },
    { scope: "test" },
  ],

  newAdminPage: [
    async ({ browser, cleanTestDb: _cleanTestDb }, _use) => {
      const context = await browser.newContext();
      const page = await context.newPage();
      await page.goto("/login");
      await page.fill("#email", "newadmin@example.com");
      await page.fill("#password", "InitialPass123!");
      await page.click('button[type="submit"]');
      await page.waitForURL(/\/auth\/change-password|\/dashboard/, { timeout: 10000 });
      await _use(page);
      await context.close();
    },
    { scope: "test" },
  ],
});

export async function loginAs(page: Page, email: string, password: string) {
  await page.goto("/login");
  await page.fill("#email", email);
  await page.fill("#password", password);
  await Promise.all([
    page.waitForURL("/dashboard", { timeout: 10000 }),
    page.click('button[type="submit"]'),
  ]);
  await page.waitForLoadState("load");
  await expect(page).toHaveURL("/dashboard");
}

export async function logout(page: Page) {
  await page.goto("/api/logout");
  await page.waitForURL("/login");
}

export { expect } from "@playwright/test";
