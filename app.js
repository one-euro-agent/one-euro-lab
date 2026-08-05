const money = new Intl.NumberFormat("en-NL", {
  style: "currency",
  currency: "EUR",
  minimumFractionDigits: 2,
  maximumFractionDigits: 5,
});

const shortMoney = new Intl.NumberFormat("en-NL", {
  style: "currency",
  currency: "EUR",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

const date = new Intl.DateTimeFormat("en-GB", {
  day: "numeric",
  month: "short",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
  hourCycle: "h23",
  timeZone: "UTC",
});

function formatTimestamp(value) {
  return `${date.format(new Date(value))} UTC`;
}

function externalLink(anchor, link) {
  anchor.href = link.url;
  anchor.textContent = link.label;
  if (!link.url.startsWith("#")) {
    anchor.target = "_blank";
    anchor.rel = "noopener noreferrer";
  }
}

function setText(id, value) {
  document.getElementById(id).textContent = value;
}

function renderStatus(data) {
  const descriptions = {
    waiting_on_owner: ["Waiting on private approval", "The next step creates a financial account and makes public marketplace submissions. No agent action is being hidden."],
    waiting_on_infrastructure: ["Waiting on infrastructure", "The dedicated SSH key is ready. The private operator needs to create the isolated VPS before Codex can operate continuously."],
    agent_working: ["Codex is working", "The current task can proceed without owner input."],
    awaiting_payment: ["Awaiting payment", "The qualifying work is complete; proceeds are not counted until verified."],
    target_beaten: ["Benchmark beaten", "Verified net proceeds exceed the one-year savings baseline."],
  };
  const [label, description] = descriptions[data.status] || ["Status unknown", "Review the public ledger for details."];
  setText("status-label", label);
  setText("status-description", description);
  const updated = document.getElementById("updated");
  updated.dateTime = data.updatedAt;
  updated.textContent = `Verified ${formatTimestamp(data.updatedAt)}`;
}

function renderMetrics(data) {
  const net = data.ledger.verifiedEligibleRevenue - data.ledger.operatingCosts;
  const target = data.benchmark.targetNet;
  const percent = target > 0 ? Math.max(0, Math.min(100, (net / target) * 100)) : 0;
  const remaining = Math.max(0, target - net);

  setText("net-result", shortMoney.format(net));
  setText("net-caption", net > 0 ? `${shortMoney.format(data.ledger.verifiedEligibleRevenue)} eligible revenue minus ${shortMoney.format(data.ledger.operatingCosts)} costs` : "No eligible proceeds verified yet");
  setText("target-result", shortMoney.format(target));
  setText("target-caption", `One-year baseline: ${money.format(data.benchmark.baselineReturn)}`);
  setText("founder-budget", shortMoney.format(data.budget.offeredCeiling));
  setText("budget-caption", `${shortMoney.format(data.budget.funded)} funded; ${shortMoney.format(data.budget.committed)} committed`);
  setText("progress-percent", `${percent.toFixed(percent > 0 && percent < 10 ? 1 : 0)}%`);
  setText("progress-note", remaining > 0 ? `${shortMoney.format(remaining)} remains before the benchmark is beaten.` : `Target beaten by ${shortMoney.format(net - data.benchmark.baselineReturn)}.`);

  const track = document.getElementById("progress-track");
  track.setAttribute("aria-valuenow", String(Math.round(percent)));
  document.getElementById("progress-fill").style.width = `${percent}%`;
}

function renderAction(action) {
  setText("action-eyebrow", action.eyebrow);
  setText("action-title", action.title);
  setText("action-summary", action.summary);

  const steps = document.getElementById("action-steps");
  action.steps.forEach((step) => {
    const item = document.createElement("li");
    const title = document.createElement("strong");
    const detail = document.createElement("p");
    title.textContent = step.title;
    detail.textContent = step.detail;
    item.append(title, detail);
    steps.append(item);
  });

  externalLink(document.getElementById("primary-cta"), action.primaryCta);
  externalLink(document.getElementById("secondary-cta"), action.secondaryCta);

  const copy = document.getElementById("copy-message");
  copy.addEventListener("click", async () => {
    try {
      await navigator.clipboard.writeText(action.copyMessage);
      copy.textContent = "Copied — return to Codex";
    } catch {
      copy.textContent = `Send: ${action.copyMessage}`;
    }
  });
}

function renderEarningRules(rules) {
  setText("earning-rules-title", rules.title);
  const counts = document.getElementById("earning-counts");
  rules.counts.forEach((rule) => {
    const item = document.createElement("li");
    item.textContent = rule;
    counts.append(item);
  });

  const excluded = document.getElementById("earning-excluded");
  rules.excluded.forEach((rule) => {
    const item = document.createElement("li");
    item.textContent = rule;
    excluded.append(item);
  });
}

function renderActivity(entries) {
  const activity = document.getElementById("activity");
  entries.forEach((entry) => {
    const item = document.createElement("li");
    const timestamp = document.createElement("time");
    const copy = document.createElement("div");
    const title = document.createElement("strong");
    const detail = document.createElement("p");
    timestamp.dateTime = entry.at;
    timestamp.textContent = formatTimestamp(entry.at);
    title.textContent = entry.title;
    detail.textContent = entry.detail;
    copy.append(title, detail);
    item.append(timestamp, copy);
    activity.append(item);
  });
}

function renderSafety(items) {
  const list = document.getElementById("safety-list");
  items.forEach((rule) => {
    const item = document.createElement("li");
    item.textContent = rule;
    list.append(item);
  });
}

function renderPipeline(items) {
  const pipeline = document.getElementById("pipeline");
  items.forEach((entry) => {
    const item = document.createElement("article");
    item.className = "pipeline-item";

    const state = document.createElement("span");
    state.className = `pipeline-state ${entry.state}`;
    state.textContent = entry.state;

    const copy = document.createElement("div");
    copy.className = "pipeline-copy";
    const title = document.createElement("strong");
    const result = document.createElement("p");
    title.textContent = entry.name;
    result.textContent = entry.result;
    copy.append(title, result);
    item.append(state, copy);
    pipeline.append(item);
  });
}

function renderTransactions(transactions) {
  const body = document.getElementById("transactions");
  if (!transactions.length) {
    const row = document.createElement("tr");
    row.className = "empty-row";
    const cell = document.createElement("td");
    cell.colSpan = 7;
    cell.textContent = "No eligible cash transactions yet. Founder funding and promotional values are deliberately excluded.";
    row.append(cell);
    body.append(row);
    return;
  }

  transactions.forEach((transaction) => {
    const row = document.createElement("tr");
    const values = [
      transaction.date,
      transaction.type,
      transaction.description,
      shortMoney.format(transaction.inflow || 0),
      shortMoney.format(transaction.outflow || 0),
      transaction.eligible ? "Yes" : "No",
      transaction.evidence,
    ];
    values.forEach((value) => {
      const cell = document.createElement("td");
      cell.textContent = value;
      row.append(cell);
    });
    body.append(row);
  });
}

function renderSources(sources) {
  const list = document.getElementById("sources-list");
  sources.forEach((source) => {
    const anchor = document.createElement("a");
    externalLink(anchor, source);
    list.append(anchor);
  });
}

async function init() {
  try {
    const response = await fetch("data/status.json", { cache: "no-store" });
    if (!response.ok) throw new Error(`Status request failed: ${response.status}`);
    const data = await response.json();
    renderStatus(data);
    renderMetrics(data);
    renderAction(data.nextAction);
    renderActivity(data.activity);
    renderEarningRules(data.earningRules);
    renderSafety(data.safety);
    renderPipeline(data.pipeline);
    renderTransactions(data.ledger.transactions);
    renderSources(data.sources);
  } catch (error) {
    setText("status-label", "Dashboard unavailable");
    setText("status-description", "The public status file could not be loaded. Check the GitHub repository for the latest ledger.");
    console.error(error);
  }
}

init();
