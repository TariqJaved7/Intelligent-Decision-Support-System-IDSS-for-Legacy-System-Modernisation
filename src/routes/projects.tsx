import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useStore } from "@/lib/store";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Plus, Trash2, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/projects")({
  component: ProjectsPage,
  head: () => ({
    meta: [
      { title: "Projects — IDSS" },
      { name: "description", content: "Manage legacy system modernisation projects." },
    ],
  }),
});

const INDUSTRIES = ["Technology", "Finance", "Healthcare", "Government", "Manufacturing", "Retail", "Education", "Other"];
const SYSTEM_TYPES = ["ERP", "Banking Core", "Legacy Application", "CRM", "Database System", "Custom Application"];
const PROJECT_SIZES = ["Small", "Medium", "Large", "Enterprise"];

function ProjectsPage() {
  const { state, addProject, deleteProject, setCurrentProject } = useStore();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [organisation, setOrganisation] = useState("");
  const [industry, setIndustry] = useState("");
  const [systemType, setSystemType] = useState("");
  const [criticality, setCriticality] = useState<"Low" | "Medium" | "High">("Medium");
  const [projectSize, setProjectSize] = useState("");

  const handleCreate = async () => {
    if (!name || !organisation || !industry || !systemType || !projectSize) {
      toast.error("Please fill in all fields");
      return;
    }
    await addProject({ name, organisation, industry, systemType, criticality, projectSize });
    setName("");
    setOrganisation("");
    setIndustry("");
    setSystemType("");
    setCriticality("Medium");
    setProjectSize("");
    setOpen(false);
    toast.success("Project created successfully");
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Projects</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage your legacy system modernisation projects
          </p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" /> New Project
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Create New Project</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 mt-2">
              <div>
                <Label>Project Name</Label>
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. ERP Migration Phase 1"
                />
              </div>
              <div>
                <Label>Organisation Name</Label>
                <Input
                  value={organisation}
                  onChange={(e) => setOrganisation(e.target.value)}
                  placeholder="e.g. Acme Corporation"
                />
              </div>
              <div>
                <Label>Industry Type</Label>
                <Select value={industry} onValueChange={setIndustry}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select industry" />
                  </SelectTrigger>
                  <SelectContent>
                    {INDUSTRIES.map((i) => (
                      <SelectItem key={i} value={i}>{i}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>System Type</Label>
                <Select value={systemType} onValueChange={setSystemType}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select system type" />
                  </SelectTrigger>
                  <SelectContent>
                    {SYSTEM_TYPES.map((s) => (
                      <SelectItem key={s} value={s}>{s}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>System Criticality</Label>
                <Select value={criticality} onValueChange={(v) => setCriticality(v as "Low" | "Medium" | "High")}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Low">Low</SelectItem>
                    <SelectItem value="Medium">Medium</SelectItem>
                    <SelectItem value="High">High</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Project Size</Label>
                <Select value={projectSize} onValueChange={setProjectSize}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select size" />
                  </SelectTrigger>
                  <SelectContent>
                    {PROJECT_SIZES.map((s) => (
                      <SelectItem key={s} value={s}>{s}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Button onClick={handleCreate} className="w-full">
                Create Project
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {state.projects.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <p className="text-muted-foreground">No projects yet. Create your first project to get started.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {state.projects.map((p) => {
            const isSelected = state.currentProjectId === p.id;
            return (
              <Card
                key={p.id}
                className={`cursor-pointer transition-shadow hover:shadow-md ${isSelected ? "ring-2 ring-primary" : ""}`}
                onClick={() => setCurrentProject(p.id)}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-base">{p.name}</CardTitle>
                      <p className="text-xs text-muted-foreground mt-1">{p.organisation}</p>
                    </div>
                    {isSelected && (
                      <CheckCircle2 className="h-5 w-5 text-primary flex-shrink-0" />
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-1.5">
                    <Badge variant="outline">{p.industry}</Badge>
                    <Badge variant="outline">{p.systemType}</Badge>
                    <Badge
                      variant={
                        p.criticality === "High"
                          ? "destructive"
                          : p.criticality === "Medium"
                            ? "secondary"
                            : "outline"
                      }
                    >
                      {p.criticality}
                    </Badge>
                    <Badge variant="outline">{p.projectSize}</Badge>
                  </div>
                  <div className="flex items-center justify-between mt-4">
                    <span className="text-xs text-muted-foreground">
                      {new Date(p.createdAt).toLocaleDateString()}
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteProject(p.id);
                        toast.success("Project deleted");
                      }}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
