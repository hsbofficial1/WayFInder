export type LocationType = "entry" | "room" | "lab" | "office" | "hotspot" | "utility";

export interface Location {
  id: string;
  name: string;
  name_ml?: string;
  name_kn?: string;
  floor: number;
  type: LocationType;
}

export const locations: Location[] = [
  // Ground Floor - Entry Points
  { id: "main-gate", name: "Main Gate", name_ml: "പ്രധാന കവാടം", name_kn: "ಮುಖ್ಯ ದ್ವಾರ", floor: 0, type: "entry" },
  { id: "reception", name: "Reception Desk", name_ml: "റിസപ്ഷൻ ഡെസ്ക്", name_kn: "ಸ್ವಾಗತ ಕೇಂದ್ರ", floor: 0, type: "entry" },
  { id: "lobby", name: "Main Lobby", floor: 0, type: "entry" },
  { id: "staircase-g", name: "Staircase (Ground)", floor: 0, type: "utility" },
  { id: "lift-g", name: "Lift (Ground)", floor: 0, type: "utility" },
  { id: "washroom-g", name: "Washroom (Ground)", name_ml: "ശുചിമുറി (താഴത്തെ നില)", name_kn: "ಶೌಚಾಲಯ (ನೆಲ)", floor: 0, type: "utility" },
  { id: "cafeteria", name: "Cafeteria", name_ml: "കഫറ്റീരിയ", name_kn: "cafeteria", floor: 0, type: "hotspot" },
  { id: "meeting-room-1", name: "Meeting Room 1", floor: 0, type: "room" },

  // First Floor
  { id: "staircase-1", name: "Staircase (1st Floor)", floor: 1, type: "utility" },
  { id: "lift-1", name: "Lift (1st Floor)", floor: 1, type: "utility" },
  { id: "lab-a", name: "Lab A", floor: 1, type: "lab" },
  { id: "lab-b", name: "Lab B", floor: 1, type: "lab" },
  { id: "office-101", name: "Office 101", floor: 1, type: "office" },
  { id: "office-102", name: "Office 102", floor: 1, type: "office" },
  { id: "washroom-1", name: "Washroom (1st Floor)", floor: 1, type: "utility" },
  { id: "break-room", name: "Break Room", floor: 1, type: "hotspot" },

  // Second Floor
  { id: "staircase-2", name: "Staircase (2nd Floor)", floor: 2, type: "utility" },
  { id: "lift-2", name: "Lift (2nd Floor)", floor: 2, type: "utility" },
  { id: "server-room", name: "Server Room", floor: 2, type: "room" },
  { id: "conference-hall", name: "Conference Hall", floor: 2, type: "room" },
  { id: "desk-area", name: "Open Desk Area", floor: 2, type: "hotspot" },
  { id: "washroom-2", name: "Washroom (2nd Floor)", floor: 2, type: "utility" },
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
