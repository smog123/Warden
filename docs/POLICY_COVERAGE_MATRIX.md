# WARDEN — Policy Coverage Matrix

---

## 1. Executive Summary

A critical failure mode in AI agent security is assuming that access controls configured at one layer (e.g., in a wallet provider's dashboard or a smart contract) protect operations across all execution paths.

This matrix rigorously documents and distinguishes:
1. **Tier 1: What the NEAR Protocol Enforces** (Consensus & VM Layer)
2. **Tier 2: What an Agent-Wallet Provider Enforces** (e.g., NEAR Intents / Agent API Layer)
3. **Tier 3: What WARDEN Enforces Independently** (Client-Side Guard & Pre-Flight Middleware)
4. **Tier 4: What Remains Unknown, Ambiguous, or Unsupported**

Every technical assertion in this document is accompanied by its official documentation source citation.

---

## 2. Granular Policy Enforcement Matrix

| Security Dimension / Capability | Tier 1: NEAR Protocol Layer | Tier 2: Agent-Wallet Provider Layer | Tier 3: WARDEN Independent Guard | Tier 4: Unknown / Unsupported / Gaps | Documentation Sources |
|---|---|---|---|---|---|
| **Native NEAR Transfer Value Limits** | ❌ **No Protocol Cap:** Full-Access keys can transfer 100% of balance. Function-Call keys forbid deposit > 0. | ⚠️ **Conditional:** Supported via intent quotes; **BYPASSED** completely if `native.near.transfer` is enabled. | ✅ **Strictly Enforced:** Deterministic per-tx ceiling and 24h aggregate limit enforced in pre-flight. | ⚠️ Unsupported if agent bypasses guard and holds a raw Full-Access key directly. | [NEAR Access Keys](https://docs.near.org/protocol/accounts-contracts/access-keys); [Agent API Policies](https://docs.agentsonintents.com/integration/agent-api/policies-and-limits) |
| **Recipient Address Whitelisting (Native NEAR)** | ❌ **Unsupported:** Full-Access keys can send to any valid account ID. | ⚠️ **Conditional:** `destinations.list` applies *only* to intent swaps/transfers; **IGNORED** for native NEAR transfers. | ✅ **Strictly Enforced:** Matches target against explicit whitelist before authorizing signature. | ⚠️ Cross-chain address formatting outside EVM/Solana/NEAR is unsupported. | [Agent API Policies](https://docs.agentsonintents.com/integration/agent-api/policies-and-limits) ("native is for advanced users") |
| **Contract Call Scoping (Receiver ID)** | ✅ **Enforced:** Function-Call keys are strictly bound to a single `receiver_id`. | ✅ **Enforced:** `actions: ["call"]` requires contract authorization. | ✅ **Enforced:** Verifies `receiverId` matches authorized contract registry. | ⚠️ Dynamic factory-spawned sub-contracts require runtime updates to policy. | [NEAR Access Keys](https://docs.near.org/protocol/accounts-contracts/access-keys) |
| **Contract Method Scoping** | ✅ **Enforced:** Function-Call keys can restrict to exact `method_names`. (If omitted, all methods allowed). | ⚠️ **Partial:** Provider policies regulate high-level actions (`swap`, `transfer`), not fine-grained contract methods. | ✅ **Enforced:** Validates method name against strict whitelist; rejects wildcard calls. | ⚠️ ABI validation for complex overloaded arguments is unsupported without on-chain ABI registry. | [NEAR Access Keys](https://docs.near.org/protocol/accounts-contracts/access-keys); [Agent Skills](https://github.com/near/agent-skills) |
| **NEP-141 Fungible Token Limits** | ❌ **Unsupported:** Protocol sees `ft_transfer` as a standard contract call. No native awareness of token decimals or balances. | ✅ **Enforced for Intents:** `limits.per_transaction` and `limits.daily` support specific token contract IDs. | ✅ **Enforced:** Parses `ft_transfer` JSON args, decodes amount, checks against per-token daily ceilings. | ⚠️ Unstandardized tokens not adhering to NEP-141 transfer schemas cannot be parsed. | [NEP-141 Token Standard](https://nomicon.io/Standards/Tokens/FungibleToken/Core); [Agent API Policies](https://docs.agentsonintents.com/integration/agent-api/policies-and-limits) |
| **Gas Allowance Spending Ceiling** | ✅ **Enforced:** Function-Call keys enforce strict gas allowance. Fails with `NotEnoughAllowance` when consumed. | ❌ **Delegated:** Provider manages key allowances or meta-tx gas funds behind API. | ✅ **Monitored:** Tracks remaining key allowance; issues lockout warnings before gas depletion. | ⚠️ Gas price fluctuations at runtime may cause minor estimation discrepancies. | [NEAR Gas Documentation](https://docs.near.org/protocol/transactions/gas); [Access Keys](https://docs.near.org/protocol/accounts-contracts/access-keys) |
| **Emergency Freeze / Kill Switch** | ❌ **Unsupported:** Protocol has no native freeze concept without deleting access keys. | ✅ **Enforced:** `frozen: true` stops all intent actions immediately. | ✅ **Enforced:** Instant client-side circuit breaker halts all pre-signature pipelines without API latency. | ⚠️ Freezing an off-chain guard does not stop an attacker who has stolen the private key from signing externally. | [Agent API Policies](https://docs.agentsonintents.com/integration/agent-api/policies-and-limits) |
| **Operating Schedule / Time Windows** | ❌ **Unsupported:** Protocol accepts valid signed transactions 24/7/365. | ✅ **Enforced:** `schedule.windows` defines authorized days and hours. | ✅ **Enforced:** Evaluates system time in configured timezone before proceeding to signing. | ⚠️ Client clock drift could skew time-window checks by seconds (mitigated by NTP sync check). | [Agent API Policies](https://docs.agentsonintents.com/integration/agent-api/policies-and-limits) |
| **Sliding-Window Rate Limits (Calls/Hour)** | ❌ **Unsupported:** Protocol allows as many transactions as gas and nonce progression allow. | ✅ **Enforced:** `max_actions_per_hour` throttles intent submissions. | ✅ **Enforced:** Local sliding-window rate limiter prevents transaction burst attacks. | ⚠️ Distributed agents sharing an account require a shared state coordinator (e.g. Redis) to sync sliding counters. | [Agent API Policies](https://docs.agentsonintents.com/integration/agent-api/policies-and-limits) |
| **Counterparty Reputation & Age Scoring** | ❌ **Unsupported:** Protocol processes transfers to any syntactically valid account ID. | ❌ **Unsupported:** Provider checks recipient existence and whitelist, but does not score reputation or code mutability. | ✅ **Strictly Enforced (Feature F):** Scores creation age, contract deployment, code hash changes, and past interactions. | ⚠️ Off-chain indexer lag may delay account age calculation by several seconds. | [Track 06 Prompt Specifications](https://github.com/nearai/near-hackathon-prompt-examples/blob/main/tracks/06-security.md) |
| **Shared Threat Blocklist & Evidence** | ❌ **Unsupported:** Protocol does not maintain blocklists or subjective scam flags. | ❌ **Unsupported:** Provider does not maintain a community evidence blocklist. | ✅ **Strictly Enforced (Feature F):** Queries community-verified blocklist with attached forensic tx hashes. | ⚠️ Newly deployed phishing addresses not yet reported to registry will evade blocklist check. | [Track 06 Prompt Specifications](https://github.com/nearai/near-hackathon-prompt-examples/blob/main/tracks/06-security.md) |
| **Prompt Injection Payload Interception** | ❌ **Unsupported:** Protocol operates strictly on serialized binary bytes, unaware of LLM prompts. | ❌ **Unsupported:** Provider evaluates signed intents, not upstream LLM reasoning or prompt context. | ✅ **Enforced in Pipeline:** Intercepts agent tool-call intents before signing; catches prompt injection overrides. | ⚠️ Highly novel semantic jailbreaks that stay within declared limits cannot be detected solely by policy rules. | [Track 06 Prompt Specifications](https://github.com/nearai/near-hackathon-prompt-examples/blob/main/tracks/06-security.md) |

---

## 3. Deep-Dive: Specific Architectural Differences & Gaps

### 3.1 The "Native Transfer Bypass" in NEAR Agent API
- **Assertion:** When an agent is configured with the NEAR Agent API, enabling native transfers via `native.near.transfer: true` circumvents the provider's `destinations`, `budget`, `timelock_ms`, and `schedule` protections.
- **Documentation Source:** [NEAR Agent API: Policies and Limits](https://docs.agentsonintents.com/integration/agent-api/policies-and-limits)
  > *"native is for advanced users. The rest of the policy does not protect native methods: a destination list, a USD budget, a timelock, a schedule or owner approval never stops them. With native.near.transfer on, the agent can send NEAR to any account whatever destinations says."*
- **Enforcement Status:**
  - Protocol: Does not enforce.
  - Provider: Explicitly bypassed.
  - WARDEN: **Enforces independently** by intercepting native transfer calls and applying destination and volume constraints.

---

### 3.2 The 1-yoctoNEAR Requirement for NEP-141 Tokens
- **Assertion:** Calling standard `ft_transfer` requires attaching 1 yoctoNEAR. Standard NEAR Function-Call keys strictly forbid attaching any non-zero deposit.
- **Documentation Source:** [NEAR Smart Contract Security: Require 1 yoctoNEAR](https://docs.near.org/smart-contracts/security/one_yocto); [NEP-141 Standard](https://nomicon.io/Standards/Tokens/FungibleToken/Core)
  > *"To ensure that a user authorized a transaction, methods that modify state or transfer assets often require a deposit of at least 1 yoctoNEAR. Because Function-Call keys cannot attach a deposit, this guarantees that only Full-Access keys or meta-transactions can sign the call."*
- **Enforcement Status:**
  - Protocol: Enforces `deposit == 0` for Function-Call keys.
  - Security Gap: Developers frequently grant Full-Access keys to agents so they can transfer NEP-141 tokens, unintentionally creating catastrophic account exposure.
  - WARDEN: Recommends and verifies either scoped meta-transaction delegation (NEP-366) or restricted proxy contracts, preventing raw Full-Access key handoff.

---

### 3.3 Permanent Account Lockout via Key Allowance Depletion
- **Assertion:** If an account holds zero Full-Access keys and only Function-Call keys with finite allowances, it is permanently locked once the allowance runs out.
- **Documentation Source:** [NEAR Access Keys: Allowance Exhaustion](https://docs.near.org/protocol/accounts-contracts/access-keys#allowance-exhaustion)
  > *"If an account has only function-call keys and their allowance runs out, the account cannot sign any more transactions. Adding NEAR to the account does not help, because the allowance belongs to the key, not to the account balance."*
- **Enforcement Status:**
  - Protocol: Enforces refusal (`NotEnoughAllowance`).
  - Provider: Unaware if external sub-accounts are locked.
  - WARDEN: Proactively inspects account key topology and alerts when remaining allowance drops below safe operating thresholds.

---

## 4. Unsupported & Ambiguous Areas (Recorded Uncertainties)

In compliance with project directives (*"Where documentation is unavailable or ambiguous, record the uncertainty instead of guessing"*):

1. **Intents Testnet Solver Behavior:** Official docs state that no testnet exists or is planned for NEAR Intents (FAQ Q-007). The exact behavior of production solvers handling partial fills or slippage under high volatility cannot be deterministically verified on testnet. *WARDEN records this as an external execution uncertainty and relies on dry-quote verification.*
2. **Post-Quantum Key Signature Verification Latency:** ML-DSA-65 keys are supported on NEAR via `ml-dsa-65-hash:`. However, public testnet RPC tooling for generating and submitting raw ML-DSA-65 transactions in JavaScript is currently emerging. WARDEN natively recognizes the key hash during inspection, but defers live signing tests for post-quantum keys to specialized cryptographic fixtures.
3. **Multi-Agent Shared Nonce Tracking:** If multiple autonomous agents share a single NEAR account using the same Function-Call key, concurrent transactions can fail due to nonce collisions. NEAR introduces "Gas Keys" to mitigate this with independent nonce lanes, but ecosystem documentation for gas keys in TypeScript SDKs remains in early access.
