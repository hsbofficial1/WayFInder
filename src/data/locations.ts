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
    image: "https://photo-sphere-viewer.js.org/assets/sphere.jpg",
    cue: "the main desk area"
  },
  "ASAP_G": {
    type: "office",
    image: "https://p1.pstatp.com/origin/pgc-image/4a1d47348981434f81c7e9f3b1742721",
    cue: "the office with ASAP branding"
  },
  "EmergencyExit_G": { type: "utility", cue: "the brightly lit exit sign" },
  "KSUM_G": { type: "office", cue: "the KSUM workspace" },
  "Openmind_G": {
    type: "hotspot",
    image: "https://raw.githubusercontent.com/mrdoob/three.js/master/examples/textures/equirectangular/park.jpg",
    cue: "the room with 3D printers and tools"
  },
  "SaneRoom_G": { type: "room", cue: "the quiet zone" },
  "AUAS_G": { type: "office", cue: "the AUAS research lab" },
  "Washroom1_G": { type: "utility", cue: "the restroom" },
  "DiningHall_G": {
    type: "hotspot",
    image: "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&q=80&w=2000",
    cue: "the large hall with tables"
  },
  "FirstAid_G": { type: "utility", cue: "the room with a medical cross" },
  "StairsRight1_G": { type: "utility", cue: "the main stairs" },
  "Lift1_G": { type: "utility", cue: "the elevator bank" },
  "StairsLeft1_G": { type: "utility", cue: "the side stairs" }
  // Add F1 metadata if needed later
};

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
        image: meta.image
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
