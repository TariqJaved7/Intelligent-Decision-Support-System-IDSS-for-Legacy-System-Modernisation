import { createFileRoute, Link } from "@tanstack/react-router";
import { useStore } from "@/lib/store";
import {
  calculateReadinessScore,
  classifyReadiness,
  calculateAggregateRisk,
  classifyRisk,
  calculateChangeReadiness,
  calculateMaturityIndex,
  classifyMaturity,
  recommendStrategy,
  CHART_COLORS,
} from "@/lib/calculations";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  FolderKanban,
  Activity,
  ShieldAlert,
  Target,
  TrendingUp,
  ArrowRight,
} from "lucide-react";
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";

export const Route = createFileRoute("/")({
  component: DashboardPage,
  head: () => ({
    meta: [
      { title: "Dashboard — IDSS" },
      { name: "description", content: "Overview of legacy system modernisation projects." },
    ],
  }),
});

function DashboardPage() {
  const { state } = useStore();
  const projectCount = state.projects.length;

  if (projectCount === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-[70vh] text-center">
        <div className="h-16 w-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-6">
          <Target className="h-8 w-8 text-primary" />
        </div>
        <h1 className="text-2xl font-bold">Welcome to IDSS</h1>
        <p className="mt-2 text-muted-foreground max-w-md">
          Intelligent Decision Support System for Legacy System Modernisation.
          Start by creating your first project.
        </p>
        <Link
          to="/projects"
          className="mt-6 inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
        >
          Create Project <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    );
  }

  const currentProject = state.projects.find(
    (p) => p.id === state.currentProjectId
  );
  const assessment = state.currentProjectId
    ? state.assessments[state.currentProjectId]
    : undefined;
  const risks = state.currentProjectId
    ? state.risks[state.currentProjectId] || []
    : [];
  const changeMgmt = state.currentProjectId
    ? state.changeManagement[state.currentProjectId]
    : undefined;

  const readinessScore = assessment
    ? calculateReadinessScore(
        assessment.technical,
        assessment.data,
        assessment.security,
        assessment.operational
      )
    : 0;
  const aggRisk = calculateAggregateRisk(risks);
  const changeReadiness = changeMgmt
    ? calculateChangeReadiness(changeMgmt.trainingLevel, changeMgmt.resistanceLevel)
    : 0;
  const maturityIndex =
    assessment && risks.length > 0
      ? calculateMaturityIndex(readinessScore, aggRisk, changeReadiness)
      : 0;
  const maturity = classifyMaturity(maturityIndex);

  const radarData = assessment
    ? [
        { subject: "Technical", value: assessment.technical },
        { subject: "Data", value: assessment.data },
        { subject: "Security", value: assessment.security },
        { subject: "Operational", value: assessment.operational },
      ]
    : [];

  const assessedProjects = state.projects.filter(
    (p) => state.assessments[p.id]
  );
  const avgReadiness =
    assessedProjects.length > 0
      ? assessedProjects.reduce((sum, p) => {
          const a = state.assessments[p.id];
          return sum + calculateReadinessScore(a.technical, a.data, a.security, a.operational);
        }, 0) / assessedProjects.length
      : 0;

  const projectBarData = assessedProjects.map((p) => {
    const a = state.assessments[p.id];
    return {
      name: p.name.slice(0, 12),
      readiness: Number(
        calculateReadinessScore(a.technical, a.data, a.security, a.operational).toFixed(1)
      ),
    };
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Overview of modernisation projects and key metrics
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-muted-foreground">Total Projects</p>
                <p className="text-2xl font-bold mt-1">{projectCount}</p>
              </div>
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <FolderKanban className="h-5 w-5 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-muted-foreground">Avg Readiness</p>
                <p className="text-2xl font-bold mt-1">
                  {avgReadiness > 0 ? avgReadiness.toFixed(1) : "—"}
                </p>
              </div>
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent/10">
                <Activity className="h-5 w-5 text-accent" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-muted-foreground">Current Risk</p>
                <p className="text-2xl font-bold mt-1">
                  {aggRisk > 0 ? aggRisk.toFixed(1) : "—"}
                </p>
                {aggRisk > 0 && (
                  <Badge
                    variant={
                      classifyRisk(aggRisk) === "High"
                        ? "destructive"
                        : classifyRisk(aggRisk) === "Medium"
                          ? "secondary"
                          : "outline"
                    }
                    className="mt-1"
                  >
                    {classifyRisk(aggRisk)}
                  </Badge>
                )}
              </div>
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-destructive/10">
                <ShieldAlert className="h-5 w-5 text-destructive" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-muted-foreground">Maturity</p>
                <p className="text-2xl font-bold mt-1">
                  {maturityIndex > 0 ? `L${maturity.level}` : "—"}
                </p>
                {maturityIndex > 0 && (
                  <p className="text-xs text-muted-foreground mt-1">
                    {maturity.label}
                  </p>
                )}
              </div>
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-success/10">
                <TrendingUp className="h-5 w-5 text-success" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {assessment && (
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-semibold">
                Readiness Radar — {currentProject?.name}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={280}>
                <RadarChart data={radarData}>
                  <PolarGrid stroke="#e2e8f0" />
                  <PolarAngleAxis dataKey="subject" tick={{ fontSize: 12 }} />
                  <PolarRadiusAxis domain={[0, 5]} tick={{ fontSize: 10 }} />
                  <Radar
                    dataKey="value"
                    stroke={CHART_COLORS.accent}
                    fill={CHART_COLORS.accent}
                    fillOpacity={0.25}
                  />
                </RadarChart>
              </ResponsiveContainer>
              <div className="mt-3 flex items-center justify-between">
                <span className="text-sm text-muted-foreground">
                  Score: {readinessScore.toFixed(2)}
                </span>
                <Badge
                  variant={
                    classifyReadiness(readinessScore) === "High"
                      ? "default"
                      : classifyReadiness(readinessScore) === "Medium"
                        ? "secondary"
                        : "destructive"
                  }
                >
                  {classifyReadiness(readinessScore)} Readiness
                </Badge>
              </div>
            </CardContent>
          </Card>
        )}

        {projectBarData.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-semibold">
                Project Readiness Comparison
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={projectBarData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                  <YAxis domain={[0, 5]} tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Bar dataKey="readiness" fill={CHART_COLORS.primary} radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}

        {currentProject && assessment && aggRisk > 0 && (
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="text-sm font-semibold">
                Strategy Recommendation
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-accent/10">
                  <Target className="h-6 w-6 text-accent" />
                </div>
                <div>
                  <p className="font-semibold">
                    {recommendStrategy(readinessScore, aggRisk, currentProject.criticality)}
                  </p>
                  <p className="text-sm text-muted-foreground mt-0.5">
                    Based on readiness ({readinessScore.toFixed(1)}), risk (
                    {aggRisk.toFixed(1)}), and {currentProject.criticality} criticality
                  </p>
                </div>
              </div>
              {maturityIndex > 0 && (
                <div className="mt-4">
                  <div className="flex items-center justify-between text-sm mb-1.5">
                    <span className="text-muted-foreground">Maturity Index</span>
                    <span className="font-medium">
                      {maturityIndex.toFixed(2)} — {maturity.label}
                    </span>
                  </div>
                  <Progress
                    value={(maturityIndex / 5) * 100}
                    className="h-2"
                  />
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-semibold">All Projects</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left">
                  <th className="pb-2 font-medium text-muted-foreground">Name</th>
                  <th className="pb-2 font-medium text-muted-foreground">Organisation</th>
                  <th className="pb-2 font-medium text-muted-foreground">System Type</th>
                  <th className="pb-2 font-medium text-muted-foreground">Criticality</th>
                  <th className="pb-2 font-medium text-muted-foreground">Status</th>
                </tr>
              </thead>
              <tbody>
                {state.projects.map((p) => {
                  const hasAssessment = !!state.assessments[p.id];
                  return (
                    <tr key={p.id} className="border-b last:border-0">
                      <td className="py-2.5 font-medium">{p.name}</td>
                      <td className="py-2.5 text-muted-foreground">{p.organisation}</td>
                      <td className="py-2.5 text-muted-foreground">{p.systemType}</td>
                      <td className="py-2.5">
                        <Badge variant={p.criticality === "High" ? "destructive" : "outline"}>
                          {p.criticality}
                        </Badge>
                      </td>
                      <td className="py-2.5">
                        <span
                          className={`text-xs font-medium ${hasAssessment ? "text-success" : "text-muted-foreground"}`}
                        >
                          {hasAssessment ? "Assessed" : "Pending"}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
