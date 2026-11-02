import { MetricSummary, SecurityPosture, KeyDistribution, WalletAuditItem, AttackLabFinding, SecurityActivity } from "./types";

export const APP_CONFIG = {
  name: "WARDEN",
  tagline: "Security testing & authorization assurance for NEAR AI agent wallets",
  hackathonTrack: "AI Security & Defense (06)",
  network: "NEAR Testnet",
  version: "v0.1.0-alpha",
};

export const NAVIGATION_ITEMS = [
  { name: "Overview", href: "/", icon: "ShieldAlert" },
  { name: "Wallet Inspector", href: "/inspector", icon: "Search" },
  { name: "Policy Analyzer", href: "/policy-analyzer", icon: "Sliders" },
  { name: "Attack Laboratory", href: "/attack-lab", icon: "FlaskConical" },
  { name: "Security Reports", href: "/reports", icon: "FileText" },
  { name: "Settings", href: "/settings", icon: "Settings2" },
] as const;

// Clearly marked sample metrics representing the local testnet evaluation baseline
export const SAMPLE_METRICS: MetricSummary = {
  walletsInspected: 14,
  criticalFindings: 3,
  highRiskPermissions: 5,
  simulationsCompleted: 42,
  blockedUnauthorizedActions: 39,
};

export const SAMPLE_POSTURE: SecurityPosture = {
  score: 84,
  grade: "B",
  status: "ATTENTION_REQUIRED",
  activeGuardsCount: 6,
  totalPoliciesActive: 9,
  fullAccessViolationsCount: 2,
  lastEvaluatedAt: "2026-11-01T17:45:00Z",
};

export const SAMPLE_KEY_DISTRIBUTION: KeyDistribution = {
  fullAccess: 4,
  functionCall: 28,
  postQuantumHash: 2,
  unrestrictedMethods: 3,
};

export const SAMPLE_RECENT_AUDITS: WalletAuditItem[] = [
  {
    id: "aud-01",
    accountId: "trade-agent-v1.testnet",
    balanceNear: "45.2000",
    keysCount: 3,
    keyTypes: { fullAccess: 1, functionCall: 2, hasPostQuantum: false },
    riskLevel: "CRITICAL",
    criticalFinding: "Agent runtime holds Full-Access key; vulnerable to complete balance drain.",
    allowanceRisk: false,
    inspectedAt: "10 mins ago",
    provenance: {
      dataSource: "SIMULATED_TEST_FIXTURE",
      network: "testnet",
      isSimulated: true,
      rpcEndpoint: "https://test.rpc.fastnear.com",
    },
  },
  {
    id: "aud-02",
    accountId: "oracle-reporter.testnet",
    balanceNear: "8.1250",
    keysCount: 1,
    keyTypes: { fullAccess: 0, functionCall: 1, hasPostQuantum: true },
    riskLevel: "WARNING",
    criticalFinding: "Account has zero Full-Access keys and allowance < 0.25 Ⓝ; permanent lockout risk.",
    allowanceRisk: true,
    inspectedAt: "25 mins ago",
    provenance: {
      dataSource: "SIMULATED_TEST_FIXTURE",
      network: "testnet",
      isSimulated: true,
      rpcEndpoint: "https://test.rpc.fastnear.com",
    },
  },
  {
    id: "aud-03",
    accountId: "market-maker-sub.testnet",
    balanceNear: "120.0000",
    keysCount: 2,
    keyTypes: { fullAccess: 0, functionCall: 2, hasPostQuantum: false },
    riskLevel: "SECURE",
    criticalFinding: undefined,
    allowanceRisk: false,
    inspectedAt: "1 hour ago",
    provenance: {
      dataSource: "SIMULATED_TEST_FIXTURE",
      network: "testnet",
      isSimulated: true,
      rpcEndpoint: "https://test.rpc.fastnear.com",
    },
  },
  {
    id: "aud-04",
    accountId: "dex-solver-bot.testnet",
    balanceNear: "3.5000",
    keysCount: 2,
    keyTypes: { fullAccess: 0, functionCall: 2, hasPostQuantum: false },
    riskLevel: "WARNING",
    criticalFinding: "Function-Call key has unrestricted methods (method_names: []) on target contract.",
    allowanceRisk: false,
    inspectedAt: "2 hours ago",
    provenance: {
      dataSource: "SIMULATED_TEST_FIXTURE",
      network: "testnet",
      isSimulated: true,
      rpcEndpoint: "https://test.rpc.fastnear.com",
    },
  },
];

