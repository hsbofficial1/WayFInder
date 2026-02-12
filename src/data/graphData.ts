import { NavigationGraph, Point } from "@/lib/navigation-graph";
import { locations, Location, getLocation } from "./locations";

const graph = new NavigationGraph();

// Define Coordinates
const coordinates: Record<string, Point> = {
    // Ground Floor
    "reception": { x: 0, y: 0, floor: 0 },
    "asap-office": { x: -10, y: 10, floor: 0 },
    "emergency-exit": { x: 10, y: 20, floor: 0 },
    "leap-ksum": { x: -10, y: 20, floor: 0 },
    "openmind-makerspace": { x: 10, y: 10, floor: 0 },
    "sane-room": { x: -10, y: -10, floor: 0 },
    "autonomous-auas": { x: 10, y: -10, floor: 0 },
    "washroom-g": { x: -5, y: -15, floor: 0 },
    "dining-hall": { x: 5, y: -15, floor: 0 },
    "first-aid-room": { x: 15, y: 15, floor: 0 },
    "staircase-g": { x: 15, y: 0, floor: 0 },
    "lift-g": { x: 20, y: 0, floor: 0 },

    // 1st Floor
    "staircase-1": { x: 15, y: 0, floor: 1 },
    "lift-1": { x: 20, y: 0, floor: 1 },
    "rappin-range": { x: -10, y: 10, floor: 1 },
    "crown-down": { x: 0, y: 15, floor: 1 },
    "unknown-room": { x: 10, y: 15, floor: 1 },
    "link-admin-office": { x: 15, y: 10, floor: 1 },
    "foursquare-link": { x: -10, y: -10, floor: 1 },
    "noodlin-space": { x: -5, y: -15, floor: 1 },
    "cranium-room": { x: 5, y: -15, floor: 1 },
    "server-room-1": { x: 10, y: -10, floor: 1 },
    "focus-space": { x: 15, y: 5, floor: 1 },
    "washroom-1": { x: 15, y: -5, floor: 1 },
    "curiosity-weekends": { x: 0, y: 20, floor: 1 },
};

// Add Nodes
Object.entries(coordinates).forEach(([id, coords]) => {
    graph.addNode(id, coords);
});

// Add Edges (bidirectional by default)
// Ground Floor Connections
graph.addEdge("reception", "staircase-g", 15, "walk");
graph.addEdge("reception", "lift-g", 20, "walk");
graph.addEdge("reception", "asap-office", 15, "walk");
graph.addEdge("reception", "openmind-makerspace", 15, "walk");
graph.addEdge("reception", "sane-room", 15, "walk");
graph.addEdge("reception", "autonomous-auas", 15, "walk");
graph.addEdge("asap-office", "leap-ksum", 10, "walk");
graph.addEdge("openmind-makerspace", "emergency-exit", 10, "walk");
graph.addEdge("emergency-exit", "first-aid-room", 10, "walk");
graph.addEdge("sane-room", "washroom-g", 10, "walk");
graph.addEdge("autonomous-auas", "dining-hall", 10, "walk");

// Vertical Connections
graph.addEdge("staircase-g", "staircase-1", 20, "stairs", true);
graph.addEdge("lift-g", "lift-1", 5, "lift", true);

