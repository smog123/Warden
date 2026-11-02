"use client";

import React, { useState } from "react";
import { FlaskConical, ShieldAlert, Play, CheckCircle2, AlertOctagon, Terminal, Radio } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge, VerdictBadge, SimulatedBadge } from "@/components/ui/Badge";
import { SAMPLE_ATTACK_FINDINGS } from "@/lib/constants";

export default function AttackLabPage() {
  const [selectedScenarioId, setSelectedScenarioId] = useState(SAMPLE_ATTACK_FINDINGS[0].scenarioId);
  const [isRunning, setIsRunning] = useState(false);
  const [executionLog, setExecutionLog] = useState<string[]>([
    "[INIT] Adversarial Attack Laboratory initialized.",
    "[READY] Safe sandbox environment active on NEAR Testnet fixtures.",
    "[INFO] Select an attack scenario and click 'Execute Attack Simulation'.",
  ]);

  const activeScenario = SAMPLE_ATTACK_FINDINGS.find((s) => s.scenarioId === selectedScenarioId) || SAMPLE_ATTACK_FINDINGS[0];

  const handleRunSimulation = () => {
    setIsRunning(true);
    setExecutionLog([
      `[SIMULATION_START] Launching scenario: ${activeScenario.scenarioName}`,
      `[STEP_1] Constructing adversarial prompt injection payload for target: ${activeScenario.targetAccount}...`,
      `[STEP_2] Agent LLM proposes action: "${activeScenario.intendedAction}"`,
      `[STEP_3] Action intercepted by @warden/guard pre-signature middleware...`,
      `[STEP_4] Evaluating policy invariants: limits, recipient whitelist, and counterparty reputation...`,
      `[HALT] Policy violation detected: ${activeScenario.violationCode}`,
      `[DECISION] Verdict: ${activeScenario.verdict} — Cryptographic signing halted. Zero transactions broadcasted.`,
    ]);

    setTimeout(() => {
      setIsRunning(false);
    }, 600);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-warden-surface-border pb-5">
        <div>
          <h1 className="text-xl font-bold font-mono tracking-tight text-warden-text-primary">
            Adversarial Attack Laboratory
          </h1>
          <p className="text-xs text-warden-text-secondary mt-1">
            Simulate prompt injections, salami splitting, address redirects & freeze evasion in safe sandbox
          </p>
        </div>
        <div className="flex items-center gap-2">
          <SimulatedBadge />
          <Badge variant="cyan">Lab Sandbox</Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Scenario Selector */}
        <div className="space-y-3">
          <h3 className="text-xs font-mono font-semibold uppercase tracking-wider text-warden-text-muted">
            Select Attack Vector
          </h3>

          <div className="space-y-2">
            {SAMPLE_ATTACK_FINDINGS.map((scenario) => {
              const isSelected = scenario.scenarioId === selectedScenarioId;
              return (
                <div
                  key={scenario.scenarioId}
                  onClick={() => setSelectedScenarioId(scenario.scenarioId)}
                  className={`p-3.5 rounded-lg border cursor-pointer transition-all ${
                    isSelected
                      ? "bg-warden-surface-elevated border-warden-accent text-warden-text-primary shadow-sm"
                      : "bg-warden-surface-card border-warden-surface-border text-warden-text-secondary hover:text-warden-text-primary hover:bg-warden-surface-elevated/50"
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-semibold tracking-wide">
                      {scenario.scenarioName}
                    </span>
                    <VerdictBadge verdict={scenario.verdict} />
                  </div>
                  <span className="text-[11px] font-mono text-warden-text-muted block truncate">
                    Vector: {scenario.vector}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Execution & Trace Console */}
        <div className="lg:col-span-2 space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <FlaskConical className="w-4 h-4 text-warden-accent" />
                <CardTitle>{activeScenario.scenarioName}</CardTitle>
              </div>
              <Button
                variant="primary"
                size="sm"
                isLoading={isRunning}
                onClick={handleRunSimulation}
              >
                <Play className="w-3.5 h-3.5 mr-1" />
                Execute Attack Simulation
              </Button>
            </CardHeader>

            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-3 text-xs font-mono">
                <div className="p-3 rounded bg-warden-surface-base border border-warden-surface-border">
                  <span className="text-[10px] text-warden-text-muted uppercase block">
                    Adversarial Payload
                  </span>
                  <span className="text-warden-text-primary font-medium mt-1 block truncate">
                    {activeScenario.intendedAction}
                  </span>
                </div>

                <div className="p-3 rounded bg-warden-surface-base border border-warden-surface-border">
                  <span className="text-[10px] text-warden-text-muted uppercase block">
                    Expected Verdict
                  </span>
                  <span className="text-warden-status-block font-medium mt-1 block flex items-center gap-1.5">
                    <AlertOctagon className="w-3.5 h-3.5" />
                    HALT PRE-SIGN ({activeScenario.violationCode})
                  </span>
                </div>
              </div>

              {/* Execution Trace Terminal */}
              <div>
                <div className="flex items-center justify-between text-xs font-mono text-warden-text-muted mb-1.5">
                  <span className="flex items-center gap-1.5">
                    <Terminal className="w-3.5 h-3.5 text-warden-accent" />
                    Guard Execution Trace
                  </span>
                  <span className="text-[10px] text-warden-status-allow flex items-center gap-1">
                    <Radio className="w-2.5 h-2.5 animate-pulse" />
                    Live Trace Active
                  </span>
                </div>

                <div className="p-4 rounded-lg bg-black border border-warden-surface-border font-mono text-xs text-slate-300 space-y-1.5 max-h-64 overflow-y-auto">
                  {executionLog.map((log, index) => (
                    <div
                      key={index}
                      className={
                        log.includes("[HALT]") || log.includes("DECISION")
                          ? "text-warden-status-block font-semibold"
                          : log.includes("intercepted") || log.includes("STEP_3")
                          ? "text-warden-accent"
                          : "text-slate-400"
                      }
                    >
                      {log}
                    </div>
                  ))}
                </div>
              </div>

              <div className="p-3 rounded bg-warden-surface-base border border-warden-surface-border text-xs flex items-center justify-between">
                <span className="text-warden-text-muted">Security Invariant:</span>
                <span className="text-warden-status-allow font-mono font-medium flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  No private keys exposed. Zero unauthorized transactions broadcasted.
                </span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
