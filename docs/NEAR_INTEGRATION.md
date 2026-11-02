# WARDEN — NEAR Protocol Integration Specification

---

## 1. NEAR Protocol Architectural Specifications

This document outlines the technical mechanisms, cryptographic primitives, and RPC interactions used by WARDEN to interface with the NEAR Protocol blockchain.

---

## 2. NEAR Account & Access Key Model

### 2.1 Account Types
- **Named Accounts:** Human-readable addresses (e.g., `agent.testnet`, `dao.near`) with min 2 and max 64 characters.
- **Implicit Accounts:** 64-character hex strings derived directly from an `ed25519` public key (e.g., `98793cd44a706bf16ec4d4b0253a7499bd7f0182604c92ec7b830482023060c9`).
- **Sub-Accounts:** Accounts created hierarchically by a parent account (e.g., `bot1.agent.testnet`).

### 2.2 Access Key Permissions
NEAR separates account ownership from transaction authorization using cryptographic access keys:

| Key Type | Protocol Definition | Capabilities | Critical Limitations |
|---|---|---|---|
| **FullAccess** | Unrestricted key | Can perform any action: `Transfer`, `CreateAccount`, `DeployContract`, `AddKey`, `DeleteKey`, `DeleteAccount`, `FunctionCall`. | Giving an AI agent a Full-Access key grants it absolute power over the entire account, enabling complete liquidation. |
| **FunctionCall** | Restricted permission | Restricted to a specific contract (`receiver_id`), optional method list (`method_names`), and gas allowance (`allowance`). | **Zero Native Transfer:** Cannot attach any native NEAR deposit (`deposit > 0 yoctoNEAR` is rejected by the protocol). Cannot add/remove keys or delete account. |

```json
// Example NEAR RPC Function-Call Permission Payload
{
  "permission": {
    "FunctionCall": {
      "allowance": "250000000000000000000000", // 0.25 NEAR in yoctoNEAR
      "receiver_id": "usdt.tether-token.near",
      "method_names": ["ft_transfer"]
    }
  },
  "public_key": "ed25519:8wZ7bC4p3V..."
}
```

### 2.3 Supported Cryptographic Signature Schemes
NEAR Protocol natively supports three distinct signature algorithms, as documented in official protocol specifications:

1. **Ed25519 (`ed25519:`):** 32-byte public key; primary scheme for implicit accounts and wallet creation.
2. **secp256k1 (`secp256k1:`):** 64-byte public key; standard Ethereum/Bitcoin curve utilized heavily for Chain Signatures and EVM cross-chain flows.
3. **ML-DSA-65 (`ml-dsa-65:`):** Post-quantum lattice-based signature scheme (NIST FIPS 204).
   - *Storage Optimization:* Because ML-DSA-65 public keys are 1952 bytes, NEAR does not store the full key on-chain. It stores a 32-byte SHA3-256 hash.
   - *RPC Representation:* When querying `view_access_key_list`, ML-DSA-65 keys appear with prefix `ml-dsa-65-hash:`. WARDEN's key parser natively recognizes and validates this prefix.

---

## 3. Gas Accounting & The Allowance Lockout Hazard

