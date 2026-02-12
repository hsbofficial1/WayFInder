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
  const { routes, locations, edges } = useNavigationContext();

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
  const graphResult = findGraphRoute(from, to, locations, edges);
  if (graphResult) {
    // Map graph steps to RouteStep
    const steps: RouteStep[] = graphResult.steps.map((step: any) => ({
      instruction: step.instruction,
      instruction_ml: step.instruction_ml,
      instruction_kn: step.instruction_kn,
      icon: step.icon_type as any,
      floor: step.floor ?? 0,
      landmarkImage: step.landmarkImage,
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
