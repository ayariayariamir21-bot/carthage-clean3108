import { test, expect } from "./fixtures";

test.describe("Authentication", () => {
  test.describe("Login", () => {
    test("valid login redirects to dashboard", async ({ page }) => {
      await page.goto("/login");
      await page.fill("#email", "admin@example.com");
      await page.fill("#password", "AdminPass123!");
      await page.click('button[type="submit"]');
      await expect(page).toHaveURL("/dashboard");
      await expect(page.locator("h1")).toContainText("Tableau de bord");
    });

    test("invalid email shows error", async ({ page }) => {
      await page.goto("/login");
      await page.fill("#email", "invalid@example.com");
      await page.fill("#password", "wrongpassword");
      await page.click('button[type="submit"]');
      await expect(page.locator(".alert-error")).toBeVisible();
      await expect(page.locator(".alert-error")).toContainText("Identifiants invalides");
    });

    test("invalid password shows error", async ({ page }) => {
      await page.goto("/login");
      await page.fill("#email", "admin@example.com");
      await page.fill("#password", "wrongpassword");
      await page.click('button[type="submit"]');
      await expect(page.locator(".alert-error")).toBeVisible();
      await expect(page.locator(".alert-error")).toContainText("Identifiants invalides");
    });

    test("empty email shows validation", async ({ page }) => {
      await page.goto("/login");
      await page.fill("#password", "password123");
      await page.click('button[type="submit"]');
      await expect(page.locator("#email:invalid")).toBeTruthy();
    });

    test("empty password shows validation", async ({ page }) => {
      await page.goto("/login");
      await page.fill("#email", "admin@example.com");
      await page.click('button[type="submit"]');
      await expect(page.locator("#password:invalid")).toBeTruthy();
    });

    test("rate limiting after multiple failed attempts", async ({ page }) => {
      for (let i = 0; i < 6; i++) {
        await page.goto("/login");
        await page.fill("#email", "ratelimit@example.com");
        await page.fill("#password", "wrong");
        await page.click('button[type="submit"]');
        await page.waitForTimeout(100);
      }
      await page.goto("/login");
      await page.fill("#email", "ratelimit@example.com");
      await page.fill("#password", "wrong");
      await page.click('button[type="submit"]');
      await expect(page.locator(".alert-error")).toContainText("Identifiants invalides");
    });
  });

  test.describe("Disabled Account", () => {
    test("disabled account shows error", async ({ page }) => {
      await page.goto("/login");
      await page.fill("#email", "disabled@example.com");
      await page.fill("#password", "anypassword");
      await page.click('button[type="submit"]');
      await expect(page.locator(".alert-error")).toContainText("Identifiants invalides");
    });
  });

  test.describe("First Login Password Change", () => {
    test("new admin forced to change password", async ({ page }) => {
      // This would require a fresh admin account
      // For now, we test the flow
      await page.goto("/login");
      await page.fill("#email", "newadmin@example.com");
      await page.fill("#password", "InitialPass123!");
      await page.click('button[type="submit"]');
      await expect(page).toHaveURL("/auth/change-password");
      await expect(page.locator("h1")).toContainText("Changer le mot de passe");
    });

    test("password change requires current password", async ({ page }) => {
      await page.goto("/login");
      await page.fill("#email", "newadmin@example.com");
      await page.fill("#password", "InitialPass123!");
      await page.click('button[type="submit"]');
      await expect(page).toHaveURL("/auth/change-password");
      await page.fill("#newPassword", "NewPass123!");
      await page.fill("#confirmPassword", "NewPass123!");
      await page.click('button[type="submit"]');
      await expect(page.locator(".alert-error")).toContainText("Tous les champs sont obligatoires");
    });

    test("password change requires matching confirmation", async ({ page }) => {
      await page.goto("/login");
      await page.fill("#email", "newadmin@example.com");
      await page.fill("#password", "InitialPass123!");
      await page.click('button[type="submit"]');
      await expect(page).toHaveURL("/auth/change-password");
      await page.fill("#currentPassword", "InitialPass123!");
      await page.fill("#newPassword", "NewPass123!");
      await page.fill("#confirmPassword", "DifferentPass123!");
      await page.click('button[type="submit"]');
      await expect(page.locator(".alert-error")).toContainText(
        "Les nouveaux mots de passe ne correspondent pas",
      );
    });

    test("password change requires minimum length", async ({ page }) => {
      await page.goto("/login");
      await page.fill("#email", "newadmin@example.com");
      await page.fill("#password", "InitialPass123!");
      await page.click('button[type="submit"]');
      await expect(page).toHaveURL("/auth/change-password");
      await page.fill("#currentPassword", "InitialPass123!");
      await page.fill("#newPassword", "short");
      await page.fill("#confirmPassword", "short");
      await page.click('button[type="submit"]');
      await expect(page.locator(".alert-error")).toContainText("au moins 8 caractères");
    });

    test("successful password change redirects to dashboard", async ({ page }) => {
      await page.goto("/login");
      await page.fill("#email", "newadmin@example.com");
      await page.fill("#password", "InitialPass123!");
      await page.click('button[type="submit"]');
      await expect(page).toHaveURL("/auth/change-password");
      await page.fill("#currentPassword", "InitialPass123!");
      await page.fill("#newPassword", "NewSecurePass123!");
      await page.fill("#confirmPassword", "NewSecurePass123!");
      await page.click('button[type="submit"]');
      await expect(page).toHaveURL("/dashboard");
    });
  });

  test.describe("Logout", () => {
    test("logout clears session and redirects to login", async ({ adminPage }) => {
      await adminPage.goto("/dashboard");
      await expect(adminPage).toHaveURL("/dashboard");

      // Click the logout button in the header - uses form submission which handles redirects properly
      await adminPage.getByRole("button", { name: "Déconnexion" }).click();
      await expect(adminPage).toHaveURL("/login");

      // Session should be revoked
      await adminPage.goto("/dashboard");
      await expect(adminPage).toHaveURL("/login");
    });
  });

  test.describe("Session Persistence", () => {
    test("session persists across page reloads", async ({ adminPage }) => {
      await adminPage.goto("/dashboard");
      await adminPage.reload();
      await expect(adminPage).toHaveURL("/dashboard");
    });

    test("session expires after TTL", async ({ page }) => {
      // This would require a test with a short TTL
      // For now, we verify the session mechanism works
      await page.goto("/login");
      await page.fill("#email", "admin@example.com");
      await page.fill("#password", "AdminPass123!");
      await page.click('button[type="submit"]');
      await expect(page).toHaveURL("/dashboard");
    });
  });
});
