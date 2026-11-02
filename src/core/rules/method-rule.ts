import { SecurityRule, RuleEvaluationContext, RuleEvaluationResult } from "./types";
import { toBigIntYocto } from "../math/yocto";

export const RULE_UNAPPROVED_METHOD_ID = "RULE_UNAPPROVED_METHOD";

export class UnapprovedMethodRule implements SecurityRule {
  readonly ruleId = RULE_UNAPPROVED_METHOD_ID;
  readonly name = "Contract Method Authorization Rule";
  readonly description = "Enforces method-level restrictions and zero-deposit requirements on contract invocations.";

  evaluate(context: RuleEvaluationContext): RuleEvaluationResult {
    const { action, policy } = context;

    if (action.pathway !== "FUNCTION_CALL" && action.pathway !== "NEP141_TRANSFER") {
      return {
        ruleId: this.ruleId,
        passed: true,
        decision: "ALLOW",
        severity: "info",
        reason: "Action is not a smart contract call; method rule skipped.",
      };
    }

    if (!action.methodName) {
      return {
        ruleId: this.ruleId,
        passed: false,
        decision: "BLOCK",
        severity: "high",
        reason: "Contract call action did not specify a method name.",
        suggestedRemediation: "Specify an explicit methodName for contract function calls.",
      };
    }

    const target = action.receiverId.trim().toLowerCase();
    const contractConfig = (policy.approvedContracts || []).find(
      (c) => c.contractId.trim().toLowerCase() === target
    );

    if (!contractConfig) {
      // Contract rule handles unapproved contract
      return {
        ruleId: this.ruleId,
        passed: false,
        decision: "BLOCK",
        severity: "high",
        reason: `Contract "${action.receiverId}" has no method configuration in policy.`,
      };
    }

    const requestedMethod = action.methodName.trim();
    const allowedMethods = contractConfig.allowedMethods || [];

    // If allowedMethods is empty array, it means NO methods are authorized (or wildcard is strictly rejected)
    if (allowedMethods.length === 0) {
      return {
        ruleId: this.ruleId,
        passed: false,
        decision: "BLOCK",
        severity: "critical",
        reason: `Contract "${action.receiverId}" has zero allowed methods configured (wildcard calls prohibited).`,
        evidence: {
          ruleId: this.ruleId,
          category: "WILDCARD_METHOD_PROHIBITED",
          observed: requestedMethod,
          expected: "Non-empty allowedMethods list",
          description: "Policy forbids wildcard method calls; explicit method whitelist required.",
        },
        suggestedRemediation: `Explicitly add "${requestedMethod}" to allowedMethods for contract "${action.receiverId}".`,
      };
    }

    if (!allowedMethods.includes(requestedMethod)) {
      return {
        ruleId: this.ruleId,
        passed: false,
        decision: "BLOCK",
        severity: "high",
        reason: `Method "${requestedMethod}" is not in the approved methods list for contract "${action.receiverId}".`,
        evidence: {
          ruleId: this.ruleId,
          category: "UNAPPROVED_METHOD",
          observed: requestedMethod,
          expected: allowedMethods,
          description: `Contract method call rejected because it is not explicitly whitelisted.`,
        },
        suggestedRemediation: `Add "${requestedMethod}" to contract's allowedMethods in policy if authorized.`,
      };
    }

    // Check zero-deposit constraint if configured
    if (contractConfig.requireZeroDeposit) {
      const deposit = toBigIntYocto(action.amountYocto || "0");
      if (deposit > 0n) {
        return {
          ruleId: this.ruleId,
          passed: false,
          decision: "BLOCK",
          severity: "high",
          reason: `Contract method "${requestedMethod}" requires zero attached deposit, but ${action.amountYocto} yoctoNEAR was attached.`,
          evidence: {
            ruleId: this.ruleId,
            category: "NON_ZERO_DEPOSIT_PROHIBITED",
            observed: action.amountYocto,
            expected: "0",
            description: "Method strictly requires 0 yoctoNEAR deposit.",
          },
          suggestedRemediation: "Set attached deposit to 0 yoctoNEAR for this method call.",
        };
      }
    }

    return {
      ruleId: this.ruleId,
      passed: true,
      decision: "ALLOW",
      severity: "info",
      reason: `Method "${requestedMethod}" is authorized on contract "${action.receiverId}".`,
    };
  }
}
