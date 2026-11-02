# WARDEN — Product Specification
**Security Testing and Authorization Assurance for NEAR AI Agent Wallets**

---

## 1. Executive Summary & Vision

As artificial intelligence agents transition from passive information retrievers into autonomous economic actors executing transactions on NEAR Protocol, the fundamental security boundary shifts from human wallet approvals to automated policy enforcement. Existing agent architectures routinely make one of two critical mistakes:
1. **Over-privileged Execution:** Agents are granted Full-Access keys or unrestricted native transfer permissions, enabling prompt injections, hallucinations, or rogue model outputs to drain entire account balances.
2. **False Sense of Security:** Developers assume protocol-level Function-Call keys, cross-chain Intents policies, or wallet provider limits protect their assets, unaware that critical attack vectors (such as NEP-141 token drains, sliding-window rate limit bypasses, unmonitored contract code changes, or provider `native` transfer bypasses) slip through completely unhindered.

**WARDEN** is an independent security assurance and authorization firewall platform purpose-built for NEAR AI agent wallets. It evaluates actual on-chain permissions, analyzes coverage gaps across architectural tiers, simulates adversarial attacks in a safe environment, scores prospective transaction counterparties against verifiable evidence, and deterministically halts unauthorized transactions *before* they reach a cryptographic signing key.

---

## 2. Core Questions WARDEN Answers

Every module in WARDEN directly addresses one of five foundational security questions:

| # | Question | WARDEN Module | Outcome |
|---|---|---|---|
| **Q1** | **What permissions does this agent actually possess?** | Feature A: Wallet Permission Intelligence | Audits live on-chain keys (Full-Access vs Function-Call), signature schemes, allowances, and lockout risks. |
| **Q2** | **What is the agent supposed to be allowed to do?** | Feature B: Policy Coverage Analyzer | Parses developer-defined security intent (budgets, whitelist, allowed contracts/methods, operating hours). |
| **Q3** | **Do the actual permissions enforce those restrictions?** | Feature B: Policy Coverage Analyzer | Identifies mismatches between declared security boundaries and actual enforcement capabilities across Protocol, Provider, and Guard layers. |
| **Q4** | **Can an adversarial instruction cause an unauthorized action?** | Feature C: Adversarial Attack Laboratory | Tests the agent against simulated prompt injections, transaction splitting, address redirection, and freeze evasion. |
| **Q5** | **Can WARDEN prevent that action before signing?** | Feature D: Agent-Side Authorization Guard | Deterministic TypeScript engine evaluates the action and strictly halts unauthorized requests prior to signing. |

---

## 3. Hackathon Alignment

- **Primary Track: AI Security & Defense (`security` - Track 06)**
  - *Core Tagline:* Trust, but verify.
  - *Focus Areas:* Spending limits, deterministic policy engines, sandboxed agent wallets, counterparty scam detection, and function-call key boundary validation.
  - *Direct Alignment:* WARDEN implements the counterparty scoring engine requested in track specifications (account age, contract status, code-hash recency, interaction history, shared blocklist), an agent-side wrapper refusing to sign blocked transactions, and prompt injection attack demonstrations with verifiable execution logs.
- **Secondary Track: Agent Economy (`agents` - Track 07)**
  - *Focus Areas:* Safe agent commerce, programmatic spending boundaries, transparent receipts, and verifiable operational parameters for autonomous economic agents.
  - *Synergy:* WARDEN provides the trust layer required before autonomous agents can be funded with capital to hire other agents, negotiate deals, and execute trades safely.

---

## 4. User Personas & Use Cases

1. **Autonomous Agent Developers (NEAR AI / Eliza / Custom Frameworks)**
   - *Need:* Safely deploy agents with real funds without risking catastrophic wallet drain from adversarial prompts or logic bugs.
   - *Action:* Integrate the `@warden/guard` middleware into their agent's transaction pipeline and use WARDEN UI to audit access keys prior to production deployment.
2. **Web3 Security Auditors & SecOps Engineers**
   - *Need:* Verify that autonomous agent wallets deployed by teams adhere to least-privilege principles and lack backdoor escalation paths.
   - *Action:* Generate immutable WARDEN Security Audit Reports detailing key configurations, policy coverage matrices, and simulation test results.
3. **DAO Treasuries & Fund Allocators**
   - *Need:* Provide operational budgets to AI agents (e.g., market-making, arbitrage, content curation) while guaranteeing protocol-enforced spending ceilings and counterparty whitelisting.
   - *Action:* Review policy coverage matrices to ensure no native transfer bypasses exist before depositing treasury assets.

---

## 5. Core Feature Specifications

### Feature A: Wallet Permission Intelligence
- **Live On-Chain Inspection:** Queries NEAR RPC endpoints (`view_account`, `view_access_key_list`) for any named or implicit account ID.
- **Key Classification:**
  - Identifies `FullAccess` keys vs `FunctionCall` keys.
  - Maps cryptographic signature schemes: `ed25519:`, `secp256k1:`, and post-quantum `ml-dsa-65-hash:`.
  - Parses Function-Call key attributes: `receiver_id`, `method_names` (including wildcard/unrestricted risk), and `allowance`.
