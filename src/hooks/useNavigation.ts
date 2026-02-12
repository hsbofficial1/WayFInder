import { useMemo } from "react";
import { useNavigationContext } from "@/context/NavigationContext";
import { findGraphRoute } from "@/data/graphData";
import { RouteStep } from "@/data/routes";

// Re-export types
export type { Location } from "@/data/locations";
export type { Route, RouteStep } from "@/data/routes";

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
  duration?: number; // In seconds
}

export function useFindRoute(from: string, to: string, enabled: boolean) {
  const { routes, locations, edges } = useNavigationContext();

  // 1. Memoize manual route selection
  const manualRoute = useMemo(() => {
    if (!enabled || !from || !to) return null;
    return routes.find(r => r.from === from && r.to === to);
  }, [enabled, from, to, routes]);

  // 2. Memoize graph route calculation
  const graphRoute = useMemo(() => {
    if (!enabled || !from || !to || manualRoute) return null;

    const graphResult = findGraphRoute(from, to, locations, edges);
    if (!graphResult) return null;

    const steps: RouteStep[] = graphResult.steps.map((step: any) => ({
      instruction: step.instruction,
      instruction_ml: step.instruction_ml,
      instruction_kn: step.instruction_kn,
      icon: step.icon_type as any,
      floor: step.floor ?? 0,
      landmarkImage: step.landmarkImage,
    }));

    return {
      id: "local-generated-route",
      from,
      to,
      steps,
      duration: graphResult.totalWeight
    };
  }, [enabled, from, to, locations, edges, manualRoute]);

  const result = useMemo(() => {
    if (manualRoute) {
      return {
        id: `manual-${from}-${to}`,
        from,
        to,
        steps: manualRoute.steps
      };
    }
    return graphRoute;
  }, [manualRoute, graphRoute, from, to]);

  return { data: result, isLoading: false };
}
