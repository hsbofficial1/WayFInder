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

// Define Landmarks & Visual Cues
const landmarks: Record<string, {
    label: string;
    label_ml?: string;
    label_kn?: string;
    cue: string;
    cue_ml?: string;
    cue_kn?: string;
    image?: string
}> = {
    // Ground Floor
    "main-gate": {
        label: "Main Entrance",
        cue: "the glass automatic doors",
        image: "/assets/panoramas/main-gate.jpg"
    },
    "reception": {
        label: "Reception Desk",
        cue: "the large wooden desk with the 'Information' sign",
        image: "/assets/panoramas/reception.jpg"
    },
    "lobby": {
        label: "Main Lobby",
        cue: "the waiting area with blue sofas",
        image: "/assets/panoramas/lobby.jpg"
    },
    "cafeteria": {
        label: "Cafeteria",
        label_ml: "കഫറ്റീരിയ",
        label_kn: "cafeteria",
        cue: "the glass doors smelling of fresh coffee",
        cue_ml: "പുതിയ കാപ്പിയുടെ മണമുള്ള ഗ്ലാസ് വാതിലുകൾ",
        cue_kn: "ತಾಜಾ ಕಾಫಿಯ ವಾಸನೆ ಬರುವ ಗಾಜಿನ ಬಾಗಿಲುಗಳು",
        image: "/assets/panoramas/cafeteria.jpg"
    },
    "staircase-g": { label: "Ground Floor Stairs", cue: "the wide staircase with metal railings" },
    "lift-g": { label: "Ground Floor Lifts", cue: "the silver elevator doors" },
    "washroom-g": { label: "Ground Floor Restroom", cue: "the white door with a hygiene sign" },
    "meeting-room-1": { label: "Meeting Room 1", cue: "the room with frosted glass walls" },

    // 1st Floor
    "staircase-1": { label: "1st Floor Stairs Landing", cue: "the landing with a fire extinguisher" },
    "lift-1": { label: "1st Floor Lifts", cue: "the elevator lobby with a plant" },
    "corridor-1": {
        label: "Main Corridor Junction",
        cue: "the hallway junction near the water cooler",
        image: "/assets/panoramas/hall.jpg"
    },
    "lab-a": { label: "Computer Lab A", cue: "the double doors labeled 'Computer Lab'" },
    "lab-b": { label: "Physics Lab B", cue: "the door with the 'Safety First' poster" },
    "office-101": {
        label: "Office 101",
        cue: "the corner office with a wooden door",
        image: "/assets/panoramas/reception.jpg"
    },
    "office-102": { label: "Office 102", cue: "the office next to the large window" },
    "washroom-1": { label: "1st Floor Restroom", cue: "the blue door" },
    "break-room": { label: "Break Room", cue: "the room with the vending machine visible" },

    // 2nd Floor
    "staircase-2": { label: "2nd Floor Stairs Landing", cue: "the top of the stairs" },
    "lift-2": { label: "2nd Floor Lifts", cue: "the elevator area with a directory sign" },
    "corridor-2": { label: "Upper Corridor", cue: "the hallway with overhead skylights" },
    "server-room": { label: "Server Room", cue: "the secure metal door with a keypad" },
    "conference-hall": {
        label: "Conference Hall",
        cue: "the large double oak doors",
        image: "https://images.unsplash.com/photo-1517502884422-41e157d44355?auto=format&fit=crop&w=2000&q=80" // Hall View
    },
    "desk-area": { label: "Open Desk Area", cue: "the open workspace with hanging plants" },
    "washroom-2": { label: "2nd Floor Restroom", cue: "the facility door" },
};

export interface RouteStep {
    instruction: string;
    instruction_ml?: string;
    instruction_kn?: string;
    icon_type: string;
    floor?: number;
    landmarkImage?: string;
}

