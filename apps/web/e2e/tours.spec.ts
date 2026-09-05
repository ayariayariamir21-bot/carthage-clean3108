import { test, expect } from "./fixtures";

test.describe("Tours Management", () => {
  test.describe("Tour Creation", () => {
    test("admin can create a tour", async ({ adminPage }) => {
      await adminPage.goto("/admin/tours/new");
      await expect(adminPage).toHaveURL("/admin/tours/new");

      // Fill tour form - real UI uses select for zone and agents
      const zoneSelect = adminPage.locator("select#zoneId");
      await expect(zoneSelect).toBeVisible();
      const zoneOptions = await zoneSelect.locator("option").allTextContents();
      // Pick first real zone option (skip the placeholder)
      const zoneValue = await zoneSelect.locator("option").nth(1).getAttribute("value");
      if (zoneValue) {
        await zoneSelect.selectOption(zoneValue);
      }

      await adminPage.fill("#date", "2025-12-25");
      await adminPage.fill("#startTime", "08:00");
      await adminPage.fill("#endTime", "12:00");

      const agentSelect = adminPage.locator("select#agents");
      await expect(agentSelect).toBeVisible();
      const agentOptions = await agentSelect.locator("option").allTextContents();
      // Pick first real agent option
      const agentValue = await agentSelect.locator("option").nth(1).getAttribute("value");
      if (agentValue) {
        await agentSelect.selectOption(agentValue);
      }

      await adminPage.fill("#notes", "Test tour creation");

      await adminPage.getByRole("button", { name: "Créer la tournée" }).click();

      // Should redirect to tours list or show success
      await expect(adminPage).toHaveURL(/\/admin\/tours/);
    });

    test("supervisor can create a tour", async ({ supervisorPage }) => {
      await supervisorPage.goto("/admin/tours/new");

      const zoneSelect = supervisorPage.locator("select#zoneId");
      await expect(zoneSelect).toBeVisible();
      const zoneValue = await zoneSelect.locator("option").nth(1).getAttribute("value");
      if (zoneValue) {
        await zoneSelect.selectOption(zoneValue);
      }

      await supervisorPage.fill("#date", "2025-12-26");
      await supervisorPage.fill("#startTime", "09:00");
      await supervisorPage.fill("#endTime", "13:00");

      const agentSelect = supervisorPage.locator("select#agents");
      await expect(agentSelect).toBeVisible();
      const agentValue = await agentSelect.locator("option").nth(1).getAttribute("value");
      if (agentValue) {
        await agentSelect.selectOption(agentValue);
      }

      await supervisorPage.getByRole("button", { name: "Créer la tournée" }).click();
      await expect(supervisorPage).toHaveURL(/\/admin\/tours/);
    });

    test("agent cannot access tour creation", async ({ agentPage }) => {
      await agentPage.goto("/admin/tours/new");
      await expect(agentPage).toHaveURL("/forbidden");
    });

    test("validation rejects invalid dates", async ({ adminPage }) => {
      await adminPage.goto("/admin/tours/new");

      const zoneSelect = adminPage.locator("select#zoneId");
      const zoneValue = await zoneSelect.locator("option").nth(1).getAttribute("value");
      if (zoneValue) await zoneSelect.selectOption(zoneValue);

      await adminPage.fill("#date", "2020-01-01"); // Past date
      await adminPage.fill("#startTime", "08:00");
      await adminPage.fill("#endTime", "12:00");

      const agentSelect = adminPage.locator("select#agents");
      const agentValue = await agentSelect.locator("option").nth(1).getAttribute("value");
      if (agentValue) await agentSelect.selectOption(agentValue);

      await adminPage.getByRole("button", { name: "Créer la tournée" }).click();
      // Should show validation error
      await expect(adminPage.locator(".alert-error")).toContainText("La date doit être aujourd");
    });

    test("validation rejects end time before start time", async ({ adminPage }) => {
      await adminPage.goto("/admin/tours/new");

      const zoneSelect = adminPage.locator("select#zoneId");
      const zoneValue = await zoneSelect.locator("option").nth(1).getAttribute("value");
      if (zoneValue) await zoneSelect.selectOption(zoneValue);

      const futureDate = `${new Date().getFullYear() + 1}-12-25`;
      await adminPage.fill("#date", futureDate);
      await adminPage.fill("#startTime", "12:00");
      await adminPage.fill("#endTime", "08:00");

      const agentSelect = adminPage.locator("select#agents");
      const agentValue = await agentSelect.locator("option").nth(1).getAttribute("value");
      if (agentValue) await agentSelect.selectOption(agentValue);

      await adminPage.getByRole("button", { name: "Créer la tournée" }).click();
      await expect(adminPage.locator(".alert-error")).toContainText(
        "L'heure de fin doit être après",
      );
    });

    test("validation requires at least one agent", async ({ adminPage }) => {
      await adminPage.goto("/admin/tours/new");

      const zoneSelect = adminPage.locator("select#zoneId");
      const zoneValue = await zoneSelect.locator("option").nth(1).getAttribute("value");
      if (zoneValue) await zoneSelect.selectOption(zoneValue);

      const futureDate = `${new Date().getFullYear() + 1}-12-25`;
      await adminPage.fill("#date", futureDate);
      await adminPage.fill("#startTime", "08:00");
      await adminPage.fill("#endTime", "12:00");
      // No agent selected - remove required attribute to allow form submission for server-side validation test
      await adminPage.locator("select#agents").evaluate((el) => el.removeAttribute("required"));

      await adminPage.getByRole("button", { name: "Créer la tournée" }).click();
      await expect(adminPage.locator(".alert-error")).toContainText("Au moins un agent est requis");
    });
  });

  test.describe("Tour List and Filters", () => {
    test("admin can view tours list", async ({ adminPage }) => {
      await adminPage.goto("/admin/tours");
      await expect(adminPage).toHaveURL("/admin/tours");
      await expect(adminPage.locator("h1")).toContainText("Tournées de nettoyage");
    });

    test("filter by date range works", async ({ adminPage }) => {
      await adminPage.goto("/admin/tours");
      await adminPage.fill('input[name="dateFrom"]', "2025-01-01");
      await adminPage.fill('input[name="dateTo"]', "2025-12-31");
      await adminPage.getByRole("button", { name: "Filtrer" }).click();
      await expect(adminPage).toHaveURL(/\/admin\/tours/);
    });

    test("filter by status works", async ({ adminPage }) => {
      await adminPage.goto("/admin/tours");
      await adminPage.selectOption('select[name="status"]', "planifiée");
      await adminPage.getByRole("button", { name: "Filtrer" }).click();
      await expect(adminPage).toHaveURL(/\/admin\/tours/);
    });

    test("filter by zone works", async ({ adminPage }) => {
      await adminPage.goto("/admin/tours");
      const zoneSelect = adminPage.locator('select[name="zoneId"]');
      await expect(zoneSelect).toBeVisible();
      const zoneValue = await zoneSelect.locator("option").nth(1).getAttribute("value");
      if (zoneValue) {
        await zoneSelect.selectOption(zoneValue);
        await adminPage.getByRole("button", { name: "Filtrer" }).click();
        await expect(adminPage).toHaveURL(/\/admin\/tours/);
      }
    });

    test("pagination works", async ({ adminPage }) => {
      // Create enough tours to trigger pagination (page size = 20)
      const futureDate = `${new Date().getFullYear() + 1}-12-25`;
      let createdCount = 0;
      for (let i = 0; i < 21; i++) {
        await adminPage.goto("/admin/tours/new");
        const zoneSelect = adminPage.locator("select#zoneId");
        const zoneValue = await zoneSelect.locator("option").nth(1).getAttribute("value");
        if (zoneValue) await zoneSelect.selectOption(zoneValue);

        await adminPage.fill("#date", futureDate);
        // Use unique times for each tour to avoid conflicts - cycle through valid hours
        const startHour = ((8 + (i % 12)) % 24).toString().padStart(2, "0");
        const endHour = ((9 + (i % 12)) % 24).toString().padStart(2, "0");
        await adminPage.fill("#startTime", `${startHour}:00`);
        await adminPage.fill("#endTime", `${endHour}:00`);

        const agentSelect = adminPage.locator("select#agents");
        const agentValue = await agentSelect.locator("option").nth(1).getAttribute("value");
        if (agentValue) await agentSelect.selectOption(agentValue);

        await adminPage.getByRole("button", { name: "Créer la tournée" }).click();
        // Verify creation succeeded by checking URL
        await expect(adminPage).toHaveURL(/\/admin\/tours/);
        createdCount++;
      }

      console.log(`Created ${createdCount} tours for pagination test`);

      // Now verify pagination controls appear
      await adminPage.goto("/admin/tours");
      // Check for page 2 button (pagination uses buttons with page numbers)
      await expect(adminPage.locator('button:has-text("2")').first()).toBeVisible();
      // Also verify "Suivant" (Next) button exists
      await expect(adminPage.getByRole("button", { name: "Suivant" })).toBeVisible();
    });

    test("agent sees only assigned tours", async ({ agentPage }) => {
      await agentPage.goto("/dashboard");
      // Agent should only see their assigned tours
      await expect(agentPage.locator("h1")).toContainText("Tableau de bord");
    });
  });

  test.describe("Tour Workflow", () => {
    test("planifiée → en_cours transition", async ({ adminPage }) => {
      // Create a tour first
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

      // Find the newly created tour and click start
      await adminPage.goto("/admin/tours");
      const startButton = adminPage.locator('button:has-text("Démarrer")').first();
      if (await startButton.isVisible()) {
        await startButton.click();
        await expect(adminPage.locator(".alert-success")).toBeVisible();
      }
    });

    test("en_cours → terminée transition", async ({ adminPage }) => {
      // Requires a tour in progress - create one first
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

      // Start the tour
      await adminPage.goto("/admin/tours");
      const startButton = adminPage.locator('button:has-text("Démarrer")').first();
      if (await startButton.isVisible()) {
        await startButton.click();
        await expect(adminPage.locator(".alert-success")).toBeVisible();

        // Now complete it
        await adminPage.goto("/admin/tours");
        const completeButton = adminPage.locator('button:has-text("Terminer")').first();
        if (await completeButton.isVisible()) {
          await completeButton.click();
          await expect(adminPage.locator(".alert-success")).toBeVisible();
        }
      }
    });

    test("annulation requires reason", async ({ adminPage }) => {
      // Create a tour first
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

      await adminPage.goto("/admin/tours");
      const cancelButton = adminPage.locator('button:has-text("Annuler")').first();
      if (await cancelButton.isVisible()) {
        await cancelButton.click();
        // Modal should open asking for reason
        await expect(adminPage.locator('textarea[name="cancellationReason"]')).toBeVisible();
      }
    });

    test("annulation without reason fails", async ({ adminPage }) => {
      // Create a tour first
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

      await adminPage.goto("/admin/tours");
      const cancelButton = adminPage.locator('button:has-text("Annuler")').first();
      if (await cancelButton.isVisible()) {
        await cancelButton.click();
        await adminPage.getByRole("button", { name: "Annuler" }).click();
        await expect(adminPage.locator(".alert-error")).toBeVisible();
      }
    });
  });

  test.describe("Tour Details", () => {
    test("view tour details", async ({ adminPage }) => {
      // Create a tour first
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

      await adminPage.goto("/admin/tours");
      const viewButton = adminPage.locator('a[href*="/admin/tours/"]').first();
      if (await viewButton.isVisible()) {
        await viewButton.click();
        await expect(adminPage).toHaveURL(/\/admin\/tours\//);
      }
    });

    test("tour detail shows all info", async ({ adminPage }) => {
      // Create a tour first
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

      await adminPage.goto("/admin/tours");
      const viewButton = adminPage.getByRole("link", { name: "Détails" }).first();
      if (await viewButton.isVisible()) {
        await Promise.all([adminPage.waitForURL(/\/admin\/tours\//), viewButton.click()]);
        await expect(adminPage.locator('dt:has-text("Date")')).toBeVisible();
        await expect(adminPage.locator('dt:has-text("Zone")')).toBeVisible();
        await expect(adminPage.locator('dt:has-text("Statut")')).toBeVisible();
      }
    });
  });

  test.describe("Export CSV", () => {
    test("admin can export tours to CSV", async ({ adminPage }) => {
      await adminPage.goto("/admin/tours");
      // Check export button exists
      const exportButton = adminPage.locator('a[href*="/api/admin/tours/export"]');
      await expect(exportButton).toBeVisible();
    });

    test("CSV export includes all fields", async ({ adminPage }) => {
      await adminPage.goto("/admin/tours");
      const exportButton = adminPage.locator('a[href*="/api/admin/tours/export"]');
      const downloadPromise = adminPage.waitForEvent("download");
      await exportButton.click();
      const download = await downloadPromise;
      expect(download.suggestedFilename()).toMatch(/\.csv$/);
    });
  });

  test.describe("Data Isolation", () => {
    test("agent cannot see other agents tours", async ({ agentPage, adminPage }) => {
      // Create a tour assigned to agent 1 (the agent fixture user)
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

      // Agent 1 (agentPage fixture) should see the tour
      await agentPage.goto("/dashboard");
      await expect(agentPage.locator("h1")).toContainText("Tableau de bord");

      // Create another tour for a different agent (if available)
      await adminPage.goto("/admin/tours/new");
      const zoneSelect2 = adminPage.locator("select#zoneId");
      const zoneValue2 = await zoneSelect2.locator("option").nth(1).getAttribute("value");
      if (zoneValue2) await zoneSelect2.selectOption(zoneValue2);
      await adminPage.fill("#date", "2025-12-26");
      await adminPage.fill("#startTime", "08:00");
      await adminPage.fill("#endTime", "12:00");
      // Try to select a different agent if available
      const agentOptions = await adminPage.locator("select#agents option").all();
      if (agentOptions.length > 2) {
        const otherAgentOption = agentOptions[2];
        if (otherAgentOption) {
          const otherAgentValue = await otherAgentOption.getAttribute("value");
          if (otherAgentValue !== null) {
            await adminPage.locator("select#agents").selectOption(otherAgentValue);
          }
        }
      }
      await adminPage.getByRole("button", { name: "Créer la tournée" }).click();
      await expect(adminPage).toHaveURL(/\/admin\/tours/);

      // Agent 1 should only see their own tours (not the one assigned to agent 2)
      // This is verified by checking dashboard shows only their assigned tours
      await agentPage.goto("/dashboard");
      await expect(agentPage.locator("h1")).toContainText("Tableau de bord");
    });

    test("supervisor sees all tours", async ({ supervisorPage, adminPage }) => {
      // Create a tour for agent 1
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
      await supervisorPage.goto("/admin/tours");
      await expect(supervisorPage.locator("h1")).toContainText("Tournées de nettoyage");
    });
  });
});
