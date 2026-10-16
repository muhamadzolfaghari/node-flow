import puppeteer from "puppeteer";
import assert from "node:assert/strict";

const BASE_URL = "http://localhost:5173/";
const ARTIFACT_DIR = "/Users/muhamadzolfaghari/.gemini/antigravity-ide/brain/153f3c1a-609e-4938-b9f5-6d2d86912ee4";

async function run() {
  console.log(`Connecting to ${BASE_URL} via Puppeteer…`);
  const browser = await puppeteer.launch({
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });

  try {
    const page = await browser.newPage();
    await page.setViewport({ width: 1440, height: 900 });

    const errors = [];
    page.on("pageerror", (err) => errors.push(err.message));

    // 1. Studio Canvas Verification
    console.log("1. Testing Studio Canvas loading…");
    await page.goto(`${BASE_URL}#/studio`, { waitUntil: "networkidle2" });
    await page.waitForSelector(".cm-editor", { timeout: 15000 });
    await page.waitForSelector(".mermaid-stage", { timeout: 15000 });
    console.log("   ✅ Studio canvas loaded.");

    // Helper to click elements by text
    const clickText = async (text) => {
      await page.evaluate((targetText) => {
        const elements = [...document.querySelectorAll("button, [role='menuitem'], a")];
        const match = elements.find((el) => el.textContent.trim().includes(targetText) && el.getClientRects().length > 0);
        if (!match) throw new Error(`Could not find clickable element with text: ${targetText}`);
        match.click();
      }, text);
      await new Promise((r) => setTimeout(r, 400));
    };

    // 2. Open Diagram Assistant Dialog via Tools menu
    console.log("2. Opening Diagram Assistant modal via Tools menu…");
    await clickText("Tools");
    await clickText("Diagram assistant");

    await page.waitForSelector('textarea[aria-label="Diagram description"]', { timeout: 8000 });
    console.log("   ✅ Diagram Assistant modal opened.");

    // 3. Test AI Token Optimizer in action
    console.log("3. Testing AI Token Optimizer live metrics…");
    const textarea = await page.$('textarea[aria-label="Diagram description"]');
    await textarea.type("Microservices system with API gateway and Redis cache store", { delay: 10 });

    // Wait for the token optimizer badge
    await page.waitForFunction(() => {
      return document.body.textContent.includes("Tokens: ~") &&
             document.body.textContent.includes("Resilient fallback ready");
    }, { timeout: 6000 });

    const tokenText = await page.evaluate(() => {
      const el = [...document.querySelectorAll("div")].find(
        (d) => d.textContent.includes("Tokens: ~") && d.textContent.includes("Resilient fallback ready")
      );
      return el ? el.textContent.trim() : "";
    });
    console.log(`   ✅ AI Token Optimizer active: "${tokenText}"`);

    // Screenshot of AI Assistant modal
    await page.screenshot({ path: `${ARTIFACT_DIR}/ai-assistant-token-optimizer.png` });
    console.log("   📸 Saved AI Assistant modal screenshot.");

    // Close assistant modal
    await page.keyboard.press("Escape");
    await new Promise((r) => setTimeout(r, 400));

    // 4. Test Changelog Page
    console.log("4. Navigating to /changelog…");
    await page.goto(`${BASE_URL}#/changelog`, { waitUntil: "networkidle2" });
    await page.waitForSelector("h1", { timeout: 10000 });

    const headingText = await page.$eval("h1", (el) => el.textContent.trim());
    console.log(`   ✅ Changelog loaded with heading: "${headingText}"`);

    // Test filter pills
    const filterPills = await page.$$eval("button", (buttons) =>
      buttons
        .filter((b) => ["All", "Major", "Minor", "Patch"].includes(b.textContent.trim()))
        .map((b) => b.textContent.trim())
    );
    console.log(`   ✅ Filter pills discovered: ${filterPills.join(", ")}`);

    // Click 'Minor' filter
    await clickText("Minor");
    console.log("   ✅ Filtered by Minor releases.");

    // Screenshot of Changelog
    await page.screenshot({ path: `${ARTIFACT_DIR}/changelog-verified.png` });
    console.log("   📸 Saved Changelog page screenshot.");

    assert.equal(errors.length, 0, `Page errors encountered: ${errors.join(", ")}`);
    console.log("🎉 All browser verifications passed with ZERO console/page errors!");
  } finally {
    await browser.close();
  }
}

run().catch((err) => {
  console.error("Browser verification failed:", err);
  process.exit(1);
});
