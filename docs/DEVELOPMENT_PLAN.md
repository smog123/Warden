# WARDEN — Development Plan & Execution Roadmap

---

## 1. Development Process & Rigor Rules

To guarantee delivery of a reliable, high-scoring hackathon submission within the designated timeframe:
1. **No Next-Phase Progression without Acceptance:** Every development phase must pass its verifiable acceptance criteria and automated tests before proceeding to the subsequent phase.
2. **Deterministic-First:** The core security logic is implemented and tested as pure TypeScript functions with zero side-effects before connecting UI or external APIs.
3. **Commit & Push Cadence:** After completing each development phase, changes are committed and pushed to GitHub with descriptive semantic commit messages.

---

## 2. Phase-by-Phase Roadmap

### Phase 1: Product Research, Architecture & Technical Specification (CURRENT)
- [x] Investigate official NEAR Protocol documentation, access key mechanisms, signature schemes (Ed25519, secp256k1, ML-DSA-65).
- [x] Analyze NEAR Agent API (`policies-and-limits`) and document the "Native Transfer Bypass" security loophole.
- [x] Review Track 06 (AI Security & Defense) and Track 07 (Agent Economy) prompt requirements.
- [x] Produce comprehensive architectural documentation:
  - `docs/PRODUCT_SPEC.md`
  - `docs/TECHNICAL_ARCHITECTURE.md`
  - `docs/THREAT_MODEL.md`
  - `docs/NEAR_INTEGRATION.md`
  - `docs/POLICY_COVERAGE_MATRIX.md`
  - `docs/MVP_SCOPE.md`
  - `docs/DEVELOPMENT_PLAN.md`
- **Acceptance Criteria:** All 7 documentation files created, validated, committed, and reviewed.

---

### Phase 2: Core Deterministic Policy Engine (`@warden/core`)
- **Objectives:**
  - Define complete TypeScript types and interfaces for `WardenPolicy`, `TransactionIntent`, `EvaluationResult`, and violation codes.
  - Implement pure deterministic evaluation functions:
    - `evaluateSpendingLimits(intent, state, policy)`
    - `evaluateDestinations(intent, policy)`
    - `evaluateContractScope(intent, policy)`
    - `evaluateSchedule(timestamp, policy)`
    - `evaluateFreeze(policy)`
  - Implement stateful sliding-window rate limit tracker.
- **Testing:**
  - Comprehensive Vitest unit test suite covering 100% of branch logic, edge cases, zero-balance, integer overflow handling, and invalid inputs.
- **Acceptance Criteria:** `npm run test:core` passes with 100% test coverage and 0 warnings.

---

### Phase 3: NEAR Protocol RPC Client & Permission Inspector
- **Objectives:**
  - Implement resilient JSON-RPC 2.0 client for NEAR testnet (`test.rpc.fastnear.com`, `rpc.testnet.near.org`).
  - Implement `inspectAccountKeys(accountId)`:
    - Parses `FullAccess` vs `FunctionCall` keys.
    - Decodes public key prefixes (`ed25519:`, `secp256k1:`, `ml-dsa-65-hash:`).
    - Checks remaining gas allowances.
    - Evaluates structural vulnerabilities (`RULE_FULL_ACCESS_PRESENT`, `RULE_KEY_LOCKOUT_RISK`, `RULE_UNRESTRICTED_METHODS`).
  - Implement `viewAccountState(accountId)` and `viewContractCode(accountId)`.
- **Testing:**
  - Integration tests querying real NEAR testnet accounts as well as deterministic mock fixtures.
- **Acceptance Criteria:** Successfully inspects real testnet accounts and generates verified risk diagnostics.

---

### Phase 4: Evidence-Based Counterparty Screening Engine
- **Objectives:**
  - Implement 5 distinct reputation signals:
    1. `SIG_AGE`: Account age and block height check via NEAR RPC.
    2. `SIG_CONTRACT`: Contract code mutation tracker via `view_code` hash comparison.
    3. `SIG_HISTORY`: Agent interaction history query.
    4. `SIG_STAKE`: Account balance and staking check.
    5. `SIG_BLOCKLIST`: Forensic threat registry query with attached evidence tx hashes.
  - Implement composite scoring algorithm (0 - 100) and verdict resolution (`ALLOW`, `WARN`, `BLOCK`).
- **Testing:**
  - Unit tests verifying scoring math and thresholds.
  - Integration tests against known-good and known-bad test fixtures.
- **Acceptance Criteria:** Correctly assigns `BLOCK` to blocklisted addresses and `WARN` to freshly modified contracts.

---

### Phase 5: Adversarial Attack Laboratory & Agent-Side Guard
- **Objectives:**
  - Build `@warden/guard` pre-signature middleware wrapping transaction signing.
  - Build Adversarial Simulation Harness with 5 distinct attack vectors:
    1. Direct Prompt Injection (`drain_funds`).
    2. Salami Attack (Transaction splitting / daily cap breach).
    3. Destination Address Hijack.
    4. Emergency Freeze Evasion.
    5. Contract Method Spoofing.
  - Create standalone CLI demonstration script: `scripts/demo-attack-lab.ts`.
- **Testing:**
  - Vitest integration tests verifying that all 5 attack scenarios are intercepted and halted before any cryptographic signing call.
- **Acceptance Criteria:** Attack demonstrations run deterministically, emit structured forensic traces, and halt execution with exact violation codes.

---

### Phase 6: Next.js Frontend Dashboard & UI Console
- **Objectives:**
  - Initialize Next.js 15 App Router project with Tailwind CSS.
  - Build UI views:
    - **Dashboard Overview:** High-level security posture, active agent status, quick stats.
    - **Wallet Permission Intelligence:** Account lookup, key topology visualizer, lockout risk alerts.
    - **Policy Coverage Matrix:** Interactive multi-tier comparison table with gap highlighting.
    - **Adversarial Attack Lab:** Interactive scenario runner with live event stream and step-by-step halting visualization.
    - **Counterparty Screener:** Address scanner displaying signal breakdown and evidence.
    - **Security Audit Reports:** Formatted report viewer and JSON certificate download.
  - Implement server-side API routes matching backend services.
- **Acceptance Criteria:** Zero placeholder buttons. All visual states update from live API calls and deterministic simulations. Explicit `[SIMULATED SCENARIO]` badges on all mock data.

---

### Phase 7: Verification, End-to-End Testing & Hackathon Submission Packaging
- **Objectives:**
  - Comprehensive end-to-end integration testing.
  - Create machine-readable and human-friendly `README.md` per Hackathon guidelines (reproducible "do X - see Y" steps).
  - Prepare CLI demo commands for quick judge evaluation (`npm test`, `npm run demo`).
  - Verify compliance with Hackathon rules: MIT license, disposable testnet accounts, zero private keys committed.
  - Final git push to `https://github.com/smog123/Warden`.
- **Acceptance Criteria:** Clean build (`npm run build`), all tests passing (`npm test`), repository public, demo post ready.
