import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { useStore } from "@/lib/store";
import {
  calculateRiskScore,
  classifyRisk,
  calculateAggregateRisk,
} from "@/lib/calculations";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/risk-analysis")({
  component: RiskAnalysisPage,
  head: () => ({
    meta: [
      { title: "Risk Analysis — IDSS" },
      { name: "description", content: "Identify and analyse risks for migration projects." },
    ],
  }),
});

function RiskAnalysisPage() {
  const { state, addRisk, deleteRisk } = useStore();
  const projectId = state.currentProjectId;

  const [riskName, setRiskName] = useState("");
  const [probability, setProbability] = useState(3);
  const [impact, setImpact] = useState(3);

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

  const risks = state.risks[projectId] || [];
  const aggRisk = calculateAggregateRisk(risks);

  const handleAdd = () => {
    if (!riskName.trim()) {
      toast.error("Please enter a risk name");
      return;
    }
    addRisk(projectId, { name: riskName, probability, impact });
    setRiskName("");
    setProbability(3);
    setImpact(3);
    toast.success("Risk added");
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Risk Analysis</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Identify risks and visualise their impact
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Add Risk</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Risk Name</Label>
              <Input
                value={riskName}
                onChange={(e) => setRiskName(e.target.value)}
                placeholder="e.g. Data Loss During Migration"
              />
            </div>
            <div>
              <div className="flex items-center justify-between mb-2">
                <Label>Probability</Label>
                <span className="text-xs text-muted-foreground">{probability}</span>
              </div>
              <Slider
                value={[probability]}
                onValueChange={([v]) => setProbability(v)}
                min={1}
                max={5}
                step={1}
              />
            </div>
            <div>
              <div className="flex items-center justify-between mb-2">
                <Label>Impact</Label>
                <span className="text-xs text-muted-foreground">{impact}</span>
              </div>
              <Slider
                value={[impact]}
                onValueChange={([v]) => setImpact(v)}
                min={1}
                max={5}
                step={1}
              />
            </div>
            <div className="rounded-md bg-muted p-3 text-center">
              <p className="text-xs text-muted-foreground">Risk Score</p>
              <p className="text-2xl font-bold">{calculateRiskScore(probability, impact)}</p>
              <Badge
                variant={
                  classifyRisk(calculateRiskScore(probability, impact)) === "High"
                    ? "destructive"
                    : classifyRisk(calculateRiskScore(probability, impact)) === "Medium"
                      ? "secondary"
                      : "outline"
                }
                className="mt-1"
              >
                {classifyRisk(calculateRiskScore(probability, impact))}
              </Badge>
            </div>
            <Button onClick={handleAdd} className="w-full">
              <Plus className="mr-2 h-4 w-4" /> Add Risk
            </Button>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm">Risk Heatmap</CardTitle>
              {aggRisk > 0 && (
                <div className="text-right">
                  <p className="text-xs text-muted-foreground">Aggregate Risk</p>
                  <p className="text-lg font-bold">{aggRisk.toFixed(1)}</p>
                </div>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <RiskHeatmap risks={risks} />
          </CardContent>
        </Card>
      </div>

      {risks.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Risk Register ({risks.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left">
                  <th className="pb-2 font-medium text-muted-foreground">Risk</th>
                  <th className="pb-2 font-medium text-muted-foreground">Probability</th>
                  <th className="pb-2 font-medium text-muted-foreground">Impact</th>
                  <th className="pb-2 font-medium text-muted-foreground">Score</th>
                  <th className="pb-2 font-medium text-muted-foreground">Category</th>
                  <th className="pb-2 font-medium text-muted-foreground"></th>
                </tr>
              </thead>
              <tbody>
                {risks.map((r) => {
                  const score = calculateRiskScore(r.probability, r.impact);
                  return (
                    <tr key={r.id} className="border-b last:border-0">
                      <td className="py-2.5 font-medium">{r.name}</td>
                      <td className="py-2.5">{r.probability}</td>
                      <td className="py-2.5">{r.impact}</td>
                      <td className="py-2.5 font-bold">{score}</td>
                      <td className="py-2.5">
                        <Badge
                          variant={
                            classifyRisk(score) === "High"
                              ? "destructive"
                              : classifyRisk(score) === "Medium"
                                ? "secondary"
                                : "outline"
                          }
                        >
                          {classifyRisk(score)}
                        </Badge>
                      </td>
                      <td className="py-2.5">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            deleteRisk(projectId, r.id);
                            toast.success("Risk removed");
                          }}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function RiskHeatmap({ risks }: { risks: Array<{ probability: number; impact: number; name: string }> }) {
  const getCellColor = (prob: number, imp: number) => {
    const score = prob * imp;
    if (score <= 5) return "bg-heatmap-low";
    if (score <= 15) return "bg-heatmap-medium";
    return "bg-heatmap-high";
  };

  return (
    <div>
      <div className="flex items-center gap-2 mb-2 text-xs text-muted-foreground">
        <span>Impact ↑</span>
        <span className="ml-auto">Probability →</span>
      </div>
      <div className="grid grid-cols-6 gap-px rounded-lg overflow-hidden border">
        <div className="bg-card p-2 text-[10px] font-medium text-muted-foreground text-center">
          I \ P
        </div>
        {[1, 2, 3, 4, 5].map((p) => (
          <div key={`h-${p}`} className="bg-card p-2 text-[10px] font-medium text-center text-muted-foreground">
            {p}
          </div>
        ))}
        {[5, 4, 3, 2, 1].map((imp) => (
          <div key={`row-${imp}`} className="contents">
            <div className="bg-card p-2 text-[10px] font-medium text-center text-muted-foreground">
              {imp}
            </div>
            {[1, 2, 3, 4, 5].map((prob) => {
              const cellRisks = risks.filter(
                (r) => r.probability === prob && r.impact === imp
              );
              const score = prob * imp;
              return (
                <div
                  key={`${prob}-${imp}`}
                  className={`${getCellColor(prob, imp)} relative flex items-center justify-center p-2 min-h-[44px] transition-opacity`}
                  title={cellRisks.map((r) => r.name).join(", ") || `Score: ${score}`}
                >
                  <span className="text-[10px] opacity-60">{score}</span>
                  {cellRisks.length > 0 && (
                    <span className="absolute top-0.5 right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-foreground text-[9px] font-bold text-background">
                      {cellRisks.length}
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        ))}
      </div>
      <div className="flex items-center gap-4 mt-3 text-[10px]">
        <div className="flex items-center gap-1">
          <div className="h-3 w-3 rounded-sm bg-heatmap-low" /> Low (1–5)
        </div>
        <div className="flex items-center gap-1">
          <div className="h-3 w-3 rounded-sm bg-heatmap-medium" /> Medium (6–15)
        </div>
        <div className="flex items-center gap-1">
          <div className="h-3 w-3 rounded-sm bg-heatmap-high" /> High (16–25)
        </div>
      </div>
    </div>
  );
}