// 1st Floor Connections
graph.addEdge("staircase-1", "rappin-range", 20, "walk");
graph.addEdge("staircase-1", "link-admin-office", 10, "walk");
graph.addEdge("lift-1", "focus-space", 5, "walk");
graph.addEdge("rappin-range", "crown-down", 10, "walk");
graph.addEdge("crown-down", "curiosity-weekends", 10, "walk");
graph.addEdge("crown-down", "unknown-room", 10, "walk");
graph.addEdge("link-admin-office", "server-room-1", 15, "walk");
graph.addEdge("rappin-range", "foursquare-link", 20, "walk");
graph.addEdge("foursquare-link", "noodlin-space", 10, "walk");
graph.addEdge("server-room-1", "cranium-room", 10, "walk");
graph.addEdge("server-room-1", "washroom-1", 10, "walk");

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
    "reception": {
        label: "Reception",
        cue: "the main desk area",
        image: "https://photo-sphere-viewer.js.org/assets/sphere.jpg" // High quality indoor 360
    },
    "asap-office": {
        label: "Asap Office",
        cue: "the office with ASAP branding",
        image: "https://p1.pstatp.com/origin/pgc-image/4a1d47348981434f81c7e9f3b1742721" // Modern lobby 360
    },
    "emergency-exit": { label: "Emergency Exit", cue: "the brightly lit exit sign" },
    "leap-ksum": { label: "Leap / Kerala Startup Mission", cue: "the KSUM workspace" },
    "openmind-makerspace": {
        label: "Openmind Makerspace",
        cue: "the room with 3D printers and tools",
        image: "https://raw.githubusercontent.com/mrdoob/three.js/master/examples/textures/equirectangular/park.jpg" // Sample 360
    },
    "sane-room": { label: "The Sane Room", cue: "the quiet zone" },
    "autonomous-auas": { label: "Autonomous AUAS", cue: "the AUAS research lab" },
    "washroom-g": { label: "Washroom 1", cue: "the restroom near Sane Room" },
    "dining-hall": {
        label: "Dining Hall",
        cue: "the large hall with tables",
        image: "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&q=80&w=2000"
    },
    "first-aid-room": { label: "First Aid Room", cue: "the room with a medical cross" },
    "staircase-g": { label: "Stairs 1", cue: "the main stairs" },
    "lift-g": { label: "Lift 1", cue: "the elevator bank" },

    // 1st Floor
    "rappin-range": {
        label: "Rappin' Range",
        cue: "the area with soundproofing",
        image: "https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/22ed7856b3e84325a728b7f5e3b5e4c0~tplv-k3u1fbpfcp-watermark.image" // Studio-like 360
    },
    "crown-down": { label: "Crown Down", cue: "the chill area" },
    "unknown-room": { label: "Unknown Room", cue: "the unmarked door" },
    "link-admin-office": { label: "Link Administrative Office", cue: "the admin hub" },
    "staircase-1": { label: "Stairs 2", cue: "the upper stairs landing" },
    "lift-1": { label: "Lift 2", cue: "the upper elevator lobby" },
    "foursquare-link": { label: "Foursquare Link", cue: "the networking space" },
    "noodlin-space": { label: "Noodlin' Space", cue: "the creative corner" },
    "cranium-room": { label: "Cranium Room", cue: "the brainstorming room" },
    "server-room-1": { label: "Server Room", cue: "the secure room with server racks" },
    "focus-space": { label: "Focus Space", cue: "the individual work pods" },
    "washroom-1": { label: "Washroom 2", cue: "the upper floor restroom" },
    "curiosity-weekends": { label: "Curiosity Weekends", cue: "the event space" },
};

export interface RouteStep {
    instruction: string;
    instruction_ml?: string;
    instruction_kn?: string;
    icon_type: string;
    floor?: number;
    landmarkImage?: string;
}

