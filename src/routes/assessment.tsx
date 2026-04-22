import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { useStore } from "@/lib/store";
import {
  calculateReadinessScore,
  classifyReadiness,
  CHART_COLORS,
} from "@/lib/calculations";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ResponsiveContainer,
} from "recharts";

export const Route = createFileRoute("/assessment")({
  component: AssessmentPage,
  head: () => ({
    meta: [
      { title: "Readiness Assessment — IDSS" },
      { name: "description", content: "Evaluate organisational readiness for legacy system modernisation." },
    ],
  }),
});

function AssessmentPage() {
  const { state, setAssessment } = useStore();
  const projectId = state.currentProjectId;

  const [technical, setTechnical] = useState(3);
  const [dataReadiness, setDataReadiness] = useState(3);
  const [security, setSecurity] = useState(3);
  const [operational, setOperational] = useState(3);

  useEffect(() => {
    if (projectId && state.assessments[projectId]) {
      const a = state.assessments[projectId];
      setTechnical(a.technical);
      setDataReadiness(a.data);
      setSecurity(a.security);
      setOperational(a.operational);
    } else {
      setTechnical(3);
      setDataReadiness(3);
      setSecurity(3);
      setOperational(3);
    }
  }, [projectId]);

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

  const score = calculateReadinessScore(technical, dataReadiness, security, operational);
  const classification = classifyReadiness(score);

  const radarData = [
    { subject: "Technical", value: technical },
    { subject: "Data", value: dataReadiness },
    { subject: "Security", value: security },
    { subject: "Operational", value: operational },
  ];

  const handleSave = () => {
    setAssessment(projectId, {
      technical,
      data: dataReadiness,
      security,
      operational,
    });
    toast.success("Assessment saved");
  };

  const dimensions = [
    { label: "Technical Readiness", value: technical, setter: setTechnical, weight: "35%" },
    { label: "Data Readiness", value: dataReadiness, setter: setDataReadiness, weight: "25%" },
    { label: "Security & Compliance", value: security, setter: setSecurity, weight: "20%" },
    { label: "Operational Readiness", value: operational, setter: setOperational, weight: "20%" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Readiness Assessment</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Evaluate readiness across four key dimensions
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Assessment Criteria</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {dimensions.map((dim) => (
              <div key={dim.label}>
                <div className="flex items-center justify-between mb-2">
                  <Label className="text-sm">{dim.label}</Label>
                  <span className="text-xs text-muted-foreground">
                    Weight: {dim.weight} | Score: {dim.value}
                  </span>
                </div>
                <Slider
                  value={[dim.value]}
                  onValueChange={([v]) => dim.setter(v)}
                  min={1}
                  max={5}
                  step={1}
                  className="w-full"
                />
                <div className="flex justify-between mt-1 text-[10px] text-muted-foreground">
                  <span>1 - Very Low</span>
                  <span>3 - Moderate</span>
                  <span>5 - Very High</span>
                </div>
              </div>
            ))}
            <Button onClick={handleSave} className="w-full">
              Save Assessment
            </Button>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Readiness Radar</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={280}>
                <RadarChart data={radarData}>
                  <PolarGrid stroke="#e2e8f0" />
                  <PolarAngleAxis dataKey="subject" tick={{ fontSize: 12 }} />
                  <PolarRadiusAxis domain={[0, 5]} tick={{ fontSize: 10 }} tickCount={6} />
                  <Radar
                    dataKey="value"
                    stroke={CHART_COLORS.accent}
                    fill={CHART_COLORS.accent}
                    fillOpacity={0.25}
                    strokeWidth={2}
                  />
                </RadarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Overall Score</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center mb-4">
                <p className="text-4xl font-bold">{score.toFixed(2)}</p>
                <p className="text-sm text-muted-foreground mt-1">out of 5.00</p>
              </div>
              <Progress value={(score / 5) * 100} className="h-3 mb-3" />
              <div className="flex items-center justify-between">
                <Badge
                  variant={
                    classification === "High"
                      ? "default"
                      : classification === "Medium"
                        ? "secondary"
                        : "destructive"
                  }
                >
                  {classification} Readiness
                </Badge>
                <span className="text-xs text-muted-foreground">
                  {classification === "High"
                    ? "Organisation is well-prepared"
                    : classification === "Medium"
                      ? "Further preparation recommended"
                      : "Significant preparation needed"}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
