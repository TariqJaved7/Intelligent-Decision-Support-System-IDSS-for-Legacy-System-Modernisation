import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { useStore } from "@/lib/store";
import { calculateChangeReadiness } from "@/lib/calculations";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";

export const Route = createFileRoute("/change-management")({
  component: ChangeManagementPage,
  head: () => ({
    meta: [
      { title: "Change Management — IDSS" },
      { name: "description", content: "Assess organisational change readiness." },
    ],
  }),
});

function ChangeManagementPage() {
  const { state, setChangeManagement } = useStore();
  const projectId = state.currentProjectId;

  const [communicationPlan, setCommunicationPlan] = useState("");
  const [trainingLevel, setTrainingLevel] = useState(3);
  const [resistanceLevel, setResistanceLevel] = useState<"Low" | "Medium" | "High">("Medium");

  useEffect(() => {
    if (projectId && state.changeManagement[projectId]) {
      const cm = state.changeManagement[projectId];
      setCommunicationPlan(cm.communicationPlan);
      setTrainingLevel(cm.trainingLevel);
      setResistanceLevel(cm.resistanceLevel);
    } else {
      setCommunicationPlan("");
      setTrainingLevel(3);
      setResistanceLevel("Medium");
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

  const changeReadiness = calculateChangeReadiness(trainingLevel, resistanceLevel);

  const handleSave = () => {
    setChangeManagement(projectId, { communicationPlan, trainingLevel, resistanceLevel });
    toast.success("Change management data saved");
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Change Management</h1>
        <p className="text-sm text-muted-foreground mt-1">Assess organisational readiness for change</p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader><CardTitle className="text-sm">Change Factors</CardTitle></CardHeader>
          <CardContent className="space-y-5">
            <div>
              <Label>Communication Plan</Label>
              <Textarea
                value={communicationPlan}
                onChange={(e) => setCommunicationPlan(e.target.value)}
                placeholder="Describe the communication strategy for stakeholders..."
                rows={4}
              />
            </div>
            <div>
              <div className="flex items-center justify-between mb-2">
                <Label>Training Level</Label>
                <span className="text-xs text-muted-foreground">Score: {trainingLevel} (Weight: 60%)</span>
              </div>
              <Slider value={[trainingLevel]} onValueChange={([v]) => setTrainingLevel(v)} min={1} max={5} step={1} />
              <div className="flex justify-between mt-1 text-[10px] text-muted-foreground">
                <span>1 - Minimal</span><span>5 - Comprehensive</span>
              </div>
            </div>
            <div>
              <Label>Resistance Level (Weight: 40%)</Label>
              <Select value={resistanceLevel} onValueChange={(v) => setResistanceLevel(v as "Low" | "Medium" | "High")}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Low">Low (Inverse: 5)</SelectItem>
                  <SelectItem value="Medium">Medium (Inverse: 3)</SelectItem>
                  <SelectItem value="High">High (Inverse: 1)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button onClick={handleSave} className="w-full">Save</Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-sm">Change Readiness Score</CardTitle></CardHeader>
          <CardContent>
            <div className="text-center mb-6">
              <p className="text-5xl font-bold">{changeReadiness.toFixed(2)}</p>
              <p className="text-sm text-muted-foreground mt-2">out of 5.00</p>
            </div>
            <Progress value={(changeReadiness / 5) * 100} className="h-3 mb-4" />
            <div className="rounded-md bg-muted p-4 text-sm space-y-2">
              <p><span className="font-medium">Formula:</span> (Training × 0.6) + (Resistance Inverse × 0.4)</p>
              <p><span className="font-medium">Training:</span> {trainingLevel} × 0.6 = {(trainingLevel * 0.6).toFixed(1)}</p>
              <p><span className="font-medium">Resistance Inverse:</span> {resistanceLevel === "High" ? 1 : resistanceLevel === "Medium" ? 3 : 5} × 0.4 = {((resistanceLevel === "High" ? 1 : resistanceLevel === "Medium" ? 3 : 5) * 0.4).toFixed(1)}</p>
            </div>
            <div className="mt-4 text-center">
              <Badge variant={changeReadiness >= 3.5 ? "default" : changeReadiness >= 2.5 ? "secondary" : "destructive"}>
                {changeReadiness >= 3.5 ? "Ready for Change" : changeReadiness >= 2.5 ? "Moderate Readiness" : "Low Readiness"}
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
