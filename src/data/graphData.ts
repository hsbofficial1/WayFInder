import { buildingData } from "./building_data";
import { BuildingNode, FloorId } from "@/types/building";

// Graph Types
interface GraphEdge {
    to: string; // Target Node ID
    weight: number; // Distance in steps
    instruction: string;
    type: string; // "corridor" | "stairs" | "lift"
    turn?: string;
}

interface Graph {
    [fromNodeId: string]: GraphEdge[];
}

export interface RouteStep {
    instruction: string;
    instruction_ml?: string; // Optional multilingual support
    instruction_kn?: string;
    icon_type: string;
    floor?: number;
    landmarkImage?: string;
}

// Helper to convert FloorID to Number
const floorToNumber = (f: string): number => {
    if (f === "G") return 0;
    if (f === "F1") return 1;
    if (f === "F2") return 2;
    return 0;
};

// Build the graph from buildingData
const buildGraph = () => {
    const graph: Graph = {};
    const nodesMap: Record<string, BuildingNode & { floorNumber: number }> = {};

    // Helper to add edge
    const addEdge = (from: string, to: string, weight: number, instruction: string, type: string, turn?: string) => {
        if (!graph[from]) graph[from] = [];
        // Avoid duplicates
        if (!graph[from].find(e => e.to === to)) {
            graph[from].push({ to, weight, instruction, type, turn });
        }
    };

    console.log("Building Graph...", buildingData);
    buildingData.building.floors.forEach(floor => {
        console.log(`Processing floor ${floor.floor_id}, nodes: ${floor.nodes?.length}, edges: ${floor.edges?.length}`);

        // 1. Index nodes
        if (floor.nodes) {
            floor.nodes.forEach(node => {
                nodesMap[node.node_id] = {
                    ...node,
                    floorNumber: floorToNumber(node.floor)
                };
            });
            console.log("Nodes indexed:", Object.keys(nodesMap).length);
        } else {
            console.error("Floor nodes missing!", floor);
        }

        // 2. Add explicit provided edges
        if (floor.edges) {
            floor.edges.forEach(edge => {
                addEdge(edge.from, edge.to, edge.distance_steps, edge.instruction, edge.edge_type, edge.turn);
                // Note: We blindly add what is in the data. If bidirectional, data should have both.
            });
        }

        // 3. Auto-generate Junction <-> Room edges (Bidirectional)
        floor.nodes.forEach(node => {
            if (node.node_type !== "junction" && node.junction_id) {
                const junction = nodesMap[node.junction_id];

                if (junction) {
                    // Room -> Junction
                    addEdge(
                        node.node_id,
                        node.junction_id,
                        5,
                        `Exit ${node.name} and proceed to the corridor`,
                        "corridor"
                    ); // Room -> Junction: exiting is usually just moving straight into corridor

                    // Junction -> Room
                    addEdge(
                        node.junction_id,
                        node.node_id,
                        5,
                        `Enter ${node.name}`,
                        "corridor"
                    ); // Icon logic handles "destination" for this case automatically in findGraphRoute
                }
            }
        });
    });

    return { graph, nodesMap };
};

// const { graph, nodesMap } = buildGraph(); // Moved inside function

