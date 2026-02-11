import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";

export type Location = Tables<"locations">;
export type RouteRow = Tables<"routes">;
export type RouteStep = Tables<"route_steps">;

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
  return useQuery({
    queryKey: ["locations"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("locations")
        .select("*")
        .order("floor")
        .order("name");
      if (error) throw error;
      return data as Location[];
    },
    staleTime: Infinity, // locations rarely change
  });
}

export interface RouteWithSteps {
  id: string;
  from: string;
  to: string;
  steps: RouteStep[];
}

export function useFindRoute(from: string, to: string, enabled: boolean) {
  return useQuery({
    queryKey: ["route", from, to],
    queryFn: async (): Promise<RouteWithSteps | null> => {
      // Find the route
      const { data: route, error: routeError } = await supabase
        .from("routes")
        .select("*")
        .eq("from_location_id", from)
        .eq("to_location_id", to)
        .maybeSingle();

      if (routeError) throw routeError;
      if (!route) return null;

      // Get steps
      const { data: steps, error: stepsError } = await supabase
        .from("route_steps")
        .select("*")
        .eq("route_id", route.id)
        .order("step_order");

      if (stepsError) throw stepsError;

      return {
        id: route.id,
        from: route.from_location_id,
        to: route.to_location_id,
        steps: steps || [],
      };
    },
    enabled,
    staleTime: Infinity,
  });
}
