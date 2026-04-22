import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { useStore } from "@/lib/store";
import { calculateSuccessScore, CHART_COLORS } from "@/lib/calculations";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

export const Route = createFileRoute("/evaluation")({
  component: EvaluationPage,
  head: () => ({
    meta: [
      { title: "Evaluation — IDSS" },
      { name: "description", content: "Post-implementation evaluation and success metrics." },
    ],
  }),
});

function EvaluationPage() {
  const { state, setEvaluation } = useStore();
  const projectId = state.currentProjectId;

  const [adoption, setAdoption] = useState(75);
  const [reliability, setReliability] = useState(95);
  const [satisfaction, setSatisfaction] = useState(3);
  const [efficiency, setEfficiency] = useState(50);

  useEffect(() => {
    if (projectId && state.evaluations[projectId]) {
      const e = state.evaluations[projectId];
      setAdoption(e.adoptionRate);
      setReliability(e.systemReliability);
      setSatisfaction(e.userSatisfaction);
      setEfficiency(e.efficiencyImprovement);
    } else {
      setAdoption(75);
      setReliability(95);
      setSatisfaction(3);
      setEfficiency(50);
    }
  }, [projectId]);

  if (!projectId) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh]">
        <p className="text-muted-foreground">Please select a project first</p>
        <Link to="/projects" className="text-accent text-sm mt-2">Go to Projects →</Link>
      </div>
    );
  }

  const successScore = calculateSuccessScore(adoption, reliability, satisfaction, efficiency);

  const handleSave = () => {
    setEvaluation(projectId, {
      adoptionRate: adoption,
      systemReliability: reliability,
      userSatisfaction: satisfaction,
      efficiencyImprovement: efficiency,
    });
    toast.success("Evaluation saved");
  };

  const chartData = [
    { name: "Adoption", value: adoption },
    { name: "Reliability", value: reliability },
    { name: "Satisfaction", value: satisfaction * 20 },
    { name: "Efficiency", value: efficiency },
  ];

  const getRating = (score: number) => {
    if (score >= 80) return "Excellent";
    if (score >= 60) return "Good";
    if (score >= 40) return "Fair";
    return "Poor";
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Post-Implementation Evaluation</h1>
        <p className="text-sm text-muted-foreground mt-1">Measure migration success</p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader><CardTitle className="text-sm">Metrics</CardTitle></CardHeader>
          <CardContent className="space-y-5">
            <div>
              <div className="flex justify-between mb-2"><Label>Adoption Rate</Label><span className="text-xs text-muted-foreground">{adoption}%</span></div>
              <Slider value={[adoption]} onValueChange={([v]) => setAdoption(v)} min={0} max={100} step={1} />
            </div>
            <div>
              <div className="flex justify-between mb-2"><Label>System Reliability (Uptime)</Label><span className="text-xs text-muted-foreground">{reliability}%</span></div>
              <Slider value={[reliability]} onValueChange={([v]) => setReliability(v)} min={0} max={100} step={1} />
            </div>
            <div>
              <div className="flex justify-between mb-2"><Label>User Satisfaction</Label><span className="text-xs text-muted-foreground">{satisfaction}/5</span></div>
              <Slider value={[satisfaction]} onValueChange={([v]) => setSatisfaction(v)} min={1} max={5} step={1} />
            </div>
            <div>
              <div className="flex justify-between mb-2"><Label>Efficiency Improvement</Label><span className="text-xs text-muted-foreground">{efficiency}%</span></div>
              <Slider value={[efficiency]} onValueChange={([v]) => setEfficiency(v)} min={0} max={100} step={1} />
            </div>
            <Button onClick={handleSave} className="w-full">Save Evaluation</Button>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader><CardTitle className="text-sm">Success Score</CardTitle></CardHeader>
            <CardContent>
              <div className="text-center mb-4">
                <p className="text-5xl font-bold">{successScore.toFixed(1)}</p>
                <p className="text-sm text-muted-foreground mt-1">out of 100</p>
              </div>
              <Progress value={successScore} className="h-3 mb-3" />
              <div className="text-center">
                <Badge variant={successScore >= 70 ? "default" : successScore >= 50 ? "secondary" : "destructive"}>
                  {getRating(successScore)}
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground mt-3 text-center">
                Formula: (Adoption + Reliability + (Satisfaction×20) + Efficiency) / 4
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle className="text-sm">Metrics Comparison</CardTitle></CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                  <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Bar dataKey="value" fill={CHART_COLORS.accent} radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
