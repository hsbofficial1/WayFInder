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

export const locations: Location[] = [
  // Ground Floor
  { id: "reception", name: "Reception", floor: 0, type: "entry" },
  { id: "asap-office", name: "Asap Office", floor: 0, type: "office" },
  { id: "emergency-exit", name: "Emergency Exit", floor: 0, type: "utility" },
  { id: "leap-ksum", name: "Leap / Kerala Startup Mission", floor: 0, type: "office" },
  { id: "openmind-makerspace", name: "Openmind Makerspace", floor: 0, type: "hotspot" },
  { id: "sane-room", name: "The Sane Room", floor: 0, type: "room" },
  { id: "autonomous-auas", name: "Autonomous AUAS", floor: 0, type: "office" },
  { id: "washroom-g", name: "Washroom 1", floor: 0, type: "utility" },
  { id: "dining-hall", name: "Dining Hall", floor: 0, type: "hotspot" },
  { id: "first-aid-room", name: "First Aid Room", floor: 0, type: "utility" },
  { id: "staircase-g", name: "Stairs 1", floor: 0, type: "utility" },
  { id: "lift-g", name: "Lift 1", floor: 0, type: "utility" },

  // First Floor
  { id: "rappin-range", name: "Rappin' Range", floor: 1, type: "room" },
  { id: "crown-down", name: "Crown Down", floor: 1, type: "room" },
  { id: "unknown-room", name: "Unknown Room", floor: 1, type: "room" },
  { id: "link-admin-office", name: "Link Administrative Office", floor: 1, type: "office" },
  { id: "staircase-1", name: "Stairs 2", floor: 1, type: "utility" },
  { id: "lift-1", name: "Lift 2", floor: 1, type: "utility" },
  { id: "foursquare-link", name: "Foursquare Link", floor: 1, type: "office" },
  { id: "noodlin-space", name: "Noodlin' Space", floor: 1, type: "hotspot" },
  { id: "cranium-room", name: "Cranium Room", floor: 1, type: "room" },
  { id: "server-room-1", name: "Server Room", floor: 1, type: "utility" },
  { id: "focus-space", name: "Focus Space", floor: 1, type: "hotspot" },
  { id: "washroom-1", name: "Washroom 2", floor: 1, type: "utility" },
  { id: "curiosity-weekends", name: "Curiosity Weekends", floor: 1, type: "hotspot" },
];

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
