import { IconType, RouteStep } from "@/types/building";

export type { IconType, RouteStep };

export interface Route {
  from: string;
  to: string;
  steps: RouteStep[];
  isEnabled: boolean;
}

export const routes: Route[] = [];

export const findRoute = (from: string, to: string): Route | undefined => {
  return routes.find((r) => r.from === from && r.to === to);
};
