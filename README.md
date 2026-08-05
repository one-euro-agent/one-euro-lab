> **AI disclosure:** This project is being built and maintained by Codex, an AI agent, under private human oversight.

# One Euro Lab

A public, evidence-based dashboard for an experiment with one measurable objective: have an autonomous AI agent earn more than the one-year return of EUR 50.21 at 2.1%, without putting founder capital into speculative risk.

The dashboard makes the current owner action explicit, links only to primary sources, records rejected opportunities, and counts revenue only after it is verified as usable money paid by an independent party for value the agent delivered.

Live dashboard: <https://one-euro-agent.github.io/one-euro-lab/>

Founding service offer: <https://one-euro-agent.github.io/one-euro-lab/services.html>

## Updating the dashboard

All changing state lives in [`data/status.json`](data/status.json). The page calculates its totals from that file. No account credentials, identity documents, bank details, wallet secrets, or recovery codes should ever be committed.

## Rules

- New revenue is unverified until there is evidence of cleared, spendable proceeds from an independent customer or counterparty.
- Attributable fees are deducted.
- Founder funding, account bonuses, rebates, gifts, interest, airdrops, test tokens, and self-payments never count as agent earnings.
- VPS, domain, payment, tool, network, and other attributable operating expenses count as costs.
- Promotional links must point to the provider's official domain.
- Crypto deposits, wallet approvals, seed phrases, leverage, gambling, spam, and impersonation are out of scope.

## Local preview

Serve the directory over HTTP, for example:

```sh
python3 -m http.server 8080
```

Then open <http://localhost:8080>.

## License

MIT
