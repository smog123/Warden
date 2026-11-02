"use client";

import React, { useState } from "react";
import { Settings2, Shield, Radio, Check, AlertTriangle, Lock } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge, SimulatedBadge } from "@/components/ui/Badge";
import { APP_CONFIG } from "@/lib/constants";

export default function SettingsPage() {
  const [emergencyFreeze, setEmergencyFreeze] = useState(false);
  const [failClosedMode, setFailClosedMode] = useState(true);
  const [rpcEndpoint, setRpcEndpoint] = useState("https://test.rpc.fastnear.com");
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSave = () => {
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-warden-surface-border pb-5">
        <div>
          <h1 className="text-xl font-bold font-mono tracking-tight text-warden-text-primary">
            Security & Assurance Settings
          </h1>
          <p className="text-xs text-warden-text-secondary mt-1">
            Configure guard parameters, emergency circuit breakers, and NEAR testnet RPC routing
          </p>
        </div>
        <div className="flex items-center gap-2">
          <SimulatedBadge />
          <Badge variant="cyan">{APP_CONFIG.version}</Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Circuit Breaker & Safety Invariants */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-warden-accent" />
              <CardTitle>Autonomous Safety Invariants</CardTitle>
            </div>
            <span className="text-[10px] font-mono text-warden-status-allow flex items-center gap-1">
              <Radio className="w-2.5 h-2.5 animate-pulse" />
              ACTIVE
            </span>
          </CardHeader>

          <CardContent className="space-y-5 text-xs">
            {/* Emergency Freeze Toggle */}
            <div className="p-4 rounded-lg bg-warden-surface-base border border-warden-surface-border flex items-center justify-between">
              <div>
                <span className="font-semibold text-warden-text-primary block">
                  Global Emergency Freeze
                </span>
                <span className="text-[11px] text-warden-text-muted">
                  Immediately halts all pre-signature pipelines for all configured agents
                </span>
              </div>
              <button
                type="button"
                onClick={() => setEmergencyFreeze(!emergencyFreeze)}
                className={`px-3 py-1.5 rounded font-mono font-semibold transition-colors border ${
                  emergencyFreeze
                    ? "bg-warden-status-block text-white border-red-500 shadow-[0_0_12px_rgba(239,68,68,0.4)]"
                    : "bg-warden-surface-elevated text-warden-text-secondary border-warden-surface-border hover:text-white"
                }`}
              >
                {emergencyFreeze ? "FROZEN (BLOCKED)" : "ARMED (NORMAL)"}
              </button>
            </div>

            {/* Fail-Closed Policy Enforcement */}
            <div className="p-4 rounded-lg bg-warden-surface-base border border-warden-surface-border flex items-center justify-between">
              <div>
                <span className="font-semibold text-warden-text-primary block">
                  Fail-Closed Enforcement Mode
                </span>
                <span className="text-[11px] text-warden-text-muted">
                  If RPC or screening service is unreachable, reject the transaction (BLOCK)
                </span>
              </div>
              <button
                type="button"
                onClick={() => setFailClosedMode(!failClosedMode)}
                className={`px-3 py-1.5 rounded font-mono font-semibold transition-colors border ${
                  failClosedMode
                    ? "bg-warden-accent-muted text-warden-accent border-warden-accent-border"
                    : "bg-warden-surface-elevated text-warden-text-secondary border-warden-surface-border"
                }`}
              >
                {failClosedMode ? "STRICT (RECOMMENDED)" : "PERMISSIVE"}
              </button>
            </div>

            <div className="p-3 rounded bg-warden-surface-base border border-warden-surface-border flex items-center gap-2 text-warden-text-muted text-[11px]">
              <Lock className="w-3.5 h-3.5 text-warden-accent shrink-0" />
              <span>Zero-Custody: WARDEN never holds or accesses agent private keys.</span>
            </div>
          </CardContent>
        </Card>

        {/* RPC & Network Configuration */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Settings2 className="w-4 h-4 text-warden-accent" />
              <CardTitle>NEAR Network Configuration</CardTitle>
            </div>
            <Badge variant="cyan">{APP_CONFIG.network}</Badge>
          </CardHeader>

          <CardContent className="space-y-5 text-xs">
            <div>
              <label className="font-mono text-[11px] text-warden-text-muted block mb-1.5 uppercase">
                Active JSON-RPC Provider Endpoint
              </label>
              <input
                type="text"
                value={rpcEndpoint}
                onChange={(e) => setRpcEndpoint(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded bg-warden-surface-base border border-warden-surface-border text-xs font-mono text-warden-text-primary focus:outline-none focus:border-warden-accent"
              />
            </div>

            <div className="space-y-2">
              <span className="font-mono text-[11px] text-warden-text-muted block uppercase">
                Recommended Testnet Providers
              </span>
              <div className="space-y-1.5">
                {[
                  "https://test.rpc.fastnear.com",
                  "https://rpc.testnet.near.org",
                ].map((endpoint) => (
                  <button
                    key={endpoint}
                    type="button"
                    onClick={() => setRpcEndpoint(endpoint)}
                    className={`w-full text-left p-2.5 rounded font-mono text-[11px] border flex items-center justify-between transition-colors ${
                      rpcEndpoint === endpoint
                        ? "bg-warden-surface-elevated text-warden-accent border-warden-accent-border"
                        : "bg-warden-surface-base text-warden-text-secondary border-warden-surface-border hover:bg-warden-surface-elevated/50"
                    }`}
                  >
                    <span>{endpoint}</span>
                    {rpcEndpoint === endpoint && <Check className="w-3.5 h-3.5" />}
                  </button>
                ))}
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <Button variant="primary" size="sm" onClick={handleSave}>
                {savedSuccess ? (
                  <>
                    <Check className="w-3.5 h-3.5 mr-1" /> Settings Saved
                  </>
                ) : (
                  "Save Preferences"
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
