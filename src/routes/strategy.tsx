import { createFileRoute, Link } from "@tanstack/react-router";
import { useStore } from "@/lib/store";
import {
  calculateReadinessScore,
  classifyReadiness,
  calculateAggregateRisk,
  classifyRisk,
  recommendStrategy,
  getStrategyJustification,
} from "@/lib/calculations";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Target, AlertTriangle, CheckCircle2, Info } from "lucide-react";

export const Route = createFileRoute("/strategy")({
  component: StrategyPage,
  head: () => ({
    meta: [
      { title: "Strategy Analysis — IDSS" },
      { name: "description", content: "AI-recommended migration strategy based on project data." },
    ],
  }),
});

const strategyComparison = [
  { strategy: "Big Bang", risk: "High", cost: "Low", complexity: "Low", timeline: "Short" },
  { strategy: "Phased", risk: "Medium", cost: "Medium", complexity: "Medium", timeline: "Medium" },
  { strategy: "Parallel Running", risk: "Low", cost: "High", complexity: "High", timeline: "Long" },
];

function StrategyPage() {
  const { state } = useStore();
  const projectId = state.currentProjectId;

  if (!projectId) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh]">
        <p className="text-muted-foreground">Please select a project first</p>
        <Link to="/projects" className="text-accent text-sm mt-2">
          Go to Projects →
        </Link>
      </div>
    );
  }

  const project = state.projects.find((p) => p.id === projectId);
  const assessment = state.assessments[projectId];
  const risks = state.risks[projectId] || [];

  if (!assessment || risks.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh]">
        <Info className="h-10 w-10 text-muted-foreground/50 mb-4" />
        <p className="text-muted-foreground">
          Complete the <Link to="/assessment" className="text-accent underline">Readiness Assessment</Link> and{" "}
          <Link to="/risk-analysis" className="text-accent underline">Risk Analysis</Link> first.
        </p>
      </div>
    );
  }

  const readiness = calculateReadinessScore(
    assessment.technical,
    assessment.data,
    assessment.security,
    assessment.operational
  );
  const aggRisk = calculateAggregateRisk(risks);
  const strategy = recommendStrategy(readiness, aggRisk, project!.criticality);
  const justification = getStrategyJustification(strategy, readiness, aggRisk, project!.criticality);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Strategy Analysis</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Migration strategy recommendation based on assessment data
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card>
          <CardContent className="pt-6 text-center">
            <p className="text-xs text-muted-foreground">Readiness Score</p>
            <p className="text-2xl font-bold mt-1">{readiness.toFixed(2)}</p>
            <Badge
              variant={classifyReadiness(readiness) === "High" ? "default" : classifyReadiness(readiness) === "Medium" ? "secondary" : "destructive"}
              className="mt-2"
            >
              {classifyReadiness(readiness)}
            </Badge>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6 text-center">
            <p className="text-xs text-muted-foreground">Aggregate Risk</p>
            <p className="text-2xl font-bold mt-1">{aggRisk.toFixed(1)}</p>
            <Badge
              variant={classifyRisk(aggRisk) === "High" ? "destructive" : classifyRisk(aggRisk) === "Medium" ? "secondary" : "outline"}
              className="mt-2"
            >
              {classifyRisk(aggRisk)}
            </Badge>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6 text-center">
            <p className="text-xs text-muted-foreground">System Criticality</p>
            <p className="text-2xl font-bold mt-1">{project!.criticality}</p>
            <Badge variant={project!.criticality === "High" ? "destructive" : "outline"} className="mt-2">
              {project!.systemType}
            </Badge>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Recommended Strategy</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-start gap-4">
            <div className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-xl bg-accent/10">
              {strategy === "Big Bang" ? (
                <AlertTriangle className="h-7 w-7 text-accent" />
              ) : strategy === "Phased" ? (
                <Target className="h-7 w-7 text-accent" />
              ) : (
                <CheckCircle2 className="h-7 w-7 text-accent" />
              )}
            </div>
            <div>
              <h3 className="text-xl font-bold">{strategy}</h3>
              <p className="text-sm text-muted-foreground mt-2 leading-relaxed">
                {justification}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Strategy Comparison</CardTitle>
        </CardHeader>
        <CardContent>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-left">
                <th className="pb-2 font-medium text-muted-foreground">Strategy</th>
                <th className="pb-2 font-medium text-muted-foreground">Risk</th>
                <th className="pb-2 font-medium text-muted-foreground">Cost</th>
                <th className="pb-2 font-medium text-muted-foreground">Complexity</th>
                <th className="pb-2 font-medium text-muted-foreground">Timeline</th>
              </tr>
            </thead>
            <tbody>
              {strategyComparison.map((s) => (
                <tr
                  key={s.strategy}
                  className={`border-b last:border-0 ${s.strategy === strategy ? "bg-accent/5" : ""}`}
                >
                  <td className="py-3 font-medium">
                    {s.strategy}
                    {s.strategy === strategy && (
                      <Badge className="ml-2" variant="default">Recommended</Badge>
                    )}
                  </td>
                  <td className="py-3">
                    <Badge variant={s.risk === "High" ? "destructive" : s.risk === "Medium" ? "secondary" : "outline"}>
                      {s.risk}
                    </Badge>
                  </td>
                  <td className="py-3">
                    <Badge variant={s.cost === "High" ? "destructive" : s.cost === "Medium" ? "secondary" : "outline"}>
                      {s.cost}
                    </Badge>
                  </td>
                  <td className="py-3">
                    <Badge variant={s.complexity === "High" ? "destructive" : s.complexity === "Medium" ? "secondary" : "outline"}>
                      {s.complexity}
                    </Badge>
                  </td>
                  <td className="py-3 text-muted-foreground">{s.timeline}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}
