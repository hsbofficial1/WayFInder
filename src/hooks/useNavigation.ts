import { useMemo } from "react";
import { useNavigationContext } from "@/context/NavigationContext";
import { findGraphRoute } from "@/data/graphData";
import { RouteStep, Route } from "@/data/routes";

export type { Location } from "@/data/locations";
export type { Route, RouteStep } from "@/data/routes";

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
  duration?: number;
}

export function useFindRoute(from: string, to: string, enabled: boolean) {
  const { routes, locations, graphNodes, graphEdges } = useNavigationContext();

  const manualRoute = useMemo(() => {
    if (!enabled || !from || !to) return null;
    return routes.find(r => r.from === from && r.to === to);
  }, [enabled, from, to, routes]);

  const graphRoute = useMemo(() => {
    if (!enabled || !from || !to || manualRoute) return null;

    // Use graphNodes and graphEdges from context which might be fetched from Supabase
    const graphResult = findGraphRoute(from, to, graphNodes, graphEdges);
    if (!graphResult) return null;

    return {
      id: "local-generated-route",
      from,
      to,
      steps: graphResult.steps,
      duration: graphResult.totalWeight
    };
  }, [enabled, from, to, graphNodes, graphEdges, manualRoute]);

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