### 3.1 Gas Allowance Arithmetic
- Gas in NEAR is measured in gas units (Tgas = $10^{12}$ gas units).
- When a Function-Call key signs a transaction, gas is bought at the current block price from the key's `allowance`.
- If unburnt gas is refunded, the refund is credited back to the key's allowance.
- If `allowance: null`, the key has unlimited gas usage (bounded only by the account's liquid balance).

### 3.2 Permanent Account Lockout
Per official NEAR documentation ([Access Keys](https://docs.near.org/protocol/accounts-contracts/access-keys#allowance-exhaustion)):
> *"If an account has only function-call keys and their allowance runs out, the account cannot sign any more transactions. Adding NEAR to the account does not help, because the allowance belongs to the key, not to the account balance."*

**WARDEN Detection Rule (`RULE_KEY_LOCKOUT_RISK`):**
```typescript
if (accountKeys.every(k => k.permission !== "FullAccess")) {
  const lowAllowanceKeys = accountKeys.filter(k => 
    k.permission.FunctionCall.allowance !== null && 
    BigInt(k.permission.FunctionCall.allowance) < BigInt("100000000000000000000000") // < 0.1 NEAR
  );
  if (lowAllowanceKeys.length > 0) {
    emitWarning("CRITICAL: Account holds only Function-Call keys and allowance is near exhaustion. Account risks irreversible lockout.");
  }
}
```

---

## 4. NEP-141 Fungible Token vs Native NEAR Transfers

A common misconception in AI agent engineering is assuming that a Function-Call key prevents token transfers.

1. **Native NEAR Transfers (`Action::Transfer`):** Requires a Full-Access key. Function-Call keys strictly reject non-zero native deposits at consensus level.
2. **NEP-141 Fungible Token Transfers (`ft_transfer`):** 
   - Carried out as a `FunctionCall` to the token smart contract (e.g., `wrap.testnet`, `usdt.tether-token.near`).
   - Standard NEP-141 specifies attaching exactly 1 yoctoNEAR (`10^-24 NEAR`) for security against front-running and unauthorized contract calls ([Require 1 yoctoNEAR](https://docs.near.org/smart-contracts/security/one_yocto)).
   - **Crucial Security Implication:** Because standard Function-Call keys **forbid attaching even 1 yoctoNEAR**, an agent cannot directly call `ft_transfer` with a standard Function-Call key unless:
     a) It uses a Full-Access key (dangerous!), or
     b) It signs a meta-transaction (NEP-366) relayed by a relayer that attaches the deposit, or
     c) It uses an account proxy/multisig contract.
   - WARDEN explicitly audits whether the agent's signing mechanism is exposed to Full-Access escalation when handling NEP-141 tokens.

---

## 5. NEAR RPC Methods Utilized by WARDEN

WARDEN communicates with NEAR testnet RPC endpoints (`https://test.rpc.fastnear.com`, `https://rpc.testnet.near.org`) using standard JSON-RPC 2.0 payloads:

### 5.1 Account Balance & State
```json
// POST /
{
  "jsonrpc": "2.0",
  "id": "warden-req-1",
  "method": "query",
  "params": {
    "request_type": "view_account",
    "finality": "final",
    "account_id": "target.testnet"
  }
}
```

### 5.2 Access Key Enumeration
```json
// POST /
{
  "jsonrpc": "2.0",
  "id": "warden-req-2",
  "method": "query",
  "params": {
    "request_type": "view_access_key_list",
    "finality": "final",
    "account_id": "target.testnet"
  }
}
```

### 5.3 Smart Contract Code Inspection (Code Hash Verification)
```json
// POST /
{
  "jsonrpc": "2.0",
  "id": "warden-req-3",
  "method": "query",
  "params": {
    "request_type": "view_code",
    "finality": "final",
    "account_id": "target.testnet"
  }
}
```
*Returns `hash` (SHA-256 base58) and `code_base64`. WARDEN uses `hash` to track code mutations.*

---

## 6. NEAR Intents & Agent API Integration Nuances

### 6.1 Testnet Intent Availability
Per official Hackathon FAQ Q-007 ([HACKATHON.md](https://nearhackathon.com/HACKATHON.md)):
> *"Testnet for Intents? None exists or is planned. Mainnet, separate dev accounts, tiny amounts, dry: true quotes."*

**WARDEN Implementation Approach:**
- For live demonstrations, WARDEN executes against **NEAR testnet** for all native transactions, access key inspections, and contract calls.
- For NEAR Intents integration analysis, WARDEN connects to the 1Click / Agent API `/v0/quote` endpoint with `dry: true`, or executes against verified local test vectors.
- All simulated fixtures and mock solvers are strictly labeled `[SIMULATED INTENT]`.

### 6.2 The Native Transfer Bypass
In the official NEAR Agent API (`docs.agentsonintents.com/integration/agent-api/policies-and-limits`), the policy allows setting `native.near.transfer: true`.
Official documentation explicitly warns:
> *"The rest of the policy does not protect native methods: a destination list, a USD budget, a timelock, a schedule or owner approval never stops them."*

WARDEN directly flags this critical configuration gap in the Policy Coverage Matrix and enforces external destination and volume validation via `@warden/guard`.

---

## 7. Operational Distinctions: Live RPC vs Simulated Data

To uphold the core project rule:
> *"Never invent blockchain data, API responses, wallet capabilities or security findings. Mark test fixtures and simulated attacks clearly as simulated. Distinguish them from live NEAR blockchain observations."*

Every data model in WARDEN includes an explicit provenance field:

```typescript
export interface ProvenanceMetadata {
  dataSource: "LIVE_NEAR_RPC" | "SIMULATED_TEST_FIXTURE";
  network: "testnet" | "mainnet" | "sandbox";
  blockHeight?: number;
  blockTimestamp?: string;
  rpcEndpoint?: string;
  simulationScenarioId?: string;
}
```
In the UI, any component displaying simulated data renders a high-contrast amber badge: `[SIMULATED SCENARIO - SAFE TESTNET ENVIRONMENT]`.
