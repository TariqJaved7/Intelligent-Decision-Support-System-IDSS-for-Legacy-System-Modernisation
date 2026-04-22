import { createFileRoute } from "@tanstack/react-router";
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
  calculateSuccessScore,
  getStrategyJustification,
  CHART_COLORS,
} from "@/lib/calculations";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
} from "recharts";
import {
  Activity,
  ShieldAlert,
  Target,
  TrendingUp,
  BarChart3,
  CheckCircle,
  Users,
  FlaskConical,
} from "lucide-react";

export const Route = createFileRoute("/results")({
  component: ResultsPage,
  head: () => ({
    meta: [
      { title: "Results Summary — IDSS" },
      {
        name: "description",
        content: "Consolidated results dashboard for your modernisation project.",
      },
    ],
  }),
});

const PIE_COLORS = [CHART_COLORS.primary, CHART_COLORS.accent, CHART_COLORS.success, CHART_COLORS.warning];

function ResultsPage() {
  const { state } = useStore();
  const pid = state.currentProjectId;
  const project = state.projects.find((p) => p.id === pid);

  if (!project || !pid) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] text-center">
        <BarChart3 className="h-12 w-12 text-muted-foreground mb-4" />
        <h1 className="text-xl font-bold">No Project Selected</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Select a project from the top bar to view consolidated results.
        </p>
      </div>
    );
  }

  const assessment = state.assessments[pid];
  const risks = state.risks[pid] || [];
  const scenarios = state.scenarios[pid] || [];
  const changeMgmt = state.changeManagement[pid];
  const evaluation = state.evaluations[pid];

  const readinessScore = assessment
    ? calculateReadinessScore(assessment.technical, assessment.data, assessment.security, assessment.operational)
    : 0;
  const readinessClass = classifyReadiness(readinessScore);

  const aggRisk = calculateAggregateRisk(risks);
  const riskClass = classifyRisk(aggRisk);

  const changeReadiness = changeMgmt
    ? calculateChangeReadiness(changeMgmt.trainingLevel, changeMgmt.resistanceLevel)
    : 0;

  const maturityIndex =
    assessment && risks.length > 0
      ? calculateMaturityIndex(readinessScore, aggRisk, changeReadiness)
      : 0;
  const maturity = classifyMaturity(maturityIndex);

  const strategy = assessment && risks.length > 0
    ? recommendStrategy(readinessScore, aggRisk, project.criticality)
    : null;

  const justification = strategy
    ? getStrategyJustification(strategy, readinessScore, aggRisk, project.criticality)
    : "";

  const successScore = evaluation
    ? calculateSuccessScore(evaluation.adoptionRate, evaluation.systemReliability, evaluation.userSatisfaction, evaluation.efficiencyImprovement)
    : 0;

  // Readiness dimension data for pie
  const readinessPieData = assessment
    ? [
        { name: "Technical", value: assessment.technical, weight: 0.35 },
        { name: "Data", value: assessment.data, weight: 0.25 },
        { name: "Security", value: assessment.security, weight: 0.20 },
        { name: "Operational", value: assessment.operational, weight: 0.20 },
      ]
    : [];

  // Radar data
  const radarData = assessment
    ? [
        { subject: "Technical", value: assessment.technical },
        { subject: "Data", value: assessment.data },
        { subject: "Security", value: assessment.security },
        { subject: "Operational", value: assessment.operational },
      ]
    : [];

  // KPI metrics breakdown
  const kpiData = [
    { name: "Readiness", value: Number((readinessScore * 20).toFixed(1)), max: 100 },
    { name: "Risk Mgmt", value: Number((Math.max(0, ((25 - aggRisk) / 25) * 100)).toFixed(1)), max: 100 },
    { name: "Change Ready", value: Number((changeReadiness * 20).toFixed(1)), max: 100 },
    { name: "Maturity", value: Number((maturityIndex * 20).toFixed(1)), max: 100 },
    ...(evaluation ? [{ name: "Success", value: Number(successScore.toFixed(1)), max: 100 }] : []),
  ];

  // Scenario comparison bar data
  const scenarioBarData = scenarios.map((s) => ({
    name: s.name.length > 15 ? s.name.slice(0, 15) + "…" : s.name,
    readiness: Number(
      calculateReadinessScore(s.technical, s.data, s.security, s.operational).toFixed(1)
    ),
    risk: Number(s.riskScore.toFixed(1)),
  }));

  // Strategy comparison
  const strategyComparisonData = [
    { name: "Big Bang", risk: 80, cost: 20, complexity: 20 },
    { name: "Phased", risk: 50, cost: 50, complexity: 50 },
    { name: "Parallel", risk: 20, cost: 80, complexity: 80 },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Results Summary</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Consolidated dashboard for <span className="font-medium text-foreground">{project.name}</span>
        </p>
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
        <KPICard icon={Activity} label="Readiness" value={readinessScore.toFixed(2)} badge={readinessClass} badgeColor={readinessClass === "High" ? "default" : readinessClass === "Medium" ? "secondary" : "destructive"} />
        <KPICard icon={ShieldAlert} label="Avg Risk" value={aggRisk > 0 ? aggRisk.toFixed(1) : "—"} badge={aggRisk > 0 ? riskClass : undefined} badgeColor={riskClass === "High" ? "destructive" : riskClass === "Medium" ? "secondary" : "outline"} />
        <KPICard icon={Target} label="Strategy" value={strategy || "—"} />
        <KPICard icon={Users} label="Change Ready" value={changeReadiness > 0 ? changeReadiness.toFixed(2) : "—"} />
        <KPICard icon={TrendingUp} label="Maturity" value={maturityIndex > 0 ? `L${maturity.level}` : "—"} subtitle={maturityIndex > 0 ? maturity.label : undefined} />
        <KPICard icon={CheckCircle} label="Success" value={evaluation ? `${successScore.toFixed(1)}%` : "—"} />
      </div>

      {/* Charts Row 1: Readiness Pie + Radar */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {assessment && (
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-semibold">Readiness Assessment Breakdown</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={260}>
                <PieChart>
                  <Pie
                    data={readinessPieData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={90}
                    label={({ name, value }) => `${name}: ${value}`}
                  >
                    {readinessPieData.map((_, i) => (
                      <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
              <div className="mt-2 text-center">
                <span className="text-sm text-muted-foreground">Weighted Score: </span>
                <span className="font-semibold">{readinessScore.toFixed(2)}</span>
                <Badge className="ml-2" variant={readinessClass === "High" ? "default" : readinessClass === "Medium" ? "secondary" : "destructive"}>
                  {readinessClass}
                </Badge>
              </div>
            </CardContent>
          </Card>
        )}

        {assessment && (
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-semibold">Readiness Radar</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={260}>
                <RadarChart data={radarData}>
                  <PolarGrid stroke="hsl(var(--border))" />
                  <PolarAngleAxis dataKey="subject" tick={{ fontSize: 12 }} />
                  <PolarRadiusAxis domain={[0, 5]} tick={{ fontSize: 10 }} />
                  <Radar dataKey="value" stroke={CHART_COLORS.accent} fill={CHART_COLORS.accent} fillOpacity={0.25} />
                </RadarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Charts Row 2: KPI Breakdown + Strategy Comparison */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-semibold">Metrics KPI Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={kpiData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 11 }} />
                <YAxis type="category" dataKey="name" tick={{ fontSize: 11 }} width={80} />
                <Tooltip formatter={(v: number) => `${v}%`} />
                <Bar dataKey="value" fill={CHART_COLORS.primary} radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-semibold">
              Migration Strategy Comparison
              {strategy && (
                <Badge className="ml-2" variant="default">{strategy}</Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={strategyComparisonData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} />
                <Tooltip />
                <Legend />
                <Bar dataKey="risk" name="Risk" fill={CHART_COLORS.danger} radius={[4, 4, 0, 0]} />
                <Bar dataKey="cost" name="Cost" fill={CHART_COLORS.warning} radius={[4, 4, 0, 0]} />
                <Bar dataKey="complexity" name="Complexity" fill={CHART_COLORS.accent} radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
            {strategy && (
              <p className="mt-3 text-xs text-muted-foreground">{justification}</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Scenarios */}
      {scenarios.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <FlaskConical className="h-4 w-4" /> Scenario Comparison
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={scenarioBarData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Legend />
                <Bar dataKey="readiness" name="Readiness" fill={CHART_COLORS.success} radius={[4, 4, 0, 0]} />
                <Bar dataKey="risk" name="Risk Score" fill={CHART_COLORS.danger} radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {/* Change Readiness & Success Score */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {changeMgmt && (
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-semibold">Change Readiness</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Training Level</span>
                  <span className="font-medium">{changeMgmt.trainingLevel}/5</span>
                </div>
                <Progress value={(changeMgmt.trainingLevel / 5) * 100} className="h-2" />
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Resistance Level</span>
                <Badge variant={changeMgmt.resistanceLevel === "High" ? "destructive" : changeMgmt.resistanceLevel === "Medium" ? "secondary" : "outline"}>
                  {changeMgmt.resistanceLevel}
                </Badge>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Change Readiness Score</span>
                <span className="font-bold">{changeReadiness.toFixed(2)}</span>
              </div>
              <div className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Communication Plan</span>
                </div>
                <p className="text-xs text-muted-foreground bg-muted/50 rounded-md p-2">
                  {changeMgmt.communicationPlan || "Not specified"}
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {evaluation && (
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-semibold">Post-Implementation Success</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <MetricItem label="Adoption Rate" value={`${evaluation.adoptionRate}%`} />
                <MetricItem label="System Reliability" value={`${evaluation.systemReliability}%`} />
                <MetricItem label="User Satisfaction" value={`${evaluation.userSatisfaction}/5`} />
                <MetricItem label="Efficiency Gain" value={`${evaluation.efficiencyImprovement}%`} />
              </div>
              <div className="pt-2 border-t">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Overall Success Score</span>
                  <span className="text-lg font-bold">{successScore.toFixed(1)}%</span>
                </div>
                <Progress value={successScore} className="h-2.5 mt-2" />
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Maturity Index */}
      {maturityIndex > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-semibold">Project Maturity Index</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-6">
              <div className="flex h-20 w-20 items-center justify-center rounded-full border-4 border-primary">
                <div className="text-center">
                  <p className="text-2xl font-bold">L{maturity.level}</p>
                  <p className="text-[10px] text-muted-foreground">{maturityIndex.toFixed(2)}</p>
                </div>
              </div>
              <div className="flex-1">
                <p className="font-semibold">{maturity.label}</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Composite of readiness ({(readinessScore * 0.4).toFixed(2)}), risk mitigation ({(((25 - aggRisk) * 0.3) / 5).toFixed(2)}), and change readiness ({(changeReadiness * 0.3).toFixed(2)})
                </p>
                <Progress value={(maturityIndex / 5) * 100} className="h-2.5 mt-3" />
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* No data hint */}
      {!assessment && (
        <Card>
          <CardContent className="py-8 text-center">
            <p className="text-muted-foreground text-sm">
              Complete the Assessment, Risk Analysis, and other modules to see full results here.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function KPICard({
  icon: Icon,
  label,
  value,
  badge,
  badgeColor,
  subtitle,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
  badge?: string;
  badgeColor?: "default" | "secondary" | "destructive" | "outline";
  subtitle?: string;
}) {
  return (
    <Card>
      <CardContent className="pt-4 pb-3 px-4">
        <div className="flex items-center gap-2 mb-2">
          <Icon className="h-4 w-4 text-muted-foreground" />
          <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide">{label}</span>
        </div>
        <p className="text-lg font-bold leading-tight">{value}</p>
        {badge && (
          <Badge variant={badgeColor || "default"} className="mt-1 text-[10px]">
            {badge}
          </Badge>
        )}
        {subtitle && (
          <p className="text-[10px] text-muted-foreground mt-0.5">{subtitle}</p>
        )}
      </CardContent>
    </Card>
  );
}

function MetricItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-muted/50 p-3 text-center">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="text-sm font-bold mt-0.5">{value}</p>
    </div>
  );
}
