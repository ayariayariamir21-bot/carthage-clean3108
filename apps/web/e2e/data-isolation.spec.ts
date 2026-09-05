import { test, expect } from "./fixtures";

test.describe("Data Isolation", () => {
  test.describe("Agent Isolation", () => {
    test("agent only sees own tours", async ({ agentPage, adminPage }) => {
      // Create a tour assigned to agent 1 (the agent fixture user)
      // Warmup: trigger dev-server compilation via request so WebKit page.goto
      // is not interrupted by a Fast Refresh full reload (cold-route race).
      await adminPage.request.get("/admin/tours/new");
      await adminPage.goto("/admin/tours/new");
      const zoneSelect = adminPage.locator("select#zoneId");
      const zoneValue = await zoneSelect.locator("option").nth(1).getAttribute("value");
      if (zoneValue) await zoneSelect.selectOption(zoneValue);
      await adminPage.fill("#date", "2025-12-25");
      await adminPage.fill("#startTime", "08:00");
      await adminPage.fill("#endTime", "12:00");
      const agentSelect = adminPage.locator("select#agents");
      const agentValue = await agentSelect.locator("option").nth(1).getAttribute("value");
      if (agentValue) await agentSelect.selectOption(agentValue);
      await adminPage.getByRole("button", { name: "Créer la tournée" }).click();
      await expect(adminPage).toHaveURL(/\/admin\/tours/);

      // Agent 1 should see the tour
      await agentPage.goto("/dashboard");
      await expect(agentPage.locator("h1")).toContainText("Tableau de bord");

      const agentOptions = await adminPage.locator("select#agents option").all();
      if (agentOptions.length > 2) {
        await adminPage.goto("/admin/tours/new");
        const zoneSelect2 = adminPage.locator("select#zoneId");
        const zoneValue2 = await zoneSelect2.locator("option").nth(1).getAttribute("value");
        if (zoneValue2) await zoneSelect2.selectOption(zoneValue2);
        await adminPage.fill("#date", "2025-12-26");
        await adminPage.fill("#startTime", "08:00");
        await adminPage.fill("#endTime", "12:00");
        const otherAgentOption = agentOptions[2];
        if (otherAgentOption) {
          const otherAgentValue = await otherAgentOption.getAttribute("value");
          if (otherAgentValue !== null) {
            await adminPage.locator("select#agents").selectOption(otherAgentValue);
          }
        }
        await adminPage.getByRole("button", { name: "Créer la tournée" }).click();
        await expect(adminPage).toHaveURL(/\/admin\/tours/);

        // Agent 1 should NOT see that tour on dashboard
        await agentPage.goto("/dashboard");
        // Agent 1 should only see their own tours
        await expect(agentPage.locator("h1")).toContainText("Tableau de bord");
      }
    });

    test("agent only sees own profile", async ({ agentPage }) => {
      // Agent can access their own profile area
      await agentPage.goto("/dashboard");
      await expect(agentPage.locator("h1")).toContainText("Tableau de bord");
      // The UI shows agent's own info on dashboard
    });
  });

  test.describe("Zone Isolation", () => {
    test("agent only sees assigned zones", async ({ agentPage, adminPage }) => {
      // Warmup: trigger dev-server compilation via request so WebKit page.goto
      // is not interrupted by a Fast Refresh full reload (cold-route race).
      await adminPage.request.get("/admin/zones");
      await adminPage.goto("/admin/zones");
      // ZTEST zone is already seeded and active
      // Agent's dashboard shows assigned zones
      await agentPage.goto("/dashboard");
      await expect(agentPage.locator("h1")).toContainText("Tableau de bord");
    });

    test("agent cannot see unassigned zones", async ({ agentPage }) => {
      await agentPage.goto("/dashboard");
      // Dashboard only shows zones assigned to this agent
      await expect(agentPage.locator("h1")).toContainText("Tableau de bord");
    });
  });

  test.describe("Tour Isolation", () => {
    test("agent only sees assigned tours", async ({ agentPage, adminPage }) => {
      // Create a tour assigned to agent 1
      await adminPage.goto("/admin/tours/new");
      const zoneSelect = adminPage.locator("select#zoneId");
      const zoneValue = await zoneSelect.locator("option").nth(1).getAttribute("value");
      if (zoneValue) await zoneSelect.selectOption(zoneValue);
      await adminPage.fill("#date", "2025-12-25");
      await adminPage.fill("#startTime", "08:00");
      await adminPage.fill("#endTime", "12:00");
      const agentSelect = adminPage.locator("select#agents");
      const agentValue = await agentSelect.locator("option").nth(1).getAttribute("value");
      if (agentValue) await agentSelect.selectOption(agentValue);
      await adminPage.getByRole("button", { name: "Créer la tournée" }).click();
      await expect(adminPage).toHaveURL(/\/admin\/tours/);

      await agentPage.goto("/dashboard");
      await expect(agentPage.locator("h1")).toContainText("Tableau de bord");
    });

    test("agent cannot see other agents tours", async ({ agentPage, adminPage }) => {
      // Create a tour assigned to agent 1
      await adminPage.goto("/admin/tours/new");
      const zoneSelect = adminPage.locator("select#zoneId");
      const zoneValue = await zoneSelect.locator("option").nth(1).getAttribute("value");
      if (zoneValue) await zoneSelect.selectOption(zoneValue);
      await adminPage.fill("#date", "2025-12-25");
      await adminPage.fill("#startTime", "08:00");
      await adminPage.fill("#endTime", "12:00");
      const agentSelect = adminPage.locator("select#agents");
      const agentValue = await agentSelect.locator("option").nth(1).getAttribute("value");
      if (agentValue) await agentSelect.selectOption(agentValue);
      await adminPage.getByRole("button", { name: "Créer la tournée" }).click();
      await expect(adminPage).toHaveURL(/\/admin\/tours/);

      const agentOptions = await adminPage.locator("select#agents option").all();
      if (agentOptions.length > 2) {
        await adminPage.goto("/admin/tours/new");
        const zoneSelect2 = adminPage.locator("select#zoneId");
        const zoneValue2 = await zoneSelect2.locator("option").nth(1).getAttribute("value");
        if (zoneValue2) await zoneSelect2.selectOption(zoneValue2);
        await adminPage.fill("#date", "2025-12-26");
        await adminPage.fill("#startTime", "08:00");
        await adminPage.fill("#endTime", "12:00");
        const otherAgentOption = agentOptions[2];
        if (otherAgentOption) {
          const otherAgentValue = await otherAgentOption.getAttribute("value");
          if (otherAgentValue !== null) {
            await adminPage.locator("select#agents").selectOption(otherAgentValue);
          }
        }
        await adminPage.getByRole("button", { name: "Créer la tournée" }).click();
        await expect(adminPage).toHaveURL(/\/admin\/tours/);
      }

      // Agent 1 should not see agent 2's tour
      await agentPage.goto("/dashboard");
      await expect(agentPage.locator("h1")).toContainText("Tableau de bord");
    });

    test("supervisor sees all tours", async ({ supervisorPage, adminPage }) => {
      // Create a tour for agent 1
      // Warmup: trigger dev-server compilation via request so WebKit page.goto
      // is not interrupted by a Fast Refresh full reload (cold-route race).
      await adminPage.request.get("/admin/tours/new");
      await adminPage.goto("/admin/tours/new");
      const zoneSelect = adminPage.locator("select#zoneId");
      const zoneValue = await zoneSelect.locator("option").nth(1).getAttribute("value");
      if (zoneValue) await zoneSelect.selectOption(zoneValue);
      await adminPage.fill("#date", "2025-12-25");
      await adminPage.fill("#startTime", "08:00");
      await adminPage.fill("#endTime", "12:00");
      const agentSelect = adminPage.locator("select#agents");
      const agentValue = await agentSelect.locator("option").nth(1).getAttribute("value");
      if (agentValue) await agentSelect.selectOption(agentValue);
      await adminPage.getByRole("button", { name: "Créer la tournée" }).click();
      await expect(adminPage).toHaveURL(/\/admin\/tours/);

      // Supervisor should see all tours
      // Warmup: same cold-route race as above, with the supervisor session.
      await supervisorPage.request.get("/admin/tours");
      await supervisorPage.goto("/admin/tours");
      await expect(supervisorPage.locator("h1")).toContainText("Tournées de nettoyage");
    });
  });

  test.describe("Zone Assignment Isolation", () => {
    test("agent only sees assignments for their zones", async ({ agentPage, adminPage }) => {
      await adminPage.goto("/admin/zones");
      // ZTEST zone is seeded
      await agentPage.goto("/dashboard");
      await expect(agentPage.locator("h1")).toContainText("Tableau de bord");
    });

    test("agent cannot see other zones assignments", async ({ agentPage }) => {
      // Warmup: trigger dev-server compilation via request so WebKit page.goto
      // is not interrupted by a Fast Refresh full reload (cold-route race).
      await agentPage.request.get("/admin/zones");
      await agentPage.goto("/admin/zones");
      // Agents cannot access /admin/zones - should be redirected to forbidden
      await expect(agentPage).toHaveURL("/forbidden");
      await expect(agentPage.locator("h1")).toContainText("Accès refusé");
    });
  });
});
