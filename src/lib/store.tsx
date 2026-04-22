import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from "react";
import { supabase } from "@/integrations/supabase/client";

export interface Project {
  id: string;
  name: string;
  organisation: string;
  industry: string;
  systemType: string;
  criticality: "Low" | "Medium" | "High";
  projectSize: string;
  createdAt: string;
}

export interface Assessment {
  technical: number;
  data: number;
  security: number;
  operational: number;
}

export interface Risk {
  id: string;
  name: string;
  probability: number;
  impact: number;
}

export interface Scenario {
  id: string;
  name: string;
  technical: number;
  data: number;
  security: number;
  operational: number;
  riskScore: number;
  criticality: "Low" | "Medium" | "High";
}

export interface ChangeManagementData {
  communicationPlan: string;
  trainingLevel: number;
  resistanceLevel: "Low" | "Medium" | "High";
}

export interface EvaluationData {
  adoptionRate: number;
  systemReliability: number;
  userSatisfaction: number;
  efficiencyImprovement: number;
}

interface AppState {
  projects: Project[];
  currentProjectId: string | null;
  assessments: Record<string, Assessment>;
  risks: Record<string, Risk[]>;
  scenarios: Record<string, Scenario[]>;
  changeManagement: Record<string, ChangeManagementData>;
  evaluations: Record<string, EvaluationData>;
  loading: boolean;
}

const initialState: AppState = {
  projects: [],
  currentProjectId: null,
  assessments: {},
  risks: {},
  scenarios: {},
  changeManagement: {},
  evaluations: {},
  loading: true,
};

interface StoreContextType {
  state: AppState;
  addProject: (project: Omit<Project, "id" | "createdAt">) => Promise<string>;
  updateProject: (id: string, updates: Partial<Project>) => void;
  deleteProject: (id: string) => void;
  setCurrentProject: (id: string | null) => void;
  setAssessment: (projectId: string, assessment: Assessment) => void;
  addRisk: (projectId: string, risk: Omit<Risk, "id">) => void;
  deleteRisk: (projectId: string, riskId: string) => void;
  addScenario: (projectId: string, scenario: Omit<Scenario, "id">) => void;
  deleteScenario: (projectId: string, scenarioId: string) => void;
  setChangeManagement: (projectId: string, data: ChangeManagementData) => void;
  setEvaluation: (projectId: string, data: EvaluationData) => void;
}

const StoreContext = createContext<StoreContextType | null>(null);

export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useStore must be used within StoreProvider");
  return ctx;
}

