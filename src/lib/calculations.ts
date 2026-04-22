export function calculateReadinessScore(
  technical: number,
  data: number,
  security: number,
  operational: number
): number {
  return technical * 0.35 + data * 0.25 + security * 0.2 + operational * 0.2;
}

export function classifyReadiness(score: number): "High" | "Medium" | "Low" {
  if (score >= 4.0) return "High";
  if (score >= 2.5) return "Medium";
  return "Low";
}

export function calculateRiskScore(probability: number, impact: number): number {
  return probability * impact;
}

export function classifyRisk(score: number): "Low" | "Medium" | "High" {
  if (score <= 5) return "Low";
  if (score <= 15) return "Medium";
  return "High";
}

export function calculateAggregateRisk(
  risks: { probability: number; impact: number }[]
): number {
  if (risks.length === 0) return 0;
  const total = risks.reduce((sum, r) => sum + r.probability * r.impact, 0);
  return total / risks.length;
}

export function recommendStrategy(
  readiness: number,
  riskScore: number,
  criticality: "Low" | "Medium" | "High"
): "Big Bang" | "Phased" | "Parallel Running" {
  if (readiness >= 4 && riskScore < 8 && criticality === "Low") return "Big Bang";
  if (readiness >= 2.5 && readiness < 4 && riskScore >= 8 && riskScore <= 15) return "Phased";
  return "Parallel Running";
}

export function getStrategyJustification(
  strategy: string,
  readiness: number,
  riskScore: number,
  criticality: string
): string {
  switch (strategy) {
    case "Big Bang":
      return `With high readiness (${readiness.toFixed(1)}), low risk score (${riskScore.toFixed(1)}), and ${criticality} system criticality, a Big Bang migration is recommended. This approach enables rapid, cost-effective transition with minimal operational overlap.`;
    case "Phased":
      return `With medium readiness (${readiness.toFixed(1)}) and moderate risk (${riskScore.toFixed(1)}), a Phased migration strategy is recommended. This incremental approach reduces exposure while allowing progressive validation of each migration stage.`;
    default:
      return `Given ${readiness < 2.5 ? "low organisational readiness" : criticality === "High" ? "high system criticality" : "elevated risk levels"} (Readiness: ${readiness.toFixed(1)}, Risk: ${riskScore.toFixed(1)}, Criticality: ${criticality}), Parallel Running is recommended to maintain system continuity and provide a safety net during transition.`;
  }
}

export function calculateChangeReadiness(
  trainingLevel: number,
  resistanceLevel: "Low" | "Medium" | "High"
): number {
  const resistanceInverse =
    resistanceLevel === "High" ? 1 : resistanceLevel === "Medium" ? 3 : 5;
  return trainingLevel * 0.6 + resistanceInverse * 0.4;
}

export function calculateMaturityIndex(
  readiness: number,
  riskScore: number,
  changeReadiness: number
): number {
  return readiness * 0.4 + ((25 - riskScore) * 0.3) / 5 + changeReadiness * 0.3;
}

export function classifyMaturity(
  index: number
): { level: number; label: string } {
  if (index >= 3.5) return { level: 3, label: "Transformation Ready" };
  if (index >= 2.5) return { level: 2, label: "Partially Ready" };
  return { level: 1, label: "Not Ready" };
}

export function calculateSuccessScore(
  adoption: number,
  reliability: number,
  satisfaction: number,
  efficiency: number
): number {
  return (adoption + reliability + satisfaction * 20 + efficiency) / 4;
}

export const CHART_COLORS = {
  primary: "#4f46e5",
  accent: "#0891b2",
  success: "#059669",
  warning: "#d97706",
  danger: "#dc2626",
  muted: "#94a3b8",
};