- **Structural Vulnerability Detection:**
  - *Full-Access Key Present:* Flags high risk if an agent runtime holds a Full-Access key.
  - *Account Lockout Hazard:* Identifies accounts containing *only* Function-Call keys with low/depleted gas allowances, warning that the account risks permanent lockout with zero recovery path.
  - *Unrestricted Method Access:* Flags keys with `method_names: []` as calling any method on the target contract.

### Feature B: Policy Coverage Analyzer
- **Tri-Layer Policy Comparison:**
  - Visualizes policy coverage across three distinct enforcement boundaries:
    1. *NEAR Protocol:* What the blockchain consensus guarantees (e.g., gas allowance ceiling, zero-deposit enforcement on Function-Call keys).
    2. *Agent Wallet Provider:* What intent/custodial providers enforce (e.g., NEAR Intents / Agent API limits, USD budgets, timelocks).
    3. *WARDEN Independent Engine:* What client-side deterministic verification enforces (e.g., FT recipient whitelists, sliding-window rate limits, counterparty reputation scoring).
- **Gap Highlighting:** Specifically flags known provider architectural loopholes, notably the **Native Transfer Bypass** in the NEAR Agent API where enabling `native.near.transfer` completely bypasses provider `destinations`, `budget`, `timelock_ms`, and `schedule` controls.

### Feature C: Adversarial Attack Laboratory
- **Safe, Isolated Attack Harness:** Simulates adversarial inputs against the agent policy without risking on-chain capital.
- **Pre-Built Attack Test Scenarios:**
  1. *Direct Prompt Injection:* Adversarial prompt attempting to override instructions and send 100 NEAR to an attacker account.
  2. *Transaction Splitting (Salami Attack):* Rapid series of micro-transactions crafted to bypass single-transaction spending caps while draining the daily budget.
  3. *Counterparty Hijack:* Altering the recipient address in a transaction payload to an unverified or high-risk destination.
  4. *Emergency Freeze Evasion:* Attempting transactions while a simulated or actual emergency freeze condition is active.
  5. *Method Name Spoofing:* Attempting to invoke unauthorized contract functions via parameter overloading or similar method names.
- **Clear Demarcation:** All simulations are explicitly badged and watermarked as `[SIMULATED SCENARIO]` to prevent confusion with live blockchain state.

### Feature D: Agent-Side Authorization Guard (`@warden/guard`)
- **Deterministic Middleware:** Pure TypeScript execution guard inserted immediately prior to the cryptographic signing step.
- **Evaluation Loop:**
  1. Intercepts transaction payload (`receiverId`, `actions`, `attachedDeposit`, `args`).
  2. Evaluates stateful limits (daily accumulated spending, transaction rate counters).
  3. Runs counterparty screening evaluation (Signal scoring).
  4. Decision outputs:
     - `ALLOW`: Passes transaction to signer.
     - `WARN`: Emits structured warning requiring human-in-the-loop approval.
     - `BLOCK`: Rejects transaction immediately with deterministic violation code and forensic explanation; halts execution before key signing.
- **Zero-Key Principle:** WARDEN never holds, accesses, or requests private keys or seed phrases. The guard operates purely as an evaluator in the caller's pipeline.

### Feature E: Security Reports & Audit Evidence
- **Cryptographic Audit Certificates:** Generates a deterministic JSON and formatted Markdown report summarizing:
  - Account key topology.
  - Policy coverage score (0-100%).
  - Adversarial simulation pass/fail record.
  - Identified critical vulnerabilities and remediation steps.
- **Attribution & Integrity:** Each report contains a SHA-256 integrity hash of the evaluated policy and findings for timestamped provenance.

### Feature F: Evidence-Based Counterparty Screening
- **Multi-Signal Reputation Engine:** Evaluates prospective transaction counterparties against 5 verifiable signals:
  1. *Account Age & Creation Block:* Flags brand-new accounts (< 24h old or < 100 blocks).
  2. *Contract Status & Code Mutability:* Checks if the receiver is a smart contract (`view_code`) and when code was last deployed.
  3. *Prior Interaction History:* Assesses whether the agent has prior successful transactions with this counterparty.
  4. *Activity Volume & Staking Balance:* Measures whether the account has normal network history or appears to be a disposable throwaway address.
  5. *Shared Threat Blocklist:* Community-submitted registry of known phishing, drainer, and malicious contracts with attached on-chain transaction hashes as evidence.
- **Verdict Scoring:** Computes composite risk score returning `ALLOW`, `WARN`, or `BLOCK` with granular reason codes.

---

## 6. Success & Acceptance Criteria

- [ ] All 5 core questions can be answered within the UI and CLI within 5 seconds.
- [ ] Wallet Permission Intelligence accurately identifies Ed25519, secp256k1, and ML-DSA-65 keys from live NEAR testnet RPC.
- [ ] Adversarial Attack Laboratory executes 5 distinct attack simulations with detailed execution logs and failure analysis.
- [ ] Agent-Side Authorization Guard passes 100% of Vitest unit and integration test suites.
- [ ] Live counterparty screening connects to live NEAR testnet RPC for account and code inspection.
- [ ] Zero simulated data presented without explicit visual indicators.
- [ ] Zero private key handling in any component of WARDEN.
