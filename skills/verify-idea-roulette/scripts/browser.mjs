// browser.mjs — Playwright (playwright-core + system Chrome) journeys for Idea Roulette.
// Usage (via appctl): node browser.mjs spin-to-tasklist
import { createRequire } from "node:module";
import { readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
const require = createRequire(path.join(process.env.NODE_PATH, "x.js"));
const { chromium } = require("playwright-core");

const URL = process.env.APP_URL, OUT = process.env.EVIDENCE_DIR, journey = process.argv[2];
const browser = await chromium.launch({ executablePath: process.env.CHROME_PATH, headless: true });
const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 } });
await ctx.grantPermissions(["clipboard-read", "clipboard-write"], { origin: new globalThis.URL(URL).origin });
const page = await ctx.newPage();
const consoleErrors = [], trpc = [], external = [];
page.on("console", m => { if (m.type() === "error") consoleErrors.push(m.text()); });
page.on("response", r => { if (r.url().includes("/api/trpc/")) trpc.push({ url: r.url().replace(URL, "/"), status: r.status() }); });
page.on("request", r => { const u = new globalThis.URL(r.url()); if (!["127.0.0.1", "localhost"].includes(u.hostname) && !u.protocol.startsWith("data")) external.push(r.url()); });
const save = async (name) => {
  await page.screenshot({ path: path.join(OUT, `${name}.png`), fullPage: true });
  writeFileSync(path.join(OUT, `${name}.aria.txt`), await page.locator("main").ariaSnapshot());
};
const result = { journey, url: URL, steps: [] };
let pass = false;
try {
  if (journey !== "spin-to-tasklist") throw new Error("unknown journey");
  await page.goto(URL, { waitUntil: "networkidle" });
  await page.getByRole("heading", { name: "AI Task-List Creator" }).waitFor();
  await save("01-idle");
  const t0 = Date.now();
  await page.getByRole("button", { name: "Pick a Random Startup Idea" }).click();
  await page.getByRole("button", { name: /Spinning/ }).waitFor({ timeout: 5000 });
  await save("02-spinning");
  await page.getByRole("button", { name: "Create AI Agent Tasklist" }).waitFor({ timeout: 20000 });
  const spinMs = Date.now() - t0;
  const title = (await page.locator("main h1").nth(1).textContent()).trim();
  result.steps.push({ step: "spin", spinMs, chosenTitle: title });
  await save("03-chosen");
  await page.getByRole("button", { name: "View one pager" }).click();
  await page.getByRole("button", { name: "Hide one pager" }).waitFor();
  result.steps.push({ step: "one-pager-expanded", ok: true });
  await page.getByRole("button", { name: "Create AI Agent Tasklist" }).click();
  await page.getByRole("heading", { name: "AI Agent Tasklist" }).waitFor({ timeout: 30000 });
  await page.getByRole("button", { name: "Generate again" }).waitFor();
  // The tasklist panel is the aria-live section that follows the "AI Agent Tasklist" heading (Spinner also uses aria-live).
  const panelText = await page.locator("section[aria-live='polite']").filter({ hasText: /\S{20,}/ }).last().innerText();
  const cache = JSON.parse(readFileSync(process.env.CACHE_FILE, "utf8"));
  const cached = cache[title.toLowerCase()] ?? "";
  const firstCachedLine = cached.split("\n").map(l => l.replace(/^[#*\-\s\[\]x]+/, "").replace(/[*`_]/g, "").trim()).find(l => l.length > 8) ?? "";
  result.steps.push({ step: "tasklist", panelChars: panelText.length, cacheHasTitle: !!cached, firstCachedLine, panelContainsFirstCachedLine: panelText.includes(firstCachedLine) });
  await save("04-tasklist-ready");
  await page.getByRole("button", { name: "Copy" }).click();
  await page.waitForTimeout(500);
  const clip = await page.evaluate(() => navigator.clipboard.readText());
  result.steps.push({ step: "copy", clipboardEqualsCache: clip === cached, clipboardChars: clip.length });
  await save("05-copied");
  pass = !!cached && result.steps[2].panelContainsFirstCachedLine && clip === cached && external.every(u => /^https:\/\/fonts\.(googleapis|gstatic)\.com\//.test(u));
} catch (e) { result.error = String(e); await save("99-failure").catch(() => {}); }
Object.assign(result, { trpc, externalRequests: external, consoleErrors, pass });
writeFileSync(path.join(OUT, "result.json"), JSON.stringify(result, null, 2));
console.log(JSON.stringify(result, null, 2));
await browser.close();
process.exit(pass ? 0 : 1);
