import { NavigationGraph, Point } from "@/lib/navigation-graph";
import { locations, Location, getLocation } from "./locations";

const graph = new NavigationGraph();

// Define Coordinates
const coordinates: Record<string, Point> = {
    // Ground Floor
    "main-gate": { x: 0, y: 0, floor: 0 },
    "reception": { x: 0, y: 15, floor: 0 }, // Straight from Gate
    "lobby": { x: 0, y: 25, floor: 0 }, // Past Reception
    "cafeteria": { x: -15, y: 15, floor: 0 }, // Left from Reception
    "staircase-g": { x: 15, y: 15, floor: 0 }, // Right from Reception
    "lift-g": { x: 20, y: 15, floor: 0 }, // Further Right
    "washroom-g": { x: -5, y: 10, floor: 0 }, // Near Reception
    "meeting-room-1": { x: -10, y: 25, floor: 0 }, // Left from Lobby

    // 1st Floor
    "staircase-1": { x: 15, y: 15, floor: 1 },
    "lift-1": { x: 20, y: 15, floor: 1 },
    "corridor-1": { x: 15, y: 25, floor: 1 }, // Virtual node for corridor
    "lab-a": { x: 10, y: 25, floor: 1 }, // Left from corridor
    "lab-b": { x: 20, y: 25, floor: 1 }, // Right from corridor
    "office-101": { x: 5, y: 25, floor: 1 },
    "office-102": { x: 25, y: 25, floor: 1 },
    "washroom-1": { x: 15, y: 30, floor: 1 },
    "break-room": { x: -5, y: 25, floor: 1 },

    // 2nd Floor
    "staircase-2": { x: 15, y: 15, floor: 2 },
    "lift-2": { x: 20, y: 15, floor: 2 },
    "corridor-2": { x: 15, y: 25, floor: 2 },
    "server-room": { x: 10, y: 25, floor: 2 },
    "conference-hall": { x: 15, y: 40, floor: 2 },
    "desk-area": { x: 25, y: 20, floor: 2 },
    "washroom-2": { x: 15, y: 30, floor: 2 },
};

// Add Nodes
Object.entries(coordinates).forEach(([id, coords]) => {
    graph.addNode(id, coords);
});

// Add Edges (bidirectional by default)
// Ground
graph.addEdge("main-gate", "reception", 15, "walk");
graph.addEdge("reception", "lobby", 10, "walk");
graph.addEdge("reception", "cafeteria", 15, "walk"); // Left turn implicitly
graph.addEdge("reception", "staircase-g", 15, "walk"); // Right turn
graph.addEdge("reception", "lift-g", 20, "walk");
graph.addEdge("reception", "washroom-g", 8, "walk");
graph.addEdge("lobby", "meeting-room-1", 10, "walk");

// Vertical Connections
graph.addEdge("staircase-g", "staircase-1", 20, "stairs", true); // Up/Down
graph.addEdge("staircase-1", "staircase-2", 20, "stairs", true);
graph.addEdge("lift-g", "lift-1", 5, "lift", true);
graph.addEdge("lift-1", "lift-2", 5, "lift", true);

// 1st Floor
graph.addEdge("staircase-1", "corridor-1", 10, "walk");
graph.addEdge("lift-1", "corridor-1", 12, "walk");
graph.addEdge("corridor-1", "lab-a", 5, "walk");
graph.addEdge("corridor-1", "lab-b", 5, "walk");
graph.addEdge("corridor-1", "washroom-1", 5, "walk");
graph.addEdge("lab-a", "office-101", 5, "walk");
graph.addEdge("lab-b", "office-102", 5, "walk");
graph.addEdge("office-101", "break-room", 10, "walk");

// 2nd Floor
graph.addEdge("staircase-2", "corridor-2", 10, "walk");
graph.addEdge("lift-2", "corridor-2", 12, "walk");
// graph.addEdge("corridor-2", "server-room", 5, "walk"); // Server room restricted? Let's connect it.
graph.addEdge("corridor-2", "server-room", 5, "walk");
graph.addEdge("corridor-2", "conference-hall", 15, "walk");
graph.addEdge("corridor-2", "washroom-2", 5, "walk");
graph.addEdge("lift-2", "desk-area", 10, "walk");
graph.addEdge("staircase-2", "desk-area", 15, "walk");

