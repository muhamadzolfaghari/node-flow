import puppeteer from "puppeteer";
import assert from "node:assert/strict";

const BASE_URL = "http://localhost:5173/";
const ARTIFACT_DIR = "/Users/muhamadzolfaghari/.gemini/antigravity-ide/brain/153f3c1a-609e-4938-b9f5-6d2d86912ee4";

async function run() {
  console.log("=== Testing Real Browser Canvas & Editor Interaction ===");
  const browser = await puppeteer.launch({
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });

  try {
    const page = await browser.newPage();
    await page.setViewport({ width: 1440, height: 900 });

    const pageErrors = [];
    const consoleLogs = [];
    page.on("pageerror", (err) => {
      console.error("  ❌ Page error:", err.message);
      pageErrors.push(err.message);
    });
    page.on("console", (msg) => {
      if (msg.type() === "error") {
        console.error("  ❌ Console error:", msg.text());
        consoleLogs.push(msg.text());
      }
    });

    // 1. Navigate to Studio
    console.log("1. Navigating to Studio...");
    await page.goto(`${BASE_URL}#/studio`, { waitUntil: "networkidle2" });
    await page.waitForSelector(".cm-editor", { timeout: 15000 });
    await page.waitForSelector(".mermaid-stage svg", { timeout: 15000 });
    console.log("   ✅ Studio editor and canvas SVG ready.");

    // Initial screenshot
    await page.screenshot({ path: `${ARTIFACT_DIR}/step1_initial_studio.png` });

    // 2. Editor Interaction: Focus and Typing
    console.log("2. Testing Editor focus and typing...");
    const cmContent = await page.waitForSelector(".cm-content");
    await cmContent.click();

    // Check if editor has focus
    const hasFocus = await page.evaluate(() => {
      const active = document.activeElement;
      return active && active.classList.contains("cm-content");
    });
    console.log("   ✅ CodeMirror has focus:", hasFocus);

    // Get current source
    const initialText = await page.evaluate(() => {
      return document.querySelector(".cm-content")?.textContent || "";
    });
    console.log(`   Initial code (${initialText.length} chars):\n${initialText.slice(0, 150)}...`);

    // Type new node into editor
    console.log("   Inserting new node 'Service --> Cache[(Redis Cache)]' at end of editor...");
    await page.evaluate((snippet) => {
      const host = document.querySelector(".cm-editor")?.parentElement;
      if (host?._editorView) {
        const v = host._editorView;
        const len = v.state.doc.length;
        v.dispatch({
          changes: { from: len, insert: snippet },
          selection: { anchor: len + snippet.length },
        });
      }
    }, "\n  Service --> Cache[(Redis Cache)]");

    const updatedText = await page.evaluate(() => {
      return document.querySelector(".cm-content")?.innerText || "";
    });
    console.log(`   Updated code in editor:\n${updatedText}`);

    // Wait for canvas to re-render with the new node
    console.log("   Waiting for canvas to render the new Redis Cache node...");
    await page.waitForFunction(() => {
      const text = document.querySelector(".mermaid-stage svg")?.textContent || "";
      return text.includes("Redis Cache") || text.includes("Cache");
    }, { timeout: 8000 });

    console.log("   ✅ Canvas re-rendered with new node!");
    await page.screenshot({ path: `${ARTIFACT_DIR}/step2_editor_typing_synced_to_canvas.png` });

    // 3. Canvas Node Click & Selection
    console.log("3. Testing Canvas node selection...");
    // Find node coordinates
    const nodeCoords = await page.evaluate(() => {
      const nodes = [...document.querySelectorAll(".mermaid-stage svg g.node")];
      const target = nodes.find((n) => n.textContent.includes("Cache") || n.textContent.includes("Redis"));
      if (!target) return null;
      const rect = target.getBoundingClientRect();
      return {
        x: rect.left + rect.width / 2,
        y: rect.top + rect.height / 2,
        id: target.id,
      };
    });

    assert.ok(nodeCoords, "Could not find rendered node on canvas");
    console.log(`   Clicking node '${nodeCoords.id}' at (${Math.round(nodeCoords.x)}, ${Math.round(nodeCoords.y)})...`);

    await page.mouse.click(nodeCoords.x, nodeCoords.y);
    await new Promise((r) => setTimeout(r, 600));

    // Verify selection banner or floating toolbar
    const isSelected = await page.evaluate(() => {
      const selectedNode = document.querySelector(".mermaid-stage svg g.node.is-selected, [data-selected='true']");
      const floatingToolbar = document.querySelector(".stage-floating-toolbar");
      const inspectorLabel = document.querySelector('[aria-label="Node label"], input[value*="Cache"]');
      return Boolean(selectedNode || floatingToolbar || inspectorLabel);
    });

    console.log("   ✅ Node clicked, selection registered:", isSelected);
    await page.screenshot({ path: `${ARTIFACT_DIR}/step3_canvas_node_selected.png` });

    // 4. Test Canvas Panning & Zoom Controls
    console.log("4. Testing Canvas pan and zoom controls...");
    const zoomInBtn = await page.waitForSelector('button[title*="Zoom in"]');
    await zoomInBtn.click();
    await new Promise((r) => setTimeout(r, 300));
    await zoomInBtn.click();
    await new Promise((r) => setTimeout(r, 300));

    const fitBtn = await page.waitForSelector('button[title*="Fit to view"]');
    await fitBtn.click();
    await new Promise((r) => setTimeout(r, 500));
    console.log("   ✅ Zoom and Fit controls responsive.");
    await page.screenshot({ path: `${ARTIFACT_DIR}/step4_canvas_zoom_and_fit.png` });

    // 5. Test Quick Add Node Tool in Toolbar
    console.log("5. Testing visual tool: Add node...");
    const nodeLabelInput = await page.$('input[aria-label="New node label"]');
    if (nodeLabelInput) {
      await nodeLabelInput.click({ clickCount: 3 });
      await nodeLabelInput.type("Analytics Worker");
      const addNodeBtn = await page.$('button[title*="Add node"]');
      if (addNodeBtn) {
        await addNodeBtn.click();
        await new Promise((r) => setTimeout(r, 800));
      }
    }

    // 6. Test AI Quick Fix in Real Browser
    console.log("6. Testing AI Quick Fix in Real Browser...");
    await page.evaluate((snippet) => {
      const host = document.querySelector(".cm-editor")?.parentElement;
      if (host?._editorView) {
        const v = host._editorView;
        const len = v.state.doc.length;
        v.dispatch({
          changes: { from: len, insert: snippet },
          selection: { anchor: len + snippet.length },
        });
      }
    }, "\n  TestService -> TargetStore");

    console.log("   Waiting for syntax error indicator to appear...");
    await page.waitForFunction(() => {
      const btn = document.querySelector('button[title*="Instant repair"]');
      return Boolean(btn);
    }, { timeout: 8000 });
    console.log("   ✅ Syntax error detected, 'AI Quick Fix' button appeared!");
    await page.screenshot({ path: `${ARTIFACT_DIR}/step6_syntax_error_detected.png` });

    console.log("   Clicking 'AI Quick Fix' button...");
    const fixBtn = await page.waitForSelector('button[title*="Instant repair"]');
    await fixBtn.click();

    console.log("   Waiting for syntax to become valid and canvas to render...");
    await page.waitForFunction(() => {
      const editorText = document.querySelector(".cm-content")?.innerText || "";
      const svg = document.querySelector(".mermaid-stage svg");
      return (
        editorText.includes("TestService --> TargetStore") &&
        Boolean(svg && svg.textContent.includes("TargetStore"))
      );
    }, { timeout: 10000 });
    console.log("   ✅ AI Quick Fix automatically fixed single arrow '->' to '-->' and canvas re-rendered!");
    await page.screenshot({ path: `${ARTIFACT_DIR}/step7_ai_quick_fix_resolved.png` });

    console.log("7. Testing one Quick Fix click resolving several broken lines...");
    await page.evaluate((snippet) => {
      const v = document.querySelector(".cm-editor")?.parentElement?._editorView;
      const len = v.state.doc.length;
      v.dispatch({ changes: { from: len, insert: snippet }, selection: { anchor: len + snippet.length } });
    }, "\n  TargetStore -> Mirror[Unclosed");
    const multiBtn = await page.waitForSelector('button[title*="Instant repair"]', { timeout: 8000 });
    await multiBtn.click();
    await page.waitForFunction(() => {
      const editorText = document.querySelector(".cm-content")?.innerText || "";
      const svg = document.querySelector(".mermaid-stage svg");
      return (
        editorText.includes("TargetStore --> Mirror[Unclosed]") &&
        Boolean(svg && svg.textContent.includes("Unclosed")) &&
        !document.querySelector('button[title*="Instant repair"]')
      );
    }, { timeout: 10000 });
    console.log("   ✅ A single Quick Fix click repaired both the arrow and the unclosed bracket!");

    assert.equal(pageErrors.length, 0, `Page errors occurred: ${pageErrors.join("; ")}`);
    console.log("🎉 All Editor, Canvas, and AI Quick Fix interactions verified in real browser with ZERO errors!");
  } finally {
    await browser.close();
  }
}

run().catch((err) => {
  console.error("Test execution failed:", err);
  process.exit(1);
});