export const findGraphRoute = (fromId: string, toId: string) => {
    const pathIds = graph.findPath(fromId, toId);
    if (!pathIds || pathIds.length < 2) return null;

    const steps: RouteStep[] = [];

    // Initial instruction
    const startLoc = landmarks[fromId] || { label: fromId, cue: "the starting point", image: undefined };
    steps.push({
        instruction: `Start at ${startLoc.label}, near ${startLoc.cue}.`,
        instruction_ml: `${startLoc.label_ml || startLoc.label}-ൽ നിന്ന് ആരംഭിക്കുക.`,
        instruction_kn: `${startLoc.label_kn || startLoc.label} ನಿಂದ ಪ್ರಾರಂಭಿಸಿ.`,
        icon_type: "start",
        floor: coordinates[fromId]?.floor,
        landmarkImage: startLoc.image
    });

    for (let i = 0; i < pathIds.length - 1; i++) {
        const curr = pathIds[i];
        const next = pathIds[i + 1];
        const prev = i > 0 ? pathIds[i - 1] : null;

        const p1 = prev ? coordinates[prev] : null; // Previous point
        const p2 = coordinates[curr]; // Current point
        const p3 = coordinates[next]; // Next point

        const currLandmark = landmarks[curr] || { label: curr, cue: "the area", image: undefined };
        const nextLandmark = landmarks[next] || { label: next, cue: "the area", image: undefined };

        let instruction = "";
        let icon = "straight";
        let stepImage: string | undefined = undefined;

        // Check floor change
        if (p2.floor !== p3.floor) {
            const isLift = curr.includes("lift");
            const method = isLift ? "Lift" : "Stairs";
            const direction = p3.floor > p2.floor ? "up" : "down";

            icon = isLift ? (direction === "up" ? "lift-up" : "lift-down") : (direction === "up" ? "stairs-up" : "stairs-down");
            instruction = `Take the ${currLandmark.label} ${direction} to Floor ${p3.floor}. Look for ${isLift ? "the button panel" : "the handrail"}.`;
            stepImage = currLandmark.image;

        } else {
            // Same floor logic
            if (p1 && p1.floor === p2.floor) {
                const turnDir = graph.getTurnDirection(p1, p2, p3);

                stepImage = currLandmark.image;

                if (turnDir === "left") {
                    icon = "left";
                    instruction = `When you reach ${currLandmark.label}, turn left. You should see ${currLandmark.cue}.`;
                } else if (turnDir === "right") {
                    icon = "right";
                    instruction = `Turn right at ${currLandmark.label}, near ${currLandmark.cue}.`;
                } else {
                    icon = "straight";
                    // If moving straight through a landmark
                    instruction = `Continue straight past ${currLandmark.label}. Keep ${currLandmark.cue} on your side using it as a guide.`;
                }
            } else if (!prev) {
                // First step from start
                instruction = `Walk towards ${nextLandmark.label}. Look out for ${nextLandmark.cue}.`;
                stepImage = nextLandmark.image;
            } else {
                // Just arrived at floor from stairs/lift
                instruction = `Exit the ${currLandmark.label} and proceed towards ${nextLandmark.label}.`;
                stepImage = currLandmark.image;
            }
        }

        // Add movement step
        if (instruction) {
            // Simple translation logic (expand as needed)
            const instruction_ml = generateInstructionML(instruction, icon, currLandmark, nextLandmark, p3?.floor);
            const instruction_kn = generateInstructionKN(instruction, icon, currLandmark, nextLandmark, p3?.floor);

            steps.push({
                instruction,
                instruction_ml,
                instruction_kn,
                icon_type: icon,
                floor: p2.floor,
                landmarkImage: stepImage
            });
        }

        // Destination Arrival
        if (i + 1 === pathIds.length - 1) {
            steps.push({
                instruction: `You have reached ${nextLandmark.label}! It is right there by ${nextLandmark.cue}.`,
                instruction_ml: `നിങ്ങൾ ${nextLandmark.label_ml || nextLandmark.label}-ൽ എത്തിച്ചേർന്നു!`,
                instruction_kn: `ನಿಮ್ಮ ಗಮ್ಯಸ್ಥಾನ ${nextLandmark.label_kn || nextLandmark.label} ತಲಪಿದೆ!`,
                icon_type: "destination",
                floor: p3.floor,
                landmarkImage: nextLandmark.image
            });
        }
    }

    return { path: pathIds, steps };
};

function generateInstructionML(base: string, icon: string, curr: any, next: any, floor?: number) {
    // Very basic mapping based on icon type
    const cl = curr.label_ml || curr.label;
    const nl = next.label_ml || next.label;

    if (icon === "start") return `${cl}-ൽ നിന്ന് ആരംഭിക്കുക.`;
    if (icon === "destination") return `നിങ്ങൾ ${nl}-ൽ എത്തിച്ചേർന്നു!`;
    if (icon === "left") return `${cl}-ൽ നിന്ന് ഇടത്തോട്ട് തിരിയുക.`;
    if (icon === "right") return `${cl}-ൽ നിന്ന് വലത്തോട്ട് തിരിയുക.`;
    if (icon === "straight") return `${cl} വഴി നേരെ നടക്കുക.`;
    if (icon.includes("stairs")) return `${floor}-ാം നിലയിലേക്ക് പടികൾ കയറുക.`;
    if (icon.includes("lift")) return `${floor}-ാം നിലയിലേക്ക് ലിഫ്റ്റ് എടുക്കുക.`;
    return base; // Fallback
}

function generateInstructionKN(base: string, icon: string, curr: any, next: any, floor?: number) {
    // Very basic mapping based on icon type
    const cl = curr.label_kn || curr.label;
    const nl = next.label_kn || next.label;

    if (icon === "start") return `${cl} ನಿಂದ ಪ್ರಾರಂಭಿಸಿ.`;
    if (icon === "destination") return `ನಿಮ್ಮ ಗಮ್ಯಸ್ಥಾನ ${nl} ತಲುಪಿದೆ!`;
    if (icon === "left") return `${cl} ನಲ್ಲಿ ಎಡಕ್ಕೆ ತಿರುಗಿ.`;
    if (icon === "right") return `${cl} ನಲ್ಲಿ ಬಲಕ್ಕೆ ತಿರುಗಿ.`;
    if (icon === "straight") return `${cl} ಮೂಲಕ ನೇರವಾಗಿ ನಡೆಯಿರಿ.`;
    if (icon.includes("stairs")) return `${floor} ನೇ ಮಹಡಿಗೆ ಮೆಟ್ಟಿಲುಗಳನ್ನು ಬಳಸಿ.`;
    if (icon.includes("lift")) return `${floor} ನೇ ಮಹಡಿಗೆ ಲಿಫ್ಟ್ ತೆಗೆದುಕೊಳ್ಳಿ.`;
    return base; // Fallback
}
