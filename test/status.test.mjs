import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const status = JSON.parse(await readFile(new URL("../data/status.json", import.meta.url), "utf8"));
const html = await readFile(new URL("../index.html", import.meta.url), "utf8");
const app = await readFile(new URL("../app.js", import.meta.url), "utf8");
const readme = await readFile(new URL("../README.md", import.meta.url), "utf8");
const services = await readFile(new URL("../services.html", import.meta.url), "utf8");

test("benchmark matches EUR 50.21 at 2.1% for one year", () => {
  const calculated = status.benchmark.principal * status.benchmark.annualRate;
  assert.equal(Number(calculated.toFixed(5)), status.benchmark.baselineReturn);
  assert.ok(status.benchmark.targetNet > status.benchmark.baselineReturn);
});

test("founder capital is unfunded and separate from revenue", () => {
  assert.equal(status.budget.offeredCeiling, 50.21);
  assert.equal(status.budget.funded, 0);
  assert.equal(status.budget.committed, 0);
  assert.equal(status.ledger.verifiedEligibleRevenue, 0);
  assert.ok(status.ledger.operatingCosts >= 0);
});

test("current action points to two distinct funded Taskmarket opportunities", () => {
  const primary = new URL(status.nextAction.primaryCta.url);
  const secondary = new URL(status.nextAction.secondaryCta.url);
  assert.equal(primary.hostname, "taskmarket.dev");
  assert.match(primary.pathname, /^\/tasks\/0x[0-9a-f]{64}$/);
  assert.equal(secondary.hostname, "taskmarket.dev");
  assert.match(secondary.pathname, /^\/tasks\/0x[0-9a-f]{64}$/);
  assert.notEqual(primary.pathname, secondary.pathname);
});

test("bonuses, founder transfers, and interest are excluded from earnings", () => {
  const exclusions = status.earningRules.excluded.join(" ");
  assert.match(exclusions, /Founder transfers/);
  assert.match(exclusions, /Welcome bonuses/);
  assert.match(exclusions, /Savings interest/);
});

test("the published SSH credential is a public key, never a private key", () => {
  assert.match(status.infrastructure.sshPublicKey, /^ssh-ed25519 /);
  assert.match(status.infrastructure.sshFingerprint, /^SHA256:/);
  assert.doesNotMatch(JSON.stringify(status), /BEGIN (?:OPENSSH )?PRIVATE KEY/);
});

test("UpCloud cost and runway calculations match the selected plan", () => {
  const cost = status.infrastructure.cost;
  assert.equal(Number((cost.monthlyExVat * (1 + cost.assumedVatRate)).toFixed(2)), cost.monthlyIncludingAssumedVat);
  assert.equal(Number((status.budget.offeredCeiling / cost.monthlyIncludingAssumedVat).toFixed(2)), cost.runwayMonthsBeforeDomain);
  assert.equal(Number((cost.monthlyIncludingAssumedVat + status.benchmark.baselineReturn).toFixed(5)), cost.firstFullMonthGrossRevenueNeededToBeatBenchmark);
});

test("every DOM id used by the script exists in the page", () => {
  const referencedIds = [...app.matchAll(/getElementById\("([^"]+)"\)/g)].map((match) => match[1]);
  const pageIds = new Set([...html.matchAll(/\sid="([^"]+)"/g)].map((match) => match[1]));
  for (const id of referencedIds) assert.ok(pageIds.has(id), `Missing #${id}`);
});

test("recent actions have valid timestamps in newest-first order", () => {
  assert.ok(status.activity.length > 0);
  const timestamps = status.activity.map((entry) => Date.parse(entry.at));
  assert.ok(timestamps.every(Number.isFinite));
  assert.deepEqual(timestamps, [...timestamps].sort((a, b) => b - a));
  assert.match(html, /<time class="updated"/);
});

test("README begins with the required AI disclosure", () => {
  assert.match(readme.split("\n", 1)[0], /AI disclosure.*Codex.*AI agent/i);
});

test("service offer is explicit about price, network, disclosure, and payment timing", () => {
  assert.match(services, /Codex, an AI agent under private human oversight/);
  assert.match(services, /5 USDC/);
  assert.match(services, /on Base/);
  assert.match(services, /Do not send tokens before scope confirmation/);
  assert.match(services, /not legal, financial, tax, or investment advice/);
});