export function StoreProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AppState>(initialState);

  // Load all data from Supabase on mount
  useEffect(() => {
    loadAllData();
  }, []);

  const loadAllData = async () => {
    try {
      const [
        { data: projects },
        { data: assessments },
        { data: risks },
        { data: scenarios },
        { data: changeMgmt },
        { data: evaluations },
      ] = await Promise.all([
        supabase.from("projects").select("*").order("created_at", { ascending: false }),
        supabase.from("assessments").select("*"),
        supabase.from("risks").select("*"),
        supabase.from("scenarios").select("*"),
        supabase.from("change_management").select("*"),
        supabase.from("evaluations").select("*"),
      ]);

      const mappedProjects: Project[] = (projects || []).map((p) => ({
        id: p.id,
        name: p.name,
        organisation: p.organisation,
        industry: p.industry,
        systemType: p.system_type,
        criticality: p.criticality as "Low" | "Medium" | "High",
        projectSize: p.project_size,
        createdAt: p.created_at,
      }));

      const assessmentMap: Record<string, Assessment> = {};
      (assessments || []).forEach((a) => {
        assessmentMap[a.project_id] = {
          technical: Number(a.technical),
          data: Number(a.data),
          security: Number(a.security),
          operational: Number(a.operational),
        };
      });

      const riskMap: Record<string, Risk[]> = {};
      (risks || []).forEach((r) => {
        if (!riskMap[r.project_id]) riskMap[r.project_id] = [];
        riskMap[r.project_id].push({
          id: r.id,
          name: r.name,
          probability: Number(r.probability),
          impact: Number(r.impact),
        });
      });

      const scenarioMap: Record<string, Scenario[]> = {};
      (scenarios || []).forEach((s) => {
        if (!scenarioMap[s.project_id]) scenarioMap[s.project_id] = [];
        scenarioMap[s.project_id].push({
          id: s.id,
          name: s.name,
          technical: Number(s.technical),
          data: Number(s.data),
          security: Number(s.security),
          operational: Number(s.operational),
          riskScore: Number(s.risk_score),
          criticality: s.criticality as "Low" | "Medium" | "High",
        });
      });

      const cmMap: Record<string, ChangeManagementData> = {};
      (changeMgmt || []).forEach((c) => {
        cmMap[c.project_id] = {
          communicationPlan: c.communication_plan,
          trainingLevel: Number(c.training_level),
          resistanceLevel: c.resistance_level as "Low" | "Medium" | "High",
        };
      });

      const evalMap: Record<string, EvaluationData> = {};
      (evaluations || []).forEach((e) => {
        evalMap[e.project_id] = {
          adoptionRate: Number(e.adoption_rate),
          systemReliability: Number(e.system_reliability),
          userSatisfaction: Number(e.user_satisfaction),
          efficiencyImprovement: Number(e.efficiency_improvement),
        };
      });

      setState({
        projects: mappedProjects,
        currentProjectId: mappedProjects.length > 0 ? mappedProjects[0].id : null,
        assessments: assessmentMap,
        risks: riskMap,
        scenarios: scenarioMap,
        changeManagement: cmMap,
        evaluations: evalMap,
        loading: false,
      });
    } catch (error) {
      console.error("Failed to load data from database:", error);
      setState((s) => ({ ...s, loading: false }));
    }
  };

  const addProject = useCallback(async (project: Omit<Project, "id" | "createdAt">) => {
    const { data, error } = await supabase
      .from("projects")
      .insert({
        name: project.name,
        organisation: project.organisation,
        industry: project.industry,
        system_type: project.systemType,
        criticality: project.criticality,
        project_size: project.projectSize,
      })
      .select()
      .single();

    if (error || !data) {
      console.error("Failed to add project:", error);
      return "";
    }

    const newProject: Project = {
      id: data.id,
      name: data.name,
      organisation: data.organisation,
      industry: data.industry,
      systemType: data.system_type,
      criticality: data.criticality as "Low" | "Medium" | "High",
      projectSize: data.project_size,
      createdAt: data.created_at,
    };

    setState((s) => ({
      ...s,
      projects: [newProject, ...s.projects],
      currentProjectId: data.id,
    }));
    return data.id;
  }, []);

  const updateProject = useCallback((id: string, updates: Partial<Project>) => {
    const dbUpdates: {
      name?: string;
      organisation?: string;
      industry?: string;
      system_type?: string;
      criticality?: string;
      project_size?: string;
    } = {};
    if (updates.name !== undefined) dbUpdates.name = updates.name;
    if (updates.organisation !== undefined) dbUpdates.organisation = updates.organisation;
    if (updates.industry !== undefined) dbUpdates.industry = updates.industry;
    if (updates.systemType !== undefined) dbUpdates.system_type = updates.systemType;
    if (updates.criticality !== undefined) dbUpdates.criticality = updates.criticality;
    if (updates.projectSize !== undefined) dbUpdates.project_size = updates.projectSize;

    supabase.from("projects").update(dbUpdates).eq("id", id).then();

    setState((s) => ({
      ...s,
      projects: s.projects.map((p) => (p.id === id ? { ...p, ...updates } : p)),
    }));
  }, []);

  const deleteProject = useCallback((id: string) => {
    supabase.from("projects").delete().eq("id", id).then();

    setState((s) => {
      const { [id]: _a, ...assessments } = s.assessments;
      const { [id]: _r, ...risks } = s.risks;
      const { [id]: _sc, ...scenarios } = s.scenarios;
      const { [id]: _cm, ...changeManagement } = s.changeManagement;
      const { [id]: _ev, ...evaluations } = s.evaluations;
      return {
        ...s,
        projects: s.projects.filter((p) => p.id !== id),
        currentProjectId: s.currentProjectId === id ? null : s.currentProjectId,
        assessments,
        risks,
        scenarios,
        changeManagement,
        evaluations,
      };
    });
  }, []);

  const setCurrentProject = useCallback((id: string | null) => {
    setState((s) => ({ ...s, currentProjectId: id }));
  }, []);

  const setAssessment = useCallback((projectId: string, assessment: Assessment) => {
    supabase
      .from("assessments")
      .upsert({
        project_id: projectId,
        technical: assessment.technical,
        data: assessment.data,
        security: assessment.security,
        operational: assessment.operational,
      }, { onConflict: "project_id" })
      .then();

    setState((s) => ({
      ...s,
      assessments: { ...s.assessments, [projectId]: assessment },
    }));
  }, []);

  const addRisk = useCallback((projectId: string, risk: Omit<Risk, "id">) => {
    supabase
      .from("risks")
      .insert({
        project_id: projectId,
        name: risk.name,
        probability: risk.probability,
        impact: risk.impact,
      })
      .select()
      .single()
      .then(({ data }) => {
        if (data) {
          const newRisk: Risk = {
            id: data.id,
            name: data.name,
            probability: Number(data.probability),
            impact: Number(data.impact),
          };
          setState((s) => ({
            ...s,
            risks: {
              ...s.risks,
              [projectId]: [...(s.risks[projectId] || []), newRisk],
            },
          }));
        }
      });
  }, []);

  const deleteRisk = useCallback((projectId: string, riskId: string) => {
    supabase.from("risks").delete().eq("id", riskId).then();

    setState((s) => ({
      ...s,
      risks: {
        ...s.risks,
        [projectId]: (s.risks[projectId] || []).filter((r) => r.id !== riskId),
      },
    }));
  }, []);

  const addScenario = useCallback((projectId: string, scenario: Omit<Scenario, "id">) => {
    supabase
      .from("scenarios")
      .insert({
        project_id: projectId,
        name: scenario.name,
        technical: scenario.technical,
        data: scenario.data,
        security: scenario.security,
        operational: scenario.operational,
        risk_score: scenario.riskScore,
        criticality: scenario.criticality,
      })
      .select()
      .single()
      .then(({ data }) => {
        if (data) {
          const newScenario: Scenario = {
            id: data.id,
            name: data.name,
            technical: Number(data.technical),
            data: Number(data.data),
            security: Number(data.security),
            operational: Number(data.operational),
            riskScore: Number(data.risk_score),
            criticality: data.criticality as "Low" | "Medium" | "High",
          };
          setState((s) => ({
            ...s,
            scenarios: {
              ...s.scenarios,
              [projectId]: [...(s.scenarios[projectId] || []), newScenario],
            },
          }));
        }
      });
  }, []);

  const deleteScenario = useCallback((projectId: string, scenarioId: string) => {
    supabase.from("scenarios").delete().eq("id", scenarioId).then();

    setState((s) => ({
      ...s,
      scenarios: {
        ...s.scenarios,
        [projectId]: (s.scenarios[projectId] || []).filter((sc) => sc.id !== scenarioId),
      },
    }));
  }, []);

  const setChangeManagement = useCallback((projectId: string, data: ChangeManagementData) => {
    supabase
      .from("change_management")
      .upsert({
        project_id: projectId,
        communication_plan: data.communicationPlan,
        training_level: data.trainingLevel,
        resistance_level: data.resistanceLevel,
      }, { onConflict: "project_id" })
      .then();

    setState((s) => ({
      ...s,
      changeManagement: { ...s.changeManagement, [projectId]: data },
    }));
  }, []);

  const setEvaluation = useCallback((projectId: string, data: EvaluationData) => {
    supabase
      .from("evaluations")
      .upsert({
        project_id: projectId,
        adoption_rate: data.adoptionRate,
        system_reliability: data.systemReliability,
        user_satisfaction: data.userSatisfaction,
        efficiency_improvement: data.efficiencyImprovement,
      }, { onConflict: "project_id" })
      .then();

    setState((s) => ({
      ...s,
      evaluations: { ...s.evaluations, [projectId]: data },
    }));
  }, []);

  return (
    <StoreContext.Provider
      value={{
        state,
        addProject,
        updateProject,
        deleteProject,
        setCurrentProject,
        setAssessment,
        addRisk,
        deleteRisk,
        addScenario,
        deleteScenario,
        setChangeManagement,
        setEvaluation,
      }}
    >
      {children}
    </StoreContext.Provider>
  );
}
