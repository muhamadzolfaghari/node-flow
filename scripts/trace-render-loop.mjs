import puppeteer from "puppeteer";

async function run() {
  const browser = await puppeteer.launch({
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });

  try {
    const page = await browser.newPage();
    await page.setViewport({ width: 1440, height: 900 });

    await page.evaluateOnNewDocument(() => {
      const origError = console.error;
      console.error = function(...args) {
        const stack = new Error().stack;
        origError.apply(console, [...args, "\nCALLER_STACK:\n" + stack]);
      };
      window.addEventListener('error', (e) => {
        console.log('WINDOW_ERROR_STACK:\n' + (e.error ? e.error.stack : e.message));
      });
    });

    page.on("console", async (msg) => {
      try {
        const text = msg.text();
        const args = [];
        for (const arg of msg.args()) {
          try {
            const val = await arg.jsonValue();
            args.push(typeof val === 'string' ? val : JSON.stringify(val));
          } catch {
            args.push(arg.toString());
          }
        }
        if (text.includes("Maximum update depth")) {
          const recent = await page.evaluate(() => {
            const counts = {};
            for (const item of (window.__recentSetStates || [])) {
              counts[item.caller] = (counts[item.caller] || 0) + 1;
            }
            return counts;
          });
          console.log("FREQUENT SETSTATES SUMMARY:\n", JSON.stringify(recent, null, 2));
        }
        console.log(`[CONSOLE ${msg.type().toUpperCase()}] ${text}\nARGS: ${args.join('\n---\n')}`);
      } catch (e) {
        console.log("CONSOLE MSG:", msg.text());
      }
    });

    await page.goto("http://localhost:5173/#/studio", { waitUntil: "networkidle2" });
    await page.waitForSelector(".cm-content");
    await page.click(".cm-content");

    console.log("Typing into editor...");
    await page.keyboard.press("End");
    await page.keyboard.press("Enter");
    await page.keyboard.type("A --> B\n", { delay: 10 });
    await new Promise((r) => setTimeout(r, 2000));
  } finally {
    await browser.close();
  }
}

run().catch((e) => console.error(e));
