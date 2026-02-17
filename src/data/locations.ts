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

// Map Node Types to UI Location Types
const nodeTypeMap: Record<NodeType, LocationType> = {
  junction: "utility", // Should not be shown usually
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

// Metadata for enrichment (Images, Cues, Types that are more specific than "room")
// Mapping New Node ID -> Metadata
const nodeMetadata: Record<string, Partial<Location>> = {
  "Reception_G": {
    type: "entry",
    cue: "the main welcome desk"
  },
  "ASAP_G": {
    type: "office",
    cue: "the ASAP Branding office"
  },
  "EmergencyExit_G": { type: "utility", cue: "the corner exit sign" },
  "KSUM_G": { type: "office", cue: "the Mission Start up Kerala / Leap center" },
  "Openmind_G": {
    type: "hotspot",
    cue: "the innovation hub and makerspace"
  },
  "SaneRoom_G": { type: "room", cue: "the quiet focus zone" },
  "AUAS_G": { type: "office", cue: "the Autonomous Systems lab" },
  "Washroom1_G": { type: "utility", cue: "the nearby restroom" },
  "DiningHall_G": {
    type: "hotspot",
    cue: "the cafeteria and dining area"
  },
  "FirstAid_G": { type: "utility", cue: "the medical cross room" },
  "StairsRight1_G": { type: "utility", cue: "the right side stairs" },
  "Lift1_G": { type: "utility", cue: "the elevator bank" },
  "StairsLeft1_G": { type: "utility", cue: "the left side stairs" }
};
// Add F1 metadata if needed later

export const locations: Location[] = buildingData.building.floors.flatMap(floor =>
  floor.nodes
    .filter(node => node.node_type !== 'junction')
    .map(node => {
      const meta = nodeMetadata[node.node_id] || {};
      return {
        id: node.node_id,
        name: node.name,
        floor: floorToNumber[floor.floor_id],
        type: (meta.type as LocationType) || nodeTypeMap[node.node_type] || "room", // Cast to LocationType
        cue: meta.cue,
        image: node.image || meta.image || "/panorama.jpg"
      };
    })
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
