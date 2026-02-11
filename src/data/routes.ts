export type IconType = "straight" | "left" | "right" | "stairs-up" | "stairs-down" | "lift-up" | "lift-down" | "destination" | "start";

export interface RouteStep {
  instruction: string;
  instruction_ml?: string;
  instruction_kn?: string;
  icon: IconType;
  floor: number;
  panoramaImage?: string;
  landmarkImage?: string;
}

export interface Route {
  from: string;
  to: string;
  steps: RouteStep[];
  isEnabled: boolean;
}

export const routes: Route[] = [
  // Manual routes are temporarily disabled to allow dynamic graph generation (with images) to take precedence.
  // Add manual routes here only if you need to override the graph logic for specific paths.
];

export const findRoute = (from: string, to: string): Route | undefined => {
  return routes.find((r) => r.from === from && r.to === to);
};
