import { buildingData } from "./building_data";
import { FloorId, NodeType } from "@/types/building";

export type LocationType = "entry" | "room" | "lab" | "office" | "hotspot" | "utility";

export interface Location {
  id: string;
  name: string;
  name_ml?: string;
  name_kn?: string;
  floor: number;
  type: LocationType;
  isUnavailable?: boolean;
  x?: number;
  y?: number;
  cue?: string;
  cue_ml?: string;
  cue_kn?: string;
  image?: string;
}

const nodeTypeMap: Record<NodeType, LocationType> = {
  junction: "utility",
  room: "room",
  stairs: "utility",
  lift: "utility",
  entry: "entry",
  exit: "utility"
};

const floorToNumber: Record<FloorId, number> = {
  "G": 0,
  "F1": 1,
  "F2": 2
};

export const locations: Location[] = buildingData.building.floors.flatMap(floor =>
  floor.nodes
    .filter(node => node.node_type !== 'junction')
    .map(node => ({
      id: node.node_id,
      name: node.name,
      name_ml: node.name_ml,
      name_kn: node.name_kn,
      floor: floorToNumber[floor.floor_id],
      type: node.category || nodeTypeMap[node.node_type] || "room",
      cue: node.cue,
      cue_ml: node.cue_ml,
      cue_kn: node.cue_kn,
      image: node.image || "/panorama.jpg"
    }))
);

export const entryPoints = locations.filter(
  (l) => l.type === "entry" || l.type === "utility"
);

export const destinations = locations;

export const getLocation = (id: string) => locations.find((l) => l.id === id);

export const getFloorLabel = (floor: number) => {
  if (floor === 0) return "Ground Floor";
  return `Floor ${floor}`;
};

export const locationTypeLabels: Record<LocationType, string> = {
  entry: "Entry Point",
  room: "Room",
  lab: "Lab",
  office: "Office",
  hotspot: "Hotspot",
  utility: "Utility",
};
