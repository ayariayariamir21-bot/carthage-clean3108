export default async function globalSetup() {
  const baseURL = process.env.E2E_BASE_URL || "http://localhost:3000";
  // Wait for webServer to be ready
  const maxAttempts = 30;
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      const res = await fetch(`${baseURL}/api/test/reset`, { method: "POST" });
      if (res.ok) {
        console.log(`globalSetup: DB reset ok on attempt ${attempt}`);
        return;
      }
      const text = await res.text();
      console.log(`globalSetup attempt ${attempt} failed ${res.status} ${text}`);
    } catch (err) {
      console.log(`globalSetup attempt ${attempt} error`, err);
    }
    await new Promise((r) => setTimeout(r, 1000));
  }
  console.warn("globalSetup: failed to reset DB after 30 attempts");
}
