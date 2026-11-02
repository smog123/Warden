export interface AgentIdentity {
  agentId: string;
  name: string;
  assignedAccount: string;
  framework?: "near-ai" | "eliza" | "langchain" | "custom";
  runtimeModel?: string;
  isAutonomous: boolean;
  activePolicyId: string;
  emergencyFreeze: boolean;
  createdAt: string;
  updatedAt: string;
}
