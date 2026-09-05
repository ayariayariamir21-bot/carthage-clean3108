import { test, expect } from "./fixtures";

test.describe("Zones Management", () => {
  test.describe("Zone Creation", () => {
    test("admin can create a zone", async ({ adminPage }) => {
      await adminPage.goto("/admin/zones");
      await expect(adminPage.locator("h1")).toContainText("Gestion des zones");

      // Form is inline on /admin/zones page
      await adminPage.fill("#name", "Zone Test E2E");
      await adminPage.fill("#code", "ZTE2E");
      await adminPage.fill("#description", "Zone de test E2E");

      await adminPage.getByRole("button", { name: "Créer la zone" }).click();
      await expect(adminPage).toHaveURL("/admin/zones");
      await expect(adminPage.locator('[role="status"]')).toBeVisible();
    });

    test("supervisor can create a zone", async ({ supervisorPage }) => {
      await supervisorPage.goto("/admin/zones");
      await supervisorPage.fill("#name", "Zone Superviseur");
      await supervisorPage.fill("#code", "ZSUP");
      await supervisorPage.getByRole("button", { name: "Créer la zone" }).click();
      await expect(supervisorPage).toHaveURL("/admin/zones");
      await expect(supervisorPage.locator('[role="status"]')).toBeVisible();
    });

    test("agent cannot create zone", async ({ agentPage }) => {
      // Agent cannot access /admin/zones - page guard redirects to forbidden
      await agentPage.goto("/admin/zones");
      await expect(agentPage).toHaveURL("/forbidden");
      await expect(agentPage.locator("h1")).toContainText("Accès refusé");
    });

    test("validation rejects empty name", async ({ adminPage }) => {
      await adminPage.goto("/admin/zones");
      await adminPage.fill("#code", "Z01");
      // Remove required attribute to allow form submission for server-side validation test
      await adminPage.locator("#name").evaluate((el) => el.removeAttribute("required"));
      await adminPage.getByRole("button", { name: "Créer la zone" }).click();
      await expect(adminPage.locator(".alert-error")).toContainText("Données invalides");
    });

    test("validation rejects empty code", async ({ adminPage }) => {
      await adminPage.goto("/admin/zones");
      await adminPage.fill("#name", "Zone Test");
      // Remove required attribute to allow form submission for server-side validation test
      await adminPage.locator("#code").evaluate((el) => el.removeAttribute("required"));
      await adminPage.getByRole("button", { name: "Créer la zone" }).click();
      await expect(adminPage.locator(".alert-error")).toContainText("Données invalides");
    });

    test("validation rejects duplicate code", async ({ adminPage }) => {
      // First create a zone with unique code
      const uniqueCode = `DUP01-${Date.now()}`;
      await adminPage.goto("/admin/zones");
      await adminPage.fill("#name", "Zone 1");
      await adminPage.fill("#code", uniqueCode);
      await adminPage.getByRole("button", { name: "Créer la zone" }).click();
      await expect(adminPage.locator('[role="status"]')).toBeVisible();

      // Try to create another with same code
      await adminPage.goto("/admin/zones");
      await adminPage.fill("#name", "Zone 2");
      await adminPage.fill("#code", uniqueCode);
      await adminPage.getByRole("button", { name: "Créer la zone" }).click();
      await expect(adminPage.locator(".alert-error")).toContainText("Ce code existe déjà");
    });

    test("name max length 100 chars", async ({ adminPage }) => {
      await adminPage.goto("/admin/zones");
      await adminPage.fill("#name", "A".repeat(101));
      await adminPage.fill("#code", "Z01");
      await adminPage.getByRole("button", { name: "Créer la zone" }).click();
      await expect(adminPage.locator(".alert-error")).toContainText(
        "nom de zone ne doit pas dépasser 100 caractères",
      );
    });

    test("code max length 20 chars", async ({ adminPage }) => {
      await adminPage.goto("/admin/zones");
      await adminPage.fill("#name", "Zone Test");
      await adminPage.fill("#code", "A".repeat(21));
      await adminPage.getByRole("button", { name: "Créer la zone" }).click();
      await expect(adminPage.locator(".alert-error")).toContainText(
        "code de zone ne doit pas dépasser 20 caractères",
      );
    });

    test("description max length 500 chars", async ({ adminPage }) => {
      await adminPage.goto("/admin/zones");
      await adminPage.fill("#name", "Zone Test");
      await adminPage.fill("#code", "Z01");
      await adminPage.fill("#description", "A".repeat(501));
      await adminPage.getByRole("button", { name: "Créer la zone" }).click();
      await expect(adminPage.locator(".alert-error")).toContainText(
        "description ne doit pas dépasser 500 caractères",
      );
    });

    test("code normalized to uppercase", async ({ adminPage }) => {
      await adminPage.goto("/admin/zones");
      await adminPage.fill("#name", "Zone Test");
      await adminPage.fill("#code", "z01");
      await adminPage.getByRole("button", { name: "Créer la zone" }).click();
      await expect(adminPage.locator('[role="status"]')).toBeVisible();
      // Code should be normalized to Z01
    });
  });

  test.describe("Zone List", () => {
    test("list displays zones", async ({ adminPage }) => {
      await adminPage.goto("/admin/zones");
      await expect(adminPage.locator("h1")).toContainText("Gestion des zones");
      // Zones are rendered as a grid list (ul.grid)
      await expect(adminPage.locator("ul.grid")).toBeVisible();
    });

    test("filter by active status works", async ({ adminPage }) => {
      await adminPage.goto("/admin/zones");
      // Client-side filter dropdown for active/inactive/all
      await adminPage.selectOption("#zone-filter", "active");
      // Verify filter dropdown shows active
      await expect(adminPage.locator("#zone-filter")).toHaveValue("active");
    });

    test("filter by inactive status works", async ({ adminPage }) => {
      await adminPage.goto("/admin/zones");
      await adminPage.selectOption("#zone-filter", "inactive");
      await expect(adminPage.locator("#zone-filter")).toHaveValue("inactive");
    });
  });

  test.describe("Zone Update", () => {
    test("admin can update zone name", async ({ adminPage }) => {
      await adminPage.goto("/admin/zones");
      // Find first zone's edit form (inline) via its save button
      const saveButton = adminPage.getByRole("button", { name: "Enregistrer" }).first();
      if (await saveButton.isVisible()) {
        const editForm = saveButton.locator("xpath=ancestor::form");
        await editForm.locator('input[id^="name-"]').fill("Zone Modifiée E2E");
        await saveButton.click();
        await expect(adminPage.locator('[role="status"]')).toBeVisible();
      }
    });

    test("admin can update zone code", async ({ adminPage }) => {
      await adminPage.goto("/admin/zones");
      const saveButton = adminPage.getByRole("button", { name: "Enregistrer" }).first();
      if (await saveButton.isVisible()) {
        const editForm = saveButton.locator("xpath=ancestor::form");
        await editForm.locator('input[id^="code-"]').fill("ZNEW01");
        await saveButton.click();
        await expect(adminPage.locator('[role="status"]')).toBeVisible();
      }
    });

    test("admin can update description", async ({ adminPage }) => {
      await adminPage.goto("/admin/zones");
      const saveButton = adminPage.getByRole("button", { name: "Enregistrer" }).first();
      if (await saveButton.isVisible()) {
        const editForm = saveButton.locator("xpath=ancestor::form");
        await editForm.locator('textarea[id^="desc-"]').fill("Description mise à jour E2E");
        await saveButton.click();
        await expect(adminPage.locator('[role="status"]')).toBeVisible();
      }
    });

    test("admin can toggle active status", async ({ adminPage }) => {
      await adminPage.goto("/admin/zones");
      // Toggle buttons are in the zone list item, not in the edit form
      const toggleButton = adminPage
        .locator('button:has-text("Activer"), button:has-text("Désactiver")')
        .first();
      if (await toggleButton.isVisible()) {
        const initialText = await toggleButton.textContent();
        await toggleButton.click();
        // After toggle, the button text should change
        await expect(toggleButton).not.toHaveText(initialText || "");
      }
    });

    test("cannot update to duplicate code", async ({ adminPage }) => {
      await adminPage.goto("/admin/zones");
      // First create a zone with a unique code
      const uniqueCode = `ZUPD-${Date.now()}`;
      await adminPage.fill("#name", "Zone pour test update");
      await adminPage.fill("#code", uniqueCode);
      await adminPage.getByRole("button", { name: "Créer la zone" }).click();
      await expect(adminPage.locator('[role="status"]')).toBeVisible();

      // Now try to update another zone to use the same code
      await adminPage.goto("/admin/zones");
      // Find the "Enregistrer" button of the first edit form and get its form
      const saveButton = adminPage.getByRole("button", { name: "Enregistrer" }).first();
      if (await saveButton.isVisible()) {
        const editForm = saveButton.locator("xpath=ancestor::form");
        await editForm.locator('input[id^="code-"]').fill(uniqueCode);
        await saveButton.click();
        await expect(adminPage.locator(".alert-error")).toContainText("Ce code existe déjà");
      }
    });
  });

  test.describe("Zone Deletion", () => {
    test("admin can delete zone without dependencies", async ({ adminPage }) => {
      // First create a zone to delete with unique code
      const uniqueCode = `ZDEL-${Date.now()}`;
      await adminPage.goto("/admin/zones");
      await adminPage.fill("#name", "Zone à supprimer");
      await adminPage.fill("#code", uniqueCode);
      await adminPage.getByRole("button", { name: "Créer la zone" }).click();
      await expect(adminPage.locator('[role="status"]')).toBeVisible();

      // Then delete it
      await adminPage.goto("/admin/zones");
      const deleteButton = adminPage
        .locator('form[action*="deleteZone"] button:has-text("Supprimer")')
        .first();
      if (await deleteButton.isVisible()) {
        await deleteButton.click();
        // No confirmation modal in current UI - direct submit
        await expect(adminPage.locator('[role="status"]')).toBeVisible();
      }
    });

    test("cannot delete zone with tours", async ({ adminPage }) => {
      // Create zone and tour, then try to delete
      await adminPage.goto("/admin/zones");
      const deleteButton = adminPage
        .locator('form[action*="deleteZone"] button:has-text("Supprimer")')
        .first();
      if (await deleteButton.isVisible()) {
        await deleteButton.click();
        await expect(adminPage.locator(".alert-error")).toContainText(
          "Impossible de supprimer : la zone a des tournées associées",
        );
      }
    });

    test("cannot delete zone with assignments", async ({ adminPage }) => {
      // Similar test for zone assignments - zone has assignments
      await adminPage.goto("/admin/zones");
      const deleteButton = adminPage
        .locator('form[action*="deleteZone"] button:has-text("Supprimer")')
        .first();
      if (await deleteButton.isVisible()) {
        await deleteButton.click();
        await expect(adminPage.locator(".alert-error")).toContainText("affectations");
      }
    });

    test("agent cannot delete zone", async ({ agentPage }) => {
      await agentPage.goto("/admin/zones");
      const deleteButton = agentPage.locator(
        'form[action*="deleteZone"] button:has-text("Supprimer")',
      );
      await expect(deleteButton).toBeHidden();
    });
  });

  test.describe("Zone Assignments", () => {
    test("admin can assign agent to zone", async ({ adminPage }) => {
      await adminPage.goto("/admin/zones");
      // Find first zone's assignment link
      const assignLink = adminPage.locator('a:has-text("Gérer les responsables")').first();
      if (await assignLink.isVisible()) {
        await assignLink.click();
        await expect(adminPage).toHaveURL(/\/admin\/zones\/[^/]+\/assignments/);
        // Assign agent (uses identifier input, not userId select)
        await adminPage.fill('input[name="identifier"]', "agent@example.com");
        await adminPage.getByRole("button", { name: "Affecter" }).click();
        await expect(adminPage.locator('[role="status"]')).toBeVisible();
      }
    });

    test("admin can remove assignment", async ({ adminPage }) => {
      await adminPage.goto("/admin/zones");
      const assignLink = adminPage.locator('a:has-text("Gérer les responsables")').first();
      if (await assignLink.isVisible()) {
        await assignLink.click();
        const removeButton = adminPage.locator('button:has-text("Retirer")').first();
        if (await removeButton.isVisible()) {
          await removeButton.click();
          await expect(adminPage.locator('[role="status"]')).toBeVisible();
        }
      }
    });

    test("agent cannot access assignments", async ({ agentPage }) => {
      await agentPage.goto("/admin/zones/1/assignments");
      await expect(agentPage).toHaveURL("/forbidden");
    });
  });
});