export const findGraphRoute = (
    fromId: string,
    toId: string,
    customLocations?: any[],
    customEdges?: any[]
) => {
    // Re-build graph on demand to ensure latest data (fixes HMR/Module init issues)
    const { graph, nodesMap } = buildGraph();

    // Dijkstra Algorithm
    const distances: Record<string, number> = {};
    const previous: Record<string, string | null> = {};
    const queue: string[] = [];

    // --- Shortest Path Algorithm (Dijkstra) ---
    // This guarantees the route with the minimum total steps is selected.

    // Initialize distances
    Object.keys(nodesMap).forEach(nodeId => {
        distances[nodeId] = Infinity;
        previous[nodeId] = null;
        queue.push(nodeId);
    });

    distances[fromId] = 0;

    // Safety Check: Ensure start/end nodes exist
    if (!nodesMap[fromId] || !nodesMap[toId]) {
        console.error(`Invalid Route: Start (${fromId}) or End (${toId}) node missing.`);
        return null;
    }

    // Helper: Find the unvisited node with the smallest distance
    const getMinNode = () => {
        let minNode: string | null = null;
        let minDist = Infinity;
        queue.forEach(node => {
            if (distances[node] < minDist) {
                minDist = distances[node];
                minNode = node;
            }
        });
        return minNode;
    };

    // Main Loop
    while (queue.length > 0) {
        const u = getMinNode();

        // If smallest distance is Infinity, remaining nodes are unreachable
        if (u === null || distances[u] === Infinity) break;

        // If we reached the target, we can stop (shortest path guaranteed)
        if (u === toId) break;

        // Remove u from unvisited queue
        const index = queue.indexOf(u);
        queue.splice(index, 1);

        // Relax neighbors
        const neighbors = graph[u] || [];
        neighbors.forEach(edge => {
            // Calculate new potential distance
            const alt = distances[u] + edge.weight;

            // If shorter path found, update it
            if (alt < distances[edge.to]) {
                distances[edge.to] = alt;
                previous[edge.to] = u;
            }
        });
    }

    // Reconstruction
    const path: string[] = [];
    let u: string | null = toId;

    // Check if reachable
    if (distances[toId] === Infinity) return null;

    while (u !== null) {
        path.unshift(u);
        u = previous[u];
    }

    if (path.length < 2) return null;

    // Generate Steps
    const steps: RouteStep[] = [];
    let totalWeight = 0;

    for (let i = 0; i < path.length - 1; i++) {
        const curr = path[i];
        const next = path[i + 1];
        const edge = graph[curr]?.find(e => e.to === next);

        if (edge) {
            totalWeight += edge.weight;

            const currNode = nodesMap[curr];
            const nextNode = nodesMap[next];

            if (!currNode) {
                console.error(`Missing node in map: ${curr}`, { path, nodesMap });
                continue;
            }
            if (!nextNode) {
                console.error(`Missing node in map: ${next}`, { path, nodesMap });
                continue;
            }

            // Determine Icon
            let icon = "straight"; // Default

            const isDiffFloor = currNode.floorNumber !== nextNode.floorNumber;

            if (isDiffFloor) {
                const isUp = nextNode.floorNumber > currNode.floorNumber;
                if (edge.type === "lift") {
                    icon = isUp ? "lift-up" : "lift-down";
                } else {
                    icon = isUp ? "stairs-up" : "stairs-down";
                }
            } else {
                // Same floor logic
                if (currNode.node_type === "junction" && nextNode.node_type !== "junction") {
                    // Entering a room/destination
                    icon = "destination";
                } else if (currNode.node_type !== "junction" && nextNode.node_type === "junction") {
                    // Exiting a room
                    icon = "start";
                } else {
                    // Junction to Junction (Corridor)
                    // Use explicit turn if available, otherwise parse string
                    if (edge.turn) {
                        icon = edge.turn;
                    } else {
                        const instr = edge.instruction.toLowerCase();
                        if (instr.includes("left")) icon = "left";
                        else if (instr.includes("right")) icon = "right";
                        else icon = "straight";
                    }
                }
            }

            // Generate Translations (Basic placeholders/logic)
            const instr = edge.instruction;
            const instruction_ml = generateML(instr, icon);
            const instruction_kn = generateKN(instr, icon);

            steps.push({
                instruction: instr,
                instruction_ml,
                instruction_kn,
                icon_type: icon,
                floor: currNode.floorNumber, // Step happens at current node's floor
                // landmarkImage: ... // TODO: Add if metadata available
            });
        }
    }

    // Add final arrival step
    const finalNode = nodesMap[toId];
    if (finalNode) {
        steps.push({
            instruction: `You have reached ${finalNode.name}`,
            instruction_ml: `നിങ്ങൾ ${finalNode.name}-ൽ എത്തിച്ചേർന്നു`,
            instruction_kn: `ನಿಮ್ಮ ಗಮ್ಯಸ್ಥಾನ ${finalNode.name} ತಲುಪಿದೆ`,
            icon_type: "destination",
            floor: finalNode.floorNumber
        });
    }

    return { path, steps, totalWeight };
};


// Simple translation helpers (can be expanded)
function generateML(text: string, icon: string): string {
    if (icon === "left") return "ഇടത്തോട്ട് തിരിയുക";
    if (icon === "right") return "വലത്തോട്ട് തിരിയുക";
    if (icon === "straight") return "നേരെ പോകുക";
    if (icon.includes("stairs")) return "പടികൾ കയറുക";
    if (icon.includes("lift")) return "ലിഫ്റ്റ് ഉപയോഗിക്കുക";
    if (text.includes("Exit")) return "പുറത്തുകടക്കുക";
    if (text.includes("Enter")) return "പ്രവേശിക്കുക";
    return text; // Fallback
}

function generateKN(text: string, icon: string): string {
    if (icon === "left") return "ಎಡಕ್ಕೆ ತಿರುಗಿ";
    if (icon === "right") return "ಬಲಕ್ಕೆ ತಿರುಗಿ";
    if (icon === "straight") return "ನೇರವಾಗಿ ಹೋಗಿ";
    if (icon.includes("stairs")) return "ಮೆಟ್ಟಿಲುಗಳನ್ನು ಬಳಸಿ";
    if (icon.includes("lift")) return "ಲಿಫ್ಟ್ ಬಳಸಿ";
    if (text.includes("Exit")) return "ನಿರ್ಗಮಿಸಿ";
    if (text.includes("Enter")) return "ಪ್ರವೇಶಿಸಿ";
    return text; // Fallback
}