export const SAMPLE_ATTACK_FINDINGS: AttackLabFinding[] = [
  {
    id: "atk-01",
    scenarioId: "SCENARIO_PROMPT_INJECT_DRAIN",
    scenarioName: "Direct Prompt Injection Balance Drain",
    vector: "PROMPT_INJECTION",
    targetAccount: "attacker-drainer.testnet",
    intendedAction: "Transfer 500.00 Ⓝ via injected instruction",
    verdict: "BLOCK",
    guardInterception: "HALTED_PRE_SIGNATURE",
    violationCode: "ERR_UNAUTHORIZED_RECIPIENT",
    timestamp: "12 mins ago",
    provenance: {
      dataSource: "SIMULATED_TEST_FIXTURE",
      network: "testnet",
      isSimulated: true,
      simulationScenarioId: "SCENARIO_PROMPT_INJECT_DRAIN",
    },
  },
  {
    id: "atk-02",
    scenarioId: "SCENARIO_SALAMI_SPLIT",
    scenarioName: "Salami Attack (Transaction Splitting)",
    vector: "SALAMI_SPLITTING",
    targetAccount: "relay-node-unlisted.testnet",
    intendedAction: "50x 9.9 Ⓝ micro-transactions to drain 495 Ⓝ",
    verdict: "BLOCK",
    guardInterception: "HALTED_PRE_SIGNATURE",
    violationCode: "ERR_DAILY_BUDGET_EXCEEDED",
    timestamp: "34 mins ago",
    provenance: {
      dataSource: "SIMULATED_TEST_FIXTURE",
      network: "testnet",
      isSimulated: true,
      simulationScenarioId: "SCENARIO_SALAMI_SPLIT",
    },
  },
  {
    id: "atk-03",
    scenarioId: "SCENARIO_MUTATED_CONTRACT_CALL",
    scenarioName: "Contract Code Mutated Rugpull Call",
    vector: "ADDRESS_HIJACK",
    targetAccount: "honeypot-vault.testnet",
    intendedAction: "Call deposit() on contract modified 12 mins ago",
    verdict: "BLOCK",
    guardInterception: "HALTED_PRE_SIGNATURE",
    violationCode: "ERR_COUNTERPARTY_CODE_MUTATED",
    timestamp: "1 hour ago",
    provenance: {
      dataSource: "SIMULATED_TEST_FIXTURE",
      network: "testnet",
      isSimulated: true,
      simulationScenarioId: "SCENARIO_MUTATED_CONTRACT_CALL",
    },
  },
];

export const SAMPLE_RECENT_ACTIVITY: SecurityActivity[] = [
  {
    id: "act-01",
    timestamp: "12 mins ago",
    type: "INTERCEPTION",
    accountId: "trade-agent-v1.testnet",
    summary: "WardenGuard intercepted unauthorized transfer to unverified recipient attacker-drainer.testnet",
    verdict: "BLOCK",
    severity: "critical",
    provenance: { dataSource: "SIMULATED_TEST_FIXTURE", network: "testnet", isSimulated: true },
  },
  {
    id: "act-02",
    timestamp: "25 mins ago",
    type: "AUDIT",
    accountId: "oracle-reporter.testnet",
    summary: "Key topology inspection detected permanent lockout vulnerability (allowance < 0.25 Ⓝ)",
    verdict: "WARN",
    severity: "warn",
    provenance: { dataSource: "SIMULATED_TEST_FIXTURE", network: "testnet", isSimulated: true },
  },
  {
    id: "act-03",
    timestamp: "34 mins ago",
    type: "SIMULATION",
    accountId: "simulated-agent.testnet",
    summary: "Adversarial laboratory completed 12-round Salami attack simulation; budget ceiling verified",
    verdict: "BLOCK",
    severity: "success",
    provenance: { dataSource: "SIMULATED_TEST_FIXTURE", network: "testnet", isSimulated: true },
  },
  {
    id: "act-04",
    timestamp: "1 hour ago",
    type: "AUDIT",
    accountId: "market-maker-sub.testnet",
    summary: "Periodic security scan verified zero Full-Access keys and scoped method allowances",
    verdict: "ALLOW",
    severity: "info",
    provenance: { dataSource: "SIMULATED_TEST_FIXTURE", network: "testnet", isSimulated: true },
  },
];
