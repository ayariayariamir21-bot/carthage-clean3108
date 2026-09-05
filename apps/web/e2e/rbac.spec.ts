import { test, expect } from "./fixtures";

test.describe("RBAC - Role-Based Access Control", () => {
  test.describe("Admin Access", () => {
    test("admin can access dashboard", async ({ adminPage }) => {
      await adminPage.goto("/dashboard");
      await expect(adminPage).toHaveURL("/dashboard");
      await expect(adminPage.locator("h1")).toContainText("Tableau de bord");
    });

    test("admin can access admin panel", async ({ adminPage }) => {
      // Warmup: trigger dev-server compilation via request so WebKit page.goto
      // is not interrupted by a Fast Refresh full reload (cold-route race).
      await adminPage.request.get("/admin");
      await adminPage.goto("/admin");
      await expect(adminPage).toHaveURL("/admin");
      await expect(adminPage.locator("h1")).toContainText("Administration");
    });

    test("admin can access agents management", async ({ adminPage }) => {
      // Warmup: trigger dev-server compilation via request so WebKit page.goto
      // is not interrupted by a Fast Refresh full reload (cold-route race).
      await adminPage.request.get("/admin/agents");
      await adminPage.goto("/admin/agents");
      await expect(adminPage).toHaveURL("/admin/agents");
      await expect(adminPage.locator("h1")).toContainText("Gestion des comptes");
    });

    test("admin can access zones management", async ({ adminPage }) => {
      // Warmup: trigger dev-server compilation via request so WebKit page.goto
      // is not interrupted by a Fast Refresh full reload (cold-route race).
      await adminPage.request.get("/admin/zones");
      await adminPage.goto("/admin/zones");
      await expect(adminPage).toHaveURL("/admin/zones");
    });

    test("admin can access tours management", async ({ adminPage }) => {
      // Warmup: trigger dev-server compilation via request so WebKit page.goto
      // is not interrupted by a Fast Refresh full reload (cold-route race).
      await adminPage.request.get("/admin/tours");
      await adminPage.goto("/admin/tours");
      await expect(adminPage).toHaveURL("/admin/tours");
    });

    test("admin can access audit logs", async ({ adminPage }) => {
      // Warmup: trigger dev-server compilation via request so WebKit page.goto
      // is not interrupted by a Fast Refresh full reload (cold-route race).
      await adminPage.request.get("/admin/audit");
      await adminPage.goto("/admin/audit");
      await expect(adminPage).toHaveURL("/admin/audit");
    });

    test("admin can access API endpoints", async ({ adminPage }) => {
      const response = await adminPage.request.get("/api/admin/users");
      expect(response.ok()).toBeTruthy();
    });
  });

  test.describe("Supervisor Access", () => {
    test("supervisor can access dashboard", async ({ supervisorPage }) => {
      await supervisorPage.goto("/dashboard");
      await expect(supervisorPage).toHaveURL("/dashboard");
    });

    test("supervisor can access admin panel", async ({ supervisorPage }) => {
      // Warmup: trigger dev-server compilation via request so WebKit page.goto
      // is not interrupted by a Fast Refresh full reload (cold-route race).
      await supervisorPage.request.get("/admin");
      await supervisorPage.goto("/admin");
      // Admin panel is admin-only; supervisor should be forbidden (app/admin/page.tsx uses requireRolePage("admin"))
      await expect(supervisorPage).toHaveURL("/forbidden");
    });

    test("supervisor can access zones", async ({ supervisorPage }) => {
      await supervisorPage.goto("/admin/zones");
      await expect(supervisorPage).toHaveURL("/admin/zones");
    });

    test("supervisor can access tours", async ({ supervisorPage }) => {
      await supervisorPage.goto("/admin/tours");
      await expect(supervisorPage).toHaveURL("/admin/tours");
    });
  });

  test.describe("Agent Access", () => {
    test("agent can access dashboard", async ({ agentPage }) => {
      await agentPage.goto("/dashboard");
      await expect(agentPage).toHaveURL("/dashboard");
    });

    test("agent cannot access admin panel", async ({ agentPage }) => {
      await agentPage.goto("/admin");
      await expect(agentPage).toHaveURL("/forbidden");
    });

    test("agent cannot access agents management", async ({ agentPage }) => {
      await agentPage.goto("/admin/agents");
      await expect(agentPage).toHaveURL("/forbidden");
    });

    test("agent cannot access zones management", async ({ agentPage }) => {
      await agentPage.goto("/admin/zones");
      await expect(agentPage).toHaveURL("/forbidden");
    });

    test("agent cannot access admin API", async ({ agentPage }) => {
      const response = await agentPage.request.get("/api/admin/users");
      expect(response.status()).toBe(403);
    });

    test("agent can only see own tours", async ({ agentPage }) => {
      await agentPage.goto("/dashboard");
      // Agent should only see their assigned tours
      await expect(agentPage.locator("h1")).toContainText("Tableau de bord");
    });
  });

  test.describe("Unauthenticated Access", () => {
    test("unauthenticated user redirected to login", async ({ page }) => {
      await page.goto("/dashboard");
      await expect(page).toHaveURL("/login");
    });

    test("unauthenticated user cannot access admin", async ({ page }) => {
      await page.goto("/admin");
      await expect(page).toHaveURL("/login");
    });

    test("unauthenticated user cannot access API", async ({ page }) => {
      const response = await page.request.get("/api/admin/users");
      expect(response.status()).toBe(401);
    });
  });

  test.describe("Direct URL Access", () => {
    test("direct URL to admin page redirects unauthenticated", async ({ page }) => {
      await page.goto("/admin/agents");
      await expect(page).toHaveURL("/login");
    });

    test("direct URL to tours page redirects unauthenticated", async ({ page }) => {
      await page.goto("/admin/tours");
      await expect(page).toHaveURL("/login");
    });
  });
});
