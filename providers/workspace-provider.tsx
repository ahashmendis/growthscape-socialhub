"use client";

import { createContext, useContext, useState, useEffect, type ReactNode } from "react";

type Workspace = {
  id: string;
  name: string;
  slug: string;
  logoUrl: string | null;
  timezone: string;
  plan: string;
};

type WorkspaceContextType = {
  workspaces: Workspace[];
  currentWorkspace: Workspace | null;
  currentBrandId: string | null;
  loading: boolean;
  setCurrentWorkspaceId: (id: string) => void;
  setCurrentBrandId: (id: string | null) => void;
  refresh: () => Promise<void>;
};

const WorkspaceContext = createContext<WorkspaceContextType | undefined>(undefined);

export function WorkspaceProvider({ children }: { children: ReactNode }) {
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [currentWorkspace, setCurrentWorkspace] = useState<Workspace | null>(null);
  const [currentBrandId, setCurrentBrandId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchWorkspaces = async () => {
    try {
      const res = await fetch("/api/v1/workspaces");
      const data = await res.json();
      if (data.success) {
        setWorkspaces(data.data);
        // Set first workspace as current if none selected
        if (data.data.length > 0 && !currentWorkspace) {
          const stored = localStorage.getItem("currentWorkspaceId");
          const found = stored ? data.data.find((w: Workspace) => w.id === stored) : data.data[0];
          setCurrentWorkspace(found || data.data[0]);
        }
      }
    } catch {
      // Silently fail
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWorkspaces();
  }, []);

  const setCurrentWorkspaceId = (id: string) => {
    const workspace = workspaces.find((w) => w.id === id);
    if (workspace) {
      setCurrentWorkspace(workspace);
      localStorage.setItem("currentWorkspaceId", id);
    }
  };

  return (
    <WorkspaceContext.Provider
      value={{
        workspaces,
        currentWorkspace,
        currentBrandId,
        loading,
        setCurrentWorkspaceId,
        setCurrentBrandId,
        refresh: fetchWorkspaces,
      }}
    >
      {children}
    </WorkspaceContext.Provider>
  );
}

export function useWorkspace() {
  const context = useContext(WorkspaceContext);
  if (!context) {
    throw new Error("useWorkspace must be used within WorkspaceProvider");
  }
  return context;
}