export interface RouteStep {
    instruction: string;
    icon_type: string;
    floor?: number;
}

export const findGraphRoute = (fromId: string, toId: string) => {
    const pathIds = graph.findPath(fromId, toId);
    if (!pathIds || pathIds.length < 2) return null;

    const steps: RouteStep[] = [];

    // Initial instruction
    const startLoc = getLocation(fromId);
    steps.push({
        instruction: `Start at ${startLoc?.name || fromId}`,
        icon_type: "start",
        floor: coordinates[fromId]?.floor
    });

    for (let i = 0; i < pathIds.length - 1; i++) {
        const curr = pathIds[i];
        const next = pathIds[i + 1];
        const prev = i > 0 ? pathIds[i - 1] : null;

        const p1 = prev ? coordinates[prev] : null; // Previous point
        const p2 = coordinates[curr]; // Current point
        const p3 = coordinates[next]; // Next point

        const currLoc = getLocation(curr);
        const nextLoc = getLocation(next);

        // Determine instruction
        let instruction = "";
        let icon = "straight";

        // Check floor change
        if (p2.floor !== p3.floor) {
            if (p3.floor > p2.floor) {
                icon = curr.includes("lift") ? "lift-up" : "stairs-up";
                instruction = `Take the ${curr.includes("lift") ? "Lift" : "Stairs"} up to Floor ${p3.floor}`;
            } else {
                icon = curr.includes("lift") ? "lift-down" : "stairs-down";
                instruction = `Take the ${curr.includes("lift") ? "Lift" : "Stairs"} down to Floor ${p3.floor}`;
            }
        } else {
            // Same floor
            let turn = "straight";
            if (p1) {
                // Check turn relative to previous segment
                // We need a helper from graph
                // But since I didn't export it, I'll assume simple logic or implement getTurn here?
                // Actually I did export getTurnDirection in NavigationGraph class? 
                // Yes, but I need to access it. `graph` is instance.
                // Wait, getTurnDirection is on the instance.
                // But I need p1, p2, p3.
                // Wait, if p1 and p2 have different floors, turn is undefined (or straight).
                if (p1.floor === p2.floor) {
                    // Actually the graph method expects strict points.
                    // Impl:
                    // const turn = graph.getTurnDirection(p1, p2, p3);
                    // But `graph` is not exported as class, only instance. 
                    // I can call graph.getTurnDirection.
                    // Wait, TS might complain if I didn't export it? I exported the class.
                    // I can just re-implement it or call it.

                    // Let's assume straight unless turn detected.
                    const turnDir = (graph as any).getTurnDirection(p1, p2, p3); // Cast if needed or fix class
                    if (turnDir === "left") {
                        icon = "left";
                        instruction = `Turn left at ${currLoc?.name || curr}`;
                    } else if (turnDir === "right") {
                        icon = "right";
                        instruction = `Turn right at ${currLoc?.name || curr}`;
                    } else {
                        icon = "straight";
                        instruction = `Go straight past ${currLoc?.name || curr}`;
                    }
                } else {
                    // Came from stairs/lift
                    instruction = `Exit the ${currLoc?.name || curr} and go straight`;
                }
            } else {
                // First step (after Start)
                instruction = `Walk towards ${nextLoc?.name || next}`;
            }
        }

        // Add movement step
        // Only add if it's a significant instruction (turn or floor change)
        // Or if it's arriving at destination?

        // Simplification for manual PWA:
        // If "Go straight", maybe we accumulate distance?
        // But user wants "step-by-step".

        // If next is destination
        if (i + 1 === pathIds.length - 1) {
            // Special case for last leg
            if (instruction) steps.push({ instruction, icon_type: icon, floor: p2.floor });
            steps.push({
                instruction: `You have arrived at ${nextLoc?.name || next}`,
                icon_type: "destination",
                floor: p3.floor
            });
        } else {
            steps.push({ instruction, icon_type: icon, floor: p2.floor });
        }
    }

    // Filter out redundant "straight" instructions if they are just passing through virtual nodes?
    // e.g. "Go straight past corridor-1".
    // Ideally we merge straight segments. 
    // For now, raw steps are okay.

    return { path: pathIds, steps };
};
