import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { useStore } from "@/lib/store";
import {
  calculateReadinessScore,
  calculateAggregateRisk,
  classifyReadiness,
  classifyRisk,
  recommendStrategy,
  CHART_COLORS,
} from "@/lib/calculations";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Trash2, Trophy } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/simulation")({
  component: SimulationPage,
  head: () => ({
    meta: [
      { title: "Scenario Simulation — IDSS" },
      { name: "description", content: "Compare migration scenarios side-by-side." },
    ],
  }),
});

function SimulationPage() {
  const { state, addScenario, deleteScenario } = useStore();
  const projectId = state.currentProjectId;

  const [name, setName] = useState("");
  const [technical, setTechnical] = useState(3);
  const [data, setData] = useState(3);
  const [security, setSecurity] = useState(3);
  const [operational, setOperational] = useState(3);
  const [riskScore, setRiskScore] = useState(10);
  const [criticality, setCriticality] = useState<"Low" | "Medium" | "High">("Medium");

  if (!projectId) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh]">
        <p className="text-muted-foreground">Please select a project first</p>
        <Link to="/projects" className="text-accent text-sm mt-2">Go to Projects →</Link>
      </div>
    );
  }

  const scenarios = state.scenarios[projectId] || [];

  const handleAdd = () => {
    if (!name.trim()) { toast.error("Enter a scenario name"); return; }
    addScenario(projectId, { name, technical, data, security, operational, riskScore, criticality });
    setName("");
    toast.success("Scenario added");
  };

  const scenarioResults = scenarios.map((s) => {
    const readiness = calculateReadinessScore(s.technical, s.data, s.security, s.operational);
    const strategy = recommendStrategy(readiness, s.riskScore, s.criticality);
    return { ...s, readiness, strategy };
  });

  const best = scenarioResults.length > 0
    ? scenarioResults.reduce((a, b) => (a.readiness > b.readiness && a.riskScore <= b.riskScore ? a : b))
    : null;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Scenario Simulation</h1>
        <p className="text-sm text-muted-foreground mt-1">Create and compare migration scenarios</p>
      </div>

      <Card>
        <CardHeader><CardTitle className="text-sm">Create Scenario</CardTitle></CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
            <div><Label>Scenario Name</Label><Input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Optimistic" /></div>
            <div><Label>Technical ({technical})</Label><Slider value={[technical]} onValueChange={([v]) => setTechnical(v)} min={1} max={5} step={1} /></div>
            <div><Label>Data ({data})</Label><Slider value={[data]} onValueChange={([v]) => setData(v)} min={1} max={5} step={1} /></div>
            <div><Label>Security ({security})</Label><Slider value={[security]} onValueChange={([v]) => setSecurity(v)} min={1} max={5} step={1} /></div>
            <div><Label>Operational ({operational})</Label><Slider value={[operational]} onValueChange={([v]) => setOperational(v)} min={1} max={5} step={1} /></div>
            <div><Label>Risk Score ({riskScore})</Label><Slider value={[riskScore]} onValueChange={([v]) => setRiskScore(v)} min={1} max={25} step={1} /></div>
            <div>
              <Label>Criticality</Label>
              <Select value={criticality} onValueChange={(v) => setCriticality(v as "Low" | "Medium" | "High")}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Low">Low</SelectItem>
                  <SelectItem value="Medium">Medium</SelectItem>
                  <SelectItem value="High">High</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end">
              <Button onClick={handleAdd} className="w-full"><Plus className="mr-2 h-4 w-4" /> Add Scenario</Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {scenarioResults.length > 0 && (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {scenarioResults.map((s) => {
            const isBest = best?.id === s.id;
            return (
              <Card key={s.id} className={isBest ? "ring-2 ring-accent" : ""}>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base flex items-center gap-2">
                      {s.name} {isBest && <Trophy className="h-4 w-4 text-accent" />}
                    </CardTitle>
                    <Button variant="ghost" size="sm" onClick={() => { deleteScenario(projectId, s.id); toast.success("Removed"); }}>
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div><span className="text-muted-foreground">Readiness</span><p className="font-bold">{s.readiness.toFixed(2)}</p></div>
                    <div><span className="text-muted-foreground">Risk Score</span><p className="font-bold">{s.riskScore}</p></div>
                    <div><span className="text-muted-foreground">Criticality</span><Badge variant="outline">{s.criticality}</Badge></div>
                    <div><span className="text-muted-foreground">Classification</span><Badge variant={classifyReadiness(s.readiness) === "High" ? "default" : "secondary"}>{classifyReadiness(s.readiness)}</Badge></div>
                  </div>
                  <div className="rounded-md bg-muted p-3 text-center">
                    <p className="text-xs text-muted-foreground">Recommended Strategy</p>
                    <p className="font-bold mt-1">{s.strategy}</p>
                  </div>
                  {isBest && <p className="text-xs text-accent font-medium text-center">✦ Best Option</p>}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
