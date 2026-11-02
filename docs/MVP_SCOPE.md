# WARDEN — MVP Scope & Boundaries

---

## 1. Guiding Principles & MVP Philosophy

The objective for the NEAR Hackathon 2026 is to build a **compact, technically defensible, end-to-end functional MVP** that proves the security assurance model for AI agent wallets.

In accordance with project rules:
- **No Decorative Placeholders:** Every button, tab, and toggle in the interface executes real underlying logic.
- **Zero Hallucinated Data:** Live RPC queries return real NEAR blockchain observations. Simulated testbeds are explicitly labeled with `[SIMULATED SCENARIO]` badges.
- **No Unnecessary Infrastructure:** Built using standard Next.js 15, Tailwind CSS, TypeScript, Vitest, and direct NEAR RPC integration. No superfluous microservices, Redis clusters, or external databases required for core demonstration.
- **Strict Key Safety:** Zero private key custody or seed phrase requests.

---

## 2. In-Scope vs Out-of-Scope Feature Breakdown

| Feature Module | In-Scope for Hackathon MVP | Explicitly Out-of-Scope (Deferred) |
|---|---|---|
| **A. Wallet Permission Intelligence** | - Live NEAR testnet RPC inspection (`view_account`, `view_access_key_list`).<br>- Recognition of `FullAccess` vs `FunctionCall` keys.<br>- Detection of cryptographic schemes (`ed25519:`, `secp256k1:`, `ml-dsa-65-hash:`).<br>- Automated hazard alerts for Full-Access keys and key lockout hazards. | - Multi-signature SputnikDAO key voting inspection.<br>- Automated on-chain key revocation transactions (read-only audit for safety). |
| **B. Policy Coverage Analyzer** | - Interactive comparative matrix displaying Protocol vs Provider vs WARDEN coverage.<br>- Real-time configuration gap analysis.<br>- Direct identification of the "Native Transfer Bypass" in Agent API. | - Automated bi-directional syncing back to external custodial SaaS provider APIs. |
| **C. Adversarial Attack Laboratory** | - 5 complete attack simulation scenarios:<br>  1. Direct Prompt Injection (`drain_funds`).<br>  2. Salami Attack (Transaction splitting / daily cap breach).<br>  3. Destination Address Hijack / Unwhitelisted Recipient.<br>  4. Emergency Freeze Evasion.<br>  5. Contract Method Spoofing.<br>- Step-by-step interactive attack console with real-time logs and decision traces.<br>- Clear visual `[SIMULATED SCENARIO]` watermark. | - Live malicious transaction broadcasting on mainnet.<br>- Fine-tuning custom adversarial LLM models on the server. |
| **D. Agent-Side Authorization Guard** | - Deterministic TypeScript policy engine (`@warden/guard`).<br>- Pre-signature evaluation pipeline (Limits, Whitelists, Schedule, Freeze, Screener).<br>- Complete Vitest unit & integration test suite proving 100% test coverage of security invariants.<br>- Standalone CLI demonstration script (`npm run demo:guard`). | - C++ / Rust native bindings for embedded microcontrollers. |
| **E. Security Reports & Audit Evidence** | - Deterministic JSON audit certificate export.<br>- Formatted Markdown audit report generator.<br>- SHA-256 integrity hash calculation for audit provenance. | - Automated on-chain attestation anchoring with ZK-SNARK proofs. |
| **F. Evidence-Based Counterparty Screening** | - Multi-signal scoring engine (5 signals):<br>  1. Account Age & Creation Block (Live RPC / block height).<br>  2. Contract Code Inspection & Mutation Detection (Live `view_code` hash check).<br>  3. Prior Agent Interaction History (Local ledger).<br>  4. Liquid Balance & Staking Profile (Live `view_account`).<br>  5. Shared Threat Blocklist with attached forensic evidence (Tx hashes, scam categories).<br>- Verdict outputs: `ALLOW`, `WARN` (human-in-the-loop escalation), `BLOCK` (strict signature refusal). | - Machine-learning graph neural network clustering of global transaction graphs across all historical blocks. |

---

## 3. Verifiable Acceptance Criteria

### Milestone 1: Wallet Permission Intelligence
- **Input:** Any valid NEAR testnet account ID (e.g. `warden-test.testnet`, `test.near`).
- **Output:** Live on-chain balance, list of access keys, permission types, signature schemes, gas allowances, and explicit risk flags.
- **Criteria:** Passes without errors; handles non-existent accounts gracefully with clear error messaging.

### Milestone 2: Policy Coverage Analyzer
- **Input:** Sample agent policy configuration file (JSON).
- **Output:** Evaluated coverage score (0-100%) and structured gap breakdown highlighting unaddressed risks across Protocol, Provider, and Guard tiers.

### Milestone 3: Adversarial Attack Laboratory
- **Input:** User selects one of the 5 pre-configured attack vectors and triggers "Run Simulation".
- **Output:** Live chronological execution log demonstrating the attacker payload, policy engine inspection, counterparty screening, and exact pre-signature halting reason.
- **Criteria:** 100% of unauthorized attacks are successfully intercepted and halted before reaching signing.

### Milestone 4: Agent-Side Guard (`@warden/guard`)
- **Execution:** Automated Vitest test suite (`npm run test`).
- **Criteria:** 100% passing tests covering:
  - Per-transaction cap rejection.
  - Daily cumulative budget breach.
  - Rate limiting sliding-window exhaustion.
  - Unauthorized recipient rejection.
  - Schedule window enforcement.
  - Emergency freeze circuit breaker.
  - Counterparty blocklist match rejection.

### Milestone 5: Counterparty Screener
- **Input:** Target account ID.
- **Output:** Calculated composite risk score (0-100), broken down by signal, with verdict `ALLOW`, `WARN`, or `BLOCK`.
- **Criteria:** Real-time query to live NEAR testnet RPC for `view_account` and `view_code`.

---

## 4. Non-Functional Requirements

- **Zero-Latency Evaluation:** Local deterministic policy evaluation completes in < 5 milliseconds.
- **Zero Key Custody:** System operates solely with public keys and unsigned transaction payloads.
- **Transparent Provenance:** Data sources are explicitly tagged as `LIVE_NEAR_RPC` or `SIMULATED_TEST_FIXTURE`.
- **Cross-Platform:** Operates seamlessly across modern Node.js 20+ environments and modern browsers.
