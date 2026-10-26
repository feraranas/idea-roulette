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
// panel-actions: one-pager collapse, Regenerate, Pick another idea, reduced-motion spin,
// the real server error path (request rewritten to an uncached title; no key, so nothing is written),
// Retry generation / Pick new idea, and the /auth/signin page (rendered only, never submitted).
const UNCACHED = "Verify Uncached Idea Do Not Generate";
async function spinAndLand(p, timeout = 20000) {
  const t0 = Date.now();
  await p.getByRole("button", { name: "Pick a Random Startup Idea" }).click();
  await p.getByRole("button", { name: "Create AI Agent Tasklist" }).waitFor({ timeout });
  return { spinMs: Date.now() - t0, title: (await p.locator("main h1").nth(1).textContent()).trim() };
}
const generateCount = () => trpc.filter(t => t.url.includes("tasklist.generate")).length;
async function panelActions() {
  const ok = {};
  await page.goto(URL, { waitUntil: "networkidle" });
  const s1 = await spinAndLand(page);
  await page.getByRole("button", { name: "View one pager" }).click();
  await page.getByRole("button", { name: "Hide one pager" }).click();
  await page.getByRole("button", { name: "View one pager" }).waitFor();
  ok.onePagerCollapse = (await page.getByRole("button", { name: "View one pager" }).getAttribute("aria-expanded")) === "false";
  await page.getByRole("button", { name: "Create AI Agent Tasklist" }).click();
  await page.getByRole("heading", { name: "AI Agent Tasklist" }).waitFor({ timeout: 30000 });
  const panel = () => page.locator("section[aria-live='polite']").filter({ hasText: /\S{20,}/ }).last().innerText();
  const before = await panel(), n0 = generateCount();
  await page.getByRole("button", { name: "Regenerate", exact: true }).click();
  await page.getByRole("button", { name: "Generate again" }).waitFor({ timeout: 30000 });
  await page.waitForTimeout(500);
  ok.regenerate = generateCount() === n0 + 1 && trpc.at(-1).status === 200 && (await panel()) === before;
  const n1 = generateCount();
  await page.getByRole("button", { name: "Generate again" }).click();
  await page.getByRole("button", { name: "Generate again" }).waitFor({ timeout: 30000 });
  await page.waitForTimeout(500);
  ok.generateAgain = generateCount() === n1 + 1 && (await panel()) === before;
  await save("10-regenerated");
  await page.getByRole("button", { name: "Pick another idea" }).click();
  await page.getByRole("button", { name: "Pick a Random Startup Idea" }).waitFor();
  ok.reset = (await page.getByRole("heading", { name: "AI Agent Tasklist" }).count()) === 0 && (await page.locator("main h1").count()) === 1;
  await save("11-reset");
  result.steps.push({ step: "panel", chosenTitle: s1.title, ...ok });

  // Reduced motion: fresh context, spin must land in <= ~0.8 s + overhead.
  const rctx = await browser.newContext({ viewport: { width: 1280, height: 900 }, reducedMotion: "reduce" });
  const rp = await rctx.newPage();
  await rp.goto(URL, { waitUntil: "networkidle" });
  const rs = await spinAndLand(rp, 5000);
  await rctx.close();
  ok.reducedMotion = rs.spinMs < 2000;
  result.steps.push({ step: "reduced-motion-spin", ok: ok.reducedMotion, spinMs: rs.spinMs, chosenTitle: rs.title });

  // Error path against the real server: rewrite the generate request's title to one not in cache.json.
  await page.route("**/api/trpc/tasklist.generate**", async (route) => {
    const body = JSON.parse(route.request().postData() || "{}");
    for (const k of Object.keys(body)) { const v = body[k].json ?? body[k]; v.title = UNCACHED; }
    await route.continue({ postData: JSON.stringify(body) });
  });
  const s2 = await spinAndLand(page);
  await page.getByRole("button", { name: "Create AI Agent Tasklist" }).click();
  await page.getByRole("heading", { name: "Something went wrong" }).waitFor({ timeout: 30000 });
  const errResp = trpc.filter(t => t.url.includes("tasklist.generate")).at(-1);
  ok.errorCard = errResp.status === 500 && (await page.getByRole("button", { name: "Retry generation" }).count()) === 1;
  const primaryLabelInError = (await page.locator("main section button").first().innerText()).trim();
  await save("12-error");
  const n2 = generateCount();
  await page.getByRole("button", { name: "Retry generation" }).click();
  await page.getByRole("heading", { name: "Something went wrong" }).waitFor({ timeout: 30000 });
  await page.waitForTimeout(500);
  ok.retry = generateCount() === n2 + 1;
  // Known product quirk (reported, not asserted as correct): in the error state the primary button is
  // labelled "Pick a Random Startup Idea" but its click re-runs generate instead of spinning.
  const n3 = generateCount();
  await page.locator("main section button").first().click();
  await page.getByRole("heading", { name: "Something went wrong" }).waitFor({ timeout: 30000 });
  await page.waitForTimeout(500);
  const primaryClickInErrorRanGenerate = generateCount() === n3 + 1;
  await page.unroute("**/api/trpc/tasklist.generate**");
  await page.getByRole("button", { name: "Pick new idea" }).click();
  await page.getByRole("button", { name: "Pick a Random Startup Idea" }).waitFor();
  ok.pickNewIdea = (await page.getByRole("heading", { name: "Something went wrong" }).count()) === 0;
  result.steps.push({ step: "error-path", chosenTitle: s2.title, rewrittenTitle: UNCACHED, generateStatus: errResp.status, primaryLabelInError, primaryClickInErrorRanGenerate,
    errorCard: ok.errorCard, retry: ok.retry, pickNewIdea: ok.pickNewIdea });

  // Sign-in page renders (never submitted: submit needs Postgres + SMTP and sends email).
  await page.goto(URL + "auth/signin", { waitUntil: "networkidle" });
  await page.getByRole("heading", { name: "Welcome" }).waitFor();
  ok.signinPage = (await page.getByLabel("Email address").count()) === 1;
  await page.screenshot({ path: path.join(OUT, "13-signin.png"), fullPage: true });
  writeFileSync(path.join(OUT, "13-signin.aria.txt"), await page.locator("body").ariaSnapshot());
  result.steps.push({ step: "signin-page", ok: ok.signinPage });
  result.checks = ok;
  return Object.values(ok).every(Boolean) && external.every(u => /^https:\/\/fonts\.(googleapis|gstatic)\.com\//.test(u));
}
const result = { journey, url: URL, steps: [] };
let pass = false;
try {
  if (journey === "panel-actions") { pass = await panelActions(); }
  else if (journey !== "spin-to-tasklist") throw new Error("unknown journey (spin-to-tasklist | panel-actions)");
  else {
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
  }
} catch (e) { result.error = String(e); await save("99-failure").catch(() => {}); }
Object.assign(result, { trpc, externalRequests: external, consoleErrors, pass });
writeFileSync(path.join(OUT, "result.json"), JSON.stringify(result, null, 2));
console.log(JSON.stringify(result, null, 2));
await browser.close();
process.exit(pass ? 0 : 1);
