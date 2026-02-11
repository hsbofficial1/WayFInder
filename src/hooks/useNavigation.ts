// Re-export types
export type { Location } from "@/data/locations";
export type { Route, RouteStep } from "@/data/routes";
import { useNavigationContext } from "@/context/NavigationContext";
import { findGraphRoute } from "@/data/graphData";
import { RouteStep } from "@/data/routes";

export type LocationType = "entry" | "room" | "lab" | "office" | "hotspot" | "utility";

export const locationTypeLabels: Record<string, string> = {
  entry: "Entry Point",
  room: "Room",
  lab: "Lab",
  office: "Office",
  hotspot: "Hotspot",
  utility: "Utility",
};

export const getFloorLabel = (floor: number) => {
  if (floor === 0) return "Ground Floor";
  return `Floor ${floor}`;
};

export function useLocations() {
  const { locations } = useNavigationContext();
  return { data: locations, isLoading: false };
}

export interface RouteWithSteps {
  id: string;
  from: string;
  to: string;
  steps: RouteStep[];
}

export function useFindRoute(from: string, to: string, enabled: boolean) {
  const { routes } = useNavigationContext();

  // We wrap this in a "query-like" object or just use simple execution
  // Since original code used useQuery, we can mock it or just useMemo if we want re-renders on route change.
  // However, existing consumers expect a query result object.
  // We can stick to a simple hook return or useQuery for consistency if we wanted async, but sync is fine.

  // Actually, let's just compute it.

  if (!enabled || !from || !to) {
    return { data: null, isLoading: false };
  }

  // 1. Try Manual Route from Context (Admin overrides)
  const manualRoute = routes.find(r => r.from === from && r.to === to);
  if (manualRoute) {
    return {
      data: {
        id: `manual-${from}-${to}`,
        from,
        to,
        steps: manualRoute.steps
      },
      isLoading: false
    };
  }

  // 2. Try Graph Route (Codebase logic)
  const graphResult = findGraphRoute(from, to);
  if (graphResult) {
    // Map graph steps to RouteStep
    const steps: RouteStep[] = graphResult.steps.map((step) => ({
      instruction: step.instruction,
      icon: step.icon_type as any, // Cast because defined type in graphData might differ slightly from routes.ts
      floor: step.floor ?? 0,
    }));

    return {
      data: {
        id: "local-generated-route",
        from,
        to,
        steps,
      },
      isLoading: false
    };
  }

  return { data: null, isLoading: false };
}