export const findGraphRoute = (
    fromId: string,
    toId: string,
    customLocations?: Location[],
    customEdges?: any[]
) => {
    let activeGraph = graph;
    let activeCoords = coordinates;
    let activeLandmarks = landmarks;

    if (customLocations && customEdges) {
        activeGraph = new NavigationGraph();
        activeCoords = {};
        activeLandmarks = {};

        customLocations.forEach(loc => {
            if (loc.x !== undefined && loc.y !== undefined) {
                const coords = { x: loc.x, y: loc.y, floor: loc.floor };
                activeGraph.addNode(loc.id, coords);
                activeCoords[loc.id] = coords;
                activeLandmarks[loc.id] = {
                    label: loc.name,
                    label_ml: loc.name_ml,
                    label_kn: loc.name_kn,
                    cue: loc.cue || "the area",
                    cue_ml: loc.cue_ml,
                    cue_kn: loc.cue_kn,
                    image: loc.image
                };
            }
        });

        customEdges.forEach(edge => {
            activeGraph.addEdge(edge.from, edge.to, edge.weight, edge.type, edge.bidirectional !== false);
        });
    }

    const pathIds = activeGraph.findPath(fromId, toId);
    if (!pathIds || pathIds.length < 2) return null;

    const steps: RouteStep[] = [];

    // Initial instruction
    const startLoc = activeLandmarks[fromId] || { label: fromId, cue: "the starting point", image: undefined };
    steps.push({
        instruction: `Start at ${startLoc.label}, near ${startLoc.cue}.`,
        instruction_ml: `${startLoc.label_ml || startLoc.label}-ൽ നിന്ന് ആരംഭിക്കുക.`,
        instruction_kn: `${startLoc.label_kn || startLoc.label} ನಿಂದ ಪ್ರಾರಂಭಿಸಿ.`,
        icon_type: "start",
        floor: activeCoords[fromId]?.floor,
        landmarkImage: startLoc.image
    });

    for (let i = 0; i < pathIds.length - 1; i++) {
        const curr = pathIds[i];
        const next = pathIds[i + 1];
        const prev = i > 0 ? pathIds[i - 1] : null;

        const p1 = prev ? activeCoords[prev] : null;
        const p2 = activeCoords[curr];
        const p3 = activeCoords[next];

        const currLandmark = activeLandmarks[curr] || { label: curr, cue: "the area", image: undefined };
        const nextLandmark = activeLandmarks[next] || { label: next, cue: "the area", image: undefined };

        let instruction = "";
        let icon = "straight";
        let stepImage: string | undefined = undefined;

        if (p2.floor !== p3.floor) {
            const isLift = curr.includes("lift");
            const direction = p3.floor > p2.floor ? "up" : "down";

            icon = isLift ? (direction === "up" ? "lift-up" : "lift-down") : (direction === "up" ? "stairs-up" : "stairs-down");
            instruction = `Take the ${currLandmark.label} ${direction} to Floor ${p3.floor}. Look for ${isLift ? "the button panel" : "the handrail"}.`;
            stepImage = currLandmark.image;

        } else {
            if (p1 && p1.floor === p2.floor) {
                const turnDir = activeGraph.getTurnDirection(p1, p2, p3);

                stepImage = currLandmark.image;

                if (turnDir === "left") {
                    icon = "left";
                    instruction = `When you reach ${currLandmark.label}, turn left. You should see ${currLandmark.cue}.`;
                } else if (turnDir === "right") {
                    icon = "right";
                    instruction = `Turn right at ${currLandmark.label}, near ${currLandmark.cue}.`;
                } else {
                    icon = "straight";
                    instruction = `Continue straight past ${currLandmark.label}. Keep ${currLandmark.cue} on your side using it as a guide.`;
                }
            } else if (!prev) {
                instruction = `Walk towards ${nextLandmark.label}. Look out for ${nextLandmark.cue}.`;
                stepImage = nextLandmark.image;
            } else {
                instruction = `Exit the ${currLandmark.label} and proceed towards ${nextLandmark.label}.`;
                stepImage = currLandmark.image;
            }
        }

        if (instruction) {
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

        if (i + 1 === pathIds.length - 1) {
            steps.push({
                instruction: `You have reached ${nextLandmark.label}! It is right there by ${nextLandmark.cue}.`,
                instruction_ml: `നിങ്ങൾ ${nextLandmark.label_ml || nextLandmark.label}-ൽ എത്തിച്ചേർന്നു!`,
                instruction_kn: `ನಿಮ್ಮ ಗಮ್ಯಸ್ಥಾನ ${nextLandmark.label_kn || nextLandmark.label} ತಲುಪಿದೆ!`,
                icon_type: "destination",
                floor: p3.floor,
                landmarkImage: nextLandmark.image
            });
        }
    }

    // Calculate total weight
    let totalWeight = 0;
    for (let i = 0; i < pathIds.length - 1; i++) {
        const curr = pathIds[i];
        const next = pathIds[i + 1];
        const neighbors = activeGraph.adjacencyList[curr] || [];
        const edge = neighbors.find(e => e.to === next);
        if (edge) totalWeight += edge.weight;
    }

    return { path: pathIds, steps, totalWeight };
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
