import { Link, useLocation } from "@tanstack/react-router";
import {
  LayoutDashboard,
  FolderKanban,
  ClipboardCheck,
  ShieldAlert,
  Target,
  FlaskConical,
  Users,
  BarChart3,
  CheckCircle,
  Menu,
  ChevronRight,
} from "lucide-react";
import { useState, type ReactNode } from "react";
import { useStore } from "@/lib/store";

const navItems = [
  { to: "/", icon: LayoutDashboard, label: "Dashboard" },
  { to: "/projects", icon: FolderKanban, label: "Projects" },
  { to: "/assessment", icon: ClipboardCheck, label: "Assessment" },
  { to: "/risk-analysis", icon: ShieldAlert, label: "Risk Analysis" },
  { to: "/strategy", icon: Target, label: "Strategy Analysis" },
  { to: "/simulation", icon: FlaskConical, label: "Scenario Simulation" },
  { to: "/change-management", icon: Users, label: "Change Management" },
  { to: "/evaluation", icon: BarChart3, label: "Evaluation" },
  { to: "/results", icon: CheckCircle, label: "Results Summary" },
] as const;

export function AppLayout({ children }: { children: ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const location = useLocation();
  const { state, setCurrentProject } = useStore();

  const currentProject = state.projects.find(
    (p) => p.id === state.currentProjectId
  );

  return (
    <div className="flex h-screen overflow-hidden">
      <aside
        className={`${sidebarOpen ? "w-60" : "w-0"} flex-shrink-0 overflow-hidden transition-all duration-200`}
        style={{ backgroundColor: "var(--sidebar)" }}
      >
        <div className="flex h-full w-60 flex-col">
          <div className="flex h-14 items-center gap-2 border-b px-4" style={{ borderColor: "var(--sidebar-border)" }}>
            <div className="flex h-7 w-7 items-center justify-center rounded-md" style={{ backgroundColor: "var(--sidebar-primary)" }}>
              <Target className="h-4 w-4" style={{ color: "var(--sidebar-primary-foreground)" }} />
            </div>
            <span className="text-sm font-bold tracking-tight" style={{ color: "var(--sidebar-foreground)" }}>
              IDSS
            </span>
          </div>
          <nav className="flex-1 overflow-y-auto p-2 space-y-0.5">
            {navItems.map((item) => {
              const isActive =
                item.to === "/"
                  ? location.pathname === "/"
                  : location.pathname.startsWith(item.to);
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  className="flex items-center gap-3 rounded-lg px-3 py-2 text-[13px] font-medium transition-colors"
                  style={{
                    backgroundColor: isActive
                      ? "var(--sidebar-accent)"
                      : "transparent",
                    color: isActive
                      ? "var(--sidebar-accent-foreground)"
                      : "var(--sidebar-foreground)",
                    opacity: isActive ? 1 : 0.7,
                  }}
                >
                  <item.icon className="h-4 w-4 flex-shrink-0" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
          <div className="border-t p-3" style={{ borderColor: "var(--sidebar-border)" }}>
            <p className="text-[11px] font-medium" style={{ color: "var(--sidebar-foreground)", opacity: 0.4 }}>
              Legacy System Modernisation
            </p>
          </div>
        </div>
      </aside>

      <div className="flex flex-1 flex-col overflow-hidden">
        <header className="flex h-14 items-center justify-between border-b bg-card px-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="rounded-md p-1.5 transition-colors hover:bg-muted"
            >
              <Menu className="h-5 w-5 text-muted-foreground" />
            </button>
            <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
              <span>Project</span>
              <ChevronRight className="h-3.5 w-3.5" />
            </div>
            <select
              value={state.currentProjectId || ""}
              onChange={(e) => setCurrentProject(e.target.value || null)}
              className="rounded-md border bg-background px-2.5 py-1.5 text-sm font-medium"
            >
              <option value="">Select Project...</option>
              {state.projects.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
            {currentProject && (
              <span className="rounded-full bg-accent/10 px-2.5 py-0.5 text-xs font-medium text-accent">
                {currentProject.criticality} Criticality
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-xs font-semibold text-primary-foreground">
              U
            </div>
          </div>
        </header>
        <main className="flex-1 overflow-y-auto p-6">{children}</main>
      </div>
    </div>
  );
}
