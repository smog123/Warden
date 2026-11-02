import { RuleSeverity } from "./decision";

export interface SecurityFinding {
  findingId: string;
  category:
    | "UNAUTHORIZED_RECIPIENT"
    | "UNAPPROVED_CONTRACT"
    | "UNAPPROVED_METHOD"
    | "EXCESSIVE_VALUE"
    | "SPENDING_LIMIT_EXHAUSTED"
    | "AUTHORIZATION_EXPIRED"
    | "UNRECOGNIZED_PATHWAY"
    | "UNRESTRICTED_PERMISSION"
    | "INCOMPLETE_POLICY"
    | "SUSPICIOUS_COUNTERPARTY"
    | "EMERGENCY_FROZEN"
    | "RATE_LIMIT_EXCEEDED";
  title: string;
  description: string;
  severity: RuleSeverity;
  ruleId: string;
  targetAccount?: string;
  remediation: string;
  detectedAt: string;
}
