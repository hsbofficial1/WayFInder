export type IconType = "straight" | "left" | "right" | "stairs-up" | "stairs-down" | "lift-up" | "lift-down" | "destination" | "start";

export interface RouteStep {
  instruction: string;
  icon: IconType;
  floor?: number;
}

export interface Route {
  from: string;
  to: string;
  steps: RouteStep[];
}

export const routes: Route[] = [
  // Main Gate → Reception
  {
    from: "main-gate",
    to: "reception",
    steps: [
      { instruction: "You are at the Main Gate. Walk straight ahead.", icon: "start", floor: 0 },
      { instruction: "Go straight for about 15 steps through the entrance corridor.", icon: "straight", floor: 0 },
      { instruction: "The Reception Desk is directly ahead on your right.", icon: "destination", floor: 0 },
    ],
  },
  // Main Gate → Cafeteria
  {
    from: "main-gate",
    to: "cafeteria",
    steps: [
      { instruction: "You are at the Main Gate. Walk straight ahead.", icon: "start", floor: 0 },
      { instruction: "Go straight for about 15 steps past the entrance.", icon: "straight", floor: 0 },
      { instruction: "Turn left at the Reception Desk.", icon: "left", floor: 0 },
      { instruction: "Walk straight for about 20 steps.", icon: "straight", floor: 0 },
      { instruction: "The Cafeteria entrance is on your left.", icon: "destination", floor: 0 },
    ],
  },
  // Reception → Lab A
  {
    from: "reception",
    to: "lab-a",
    steps: [
      { instruction: "You are at the Reception Desk.", icon: "start", floor: 0 },
      { instruction: "Walk straight ahead towards the main corridor.", icon: "straight", floor: 0 },
      { instruction: "Turn right and take the Staircase to the 1st Floor.", icon: "right", floor: 0 },
      { instruction: "Go up one flight of stairs.", icon: "stairs-up", floor: 1 },
      { instruction: "At the top, turn left into the corridor.", icon: "left", floor: 1 },
      { instruction: "Walk straight for about 10 steps.", icon: "straight", floor: 1 },
      { instruction: "Lab A is the first door on your right.", icon: "destination", floor: 1 },
    ],
  },
  // Main Gate → Lab A
  {
    from: "main-gate",
    to: "lab-a",
    steps: [
      { instruction: "You are at the Main Gate. Walk straight ahead.", icon: "start", floor: 0 },
      { instruction: "Go straight past the Reception Desk.", icon: "straight", floor: 0 },
      { instruction: "Turn right towards the Staircase.", icon: "right", floor: 0 },
      { instruction: "Go up one flight of stairs to the 1st Floor.", icon: "stairs-up", floor: 1 },
      { instruction: "Turn left into the corridor.", icon: "left", floor: 1 },
      { instruction: "Walk straight for about 10 steps.", icon: "straight", floor: 1 },
      { instruction: "Lab A is the first door on your right.", icon: "destination", floor: 1 },
    ],
  },
  // Main Gate → Conference Hall
  {
    from: "main-gate",
    to: "conference-hall",
    steps: [
      { instruction: "You are at the Main Gate. Walk straight ahead.", icon: "start", floor: 0 },
      { instruction: "Go straight past the Reception to the Lift.", icon: "straight", floor: 0 },
      { instruction: "Take the Lift to the 2nd Floor.", icon: "lift-up", floor: 2 },
      { instruction: "Exit the Lift and turn right.", icon: "right", floor: 2 },
      { instruction: "Walk straight for about 15 steps.", icon: "straight", floor: 2 },
      { instruction: "The Conference Hall is at the end of the corridor on your left.", icon: "destination", floor: 2 },
    ],
  },
  // Reception → Office 101
  {
    from: "reception",
    to: "office-101",
    steps: [
      { instruction: "You are at the Reception Desk.", icon: "start", floor: 0 },
      { instruction: "Walk towards the Staircase on your right.", icon: "right", floor: 0 },
      { instruction: "Go up one flight of stairs.", icon: "stairs-up", floor: 1 },
      { instruction: "Turn right at the top of the stairs.", icon: "right", floor: 1 },
      { instruction: "Walk straight for about 8 steps.", icon: "straight", floor: 1 },
      { instruction: "Office 101 is on your left.", icon: "destination", floor: 1 },
    ],
  },
  // Main Gate → Desk Area
  {
    from: "main-gate",
    to: "desk-area",
    steps: [
      { instruction: "You are at the Main Gate. Walk straight ahead.", icon: "start", floor: 0 },
      { instruction: "Go straight to the Lift area.", icon: "straight", floor: 0 },
      { instruction: "Take the Lift to the 2nd Floor.", icon: "lift-up", floor: 2 },
      { instruction: "Exit the Lift and go straight.", icon: "straight", floor: 2 },
      { instruction: "Turn left after about 10 steps.", icon: "left", floor: 2 },
      { instruction: "The Open Desk Area is on your right.", icon: "destination", floor: 2 },
    ],
  },
  // Lobby → Meeting Room 1
  {
    from: "lobby",
    to: "meeting-room-1",
    steps: [
      { instruction: "You are in the Main Lobby.", icon: "start", floor: 0 },
      { instruction: "Turn right towards the corridor.", icon: "right", floor: 0 },
      { instruction: "Walk straight for about 12 steps.", icon: "straight", floor: 0 },
      { instruction: "Meeting Room 1 is the second door on your left.", icon: "destination", floor: 0 },
    ],
  },
  // Reception → Break Room
  {
    from: "reception",
    to: "break-room",
    steps: [
      { instruction: "You are at the Reception Desk.", icon: "start", floor: 0 },
      { instruction: "Walk towards the Staircase.", icon: "straight", floor: 0 },
      { instruction: "Go up one flight of stairs.", icon: "stairs-up", floor: 1 },
      { instruction: "Turn left at the top.", icon: "left", floor: 1 },
      { instruction: "Walk straight to the end of the corridor.", icon: "straight", floor: 1 },
      { instruction: "The Break Room is the last door on your right.", icon: "destination", floor: 1 },
    ],
  },
  // Main Gate → Washroom (Ground)
  {
    from: "main-gate",
    to: "washroom-g",
    steps: [
      { instruction: "You are at the Main Gate. Walk straight ahead.", icon: "start", floor: 0 },
      { instruction: "Go straight past Reception.", icon: "straight", floor: 0 },
      { instruction: "Turn left at the end of the corridor.", icon: "left", floor: 0 },
      { instruction: "The Washroom is immediately on your right.", icon: "destination", floor: 0 },
    ],
  },
  // Lobby → Server Room
  {
    from: "lobby",
    to: "server-room",
    steps: [
      { instruction: "You are in the Main Lobby.", icon: "start", floor: 0 },
      { instruction: "Walk towards the Lift.", icon: "straight", floor: 0 },
      { instruction: "Take the Lift to the 2nd Floor.", icon: "lift-up", floor: 2 },
      { instruction: "Exit and turn left.", icon: "left", floor: 2 },
      { instruction: "Walk straight for about 8 steps.", icon: "straight", floor: 2 },
      { instruction: "The Server Room is the secured door on your right.", icon: "destination", floor: 2 },
    ],
  },
];

export const findRoute = (from: string, to: string): Route | undefined => {
  return routes.find((r) => r.from === from && r.to === to);
};
