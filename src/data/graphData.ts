import { buildingData } from "./building_data";
import { BuildingNode, BuildingEdge, IconType, RouteStep } from "@/types/building";

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

const floorToNumber = (f: string): number => {
    const mapping: Record<string, number> = { "G": 0, "F1": 1, "F2": 2 };
    return mapping[f] ?? 0;
};

// Internal build function that takes data
const buildGraphFromData = (nodes: BuildingNode[], edges: BuildingEdge[]) => {
    const graph: Graph = {};
    const nodesMap: Record<string, BuildingNode & { floorNumber: number }> = {};

    const addEdge = (from: string, to: string, weight: number, instruction: string, type: string, turn?: string) => {
        if (!graph[from]) graph[from] = [];
        if (!graph[from].find(e => e.to === to)) {
            graph[from].push({ to, weight, instruction, type, turn });
        }
    };

    // 1. Map all nodes
    nodes.forEach(node => {
        nodesMap[node.node_id] = {
            ...node,
            floorNumber: floorToNumber(node.floor)
        };
    });

    // 2. Add explicit edges
    edges.forEach(edge => {
        addEdge(edge.from, edge.to, edge.distance_steps, edge.instruction, edge.edge_type, edge.turn);
    });

    // 3. Auto-generate Junction <-> Room edges (Bidirectional)
    nodes.forEach(node => {
        if (node.node_type !== "junction" && node.junction_id) {
            const junction = nodesMap[node.junction_id];
            if (junction) {
                // Room -> Junction
                addEdge(node.node_id, node.junction_id, 5, `Exit ${node.name} and proceed to the corridor`, "corridor");
                // Junction -> Room
                addEdge(node.junction_id, node.node_id, 5, `Enter ${node.name}`, "corridor");
            }
        }
    });

    return { graph, nodesMap };
};

// Helper to get default data from buildingData singleton
const getDefaultData = () => {
    const nodes: BuildingNode[] = buildingData.building.floors.flatMap(f => f.nodes);
    const edges: BuildingEdge[] = buildingData.building.floors.flatMap(f => f.edges || []);
    return { nodes, edges };
};

export const findGraphRoute = (
    fromId: string,
    toId: string,
    providedNodes?: BuildingNode[],
    providedEdges?: BuildingEdge[]
) => {
    const nodes = (providedNodes && providedNodes.length > 0) ? providedNodes : getDefaultData().nodes;
    const edges = (providedEdges && providedEdges.length > 0) ? providedEdges : getDefaultData().edges;

    const { graph, nodesMap } = buildGraphFromData(nodes, edges);

    const distances: Record<string, number> = {};
    const previous: Record<string, string | null> = {};
    const queue: string[] = [];

    Object.keys(nodesMap).forEach(nodeId => {
        distances[nodeId] = Infinity;
        previous[nodeId] = null;
        queue.push(nodeId);
    });

    if (!nodesMap[fromId] || !nodesMap[toId]) {
        return null;
    }

    distances[fromId] = 0;

    while (queue.length > 0) {
        let u: string | null = null;
        let minDist = Infinity;

        for (const nodeId of queue) {
            if (distances[nodeId] < minDist) {
                minDist = distances[nodeId];
                u = nodeId;
            }
        }

        if (u === null || distances[u] === Infinity || u === toId) break;

        queue.splice(queue.indexOf(u), 1);

        const neighbors = graph[u] || [];
        for (const edge of neighbors) {
            const alt = distances[u] + edge.weight;
            if (alt < distances[edge.to]) {
                distances[edge.to] = alt;
                previous[edge.to] = u;
            }
        }
    }

    if (distances[toId] === Infinity) return null;

    const path: string[] = [];
    let currPathNode: string | null = toId;
    while (currPathNode !== null) {
        path.unshift(currPathNode);
        currPathNode = previous[currPathNode];
    }

    if (path.length < 2) return null;

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

            let icon: IconType = "straight";
            if (currNode.floorNumber !== nextNode.floorNumber) {
                const isUp = nextNode.floorNumber > currNode.floorNumber;
                icon = (edge.type === "lift") ? (isUp ? "lift-up" : "lift-down") : (isUp ? "stairs-up" : "stairs-down");
            } else if (currNode.node_type === "junction" && nextNode.node_type !== "junction") {
                icon = "destination";
            } else if (currNode.node_type !== "junction" && nextNode.node_type === "junction") {
                icon = "start";
            } else {
                icon = (edge.turn as IconType) || (edge.instruction.toLowerCase().includes("left") ? "left" : (edge.instruction.toLowerCase().includes("right") ? "right" : "straight"));
            }

            steps.push({
                instruction: edge.instruction,
                instruction_ml: generateML(edge.instruction, icon),
                instruction_kn: generateKN(edge.instruction, icon),
                icon: icon,
                floor: currNode.floorNumber,
                landmarkImage: nextNode.image || "/panorama.jpg"
            });
        }
    }

    const finalNode = nodesMap[toId];
    if (finalNode) {
        steps.push({
            instruction: `You have reached ${finalNode.name}`,
            instruction_ml: finalNode.name_ml ? `നിങ്ങൾ ${finalNode.name_ml}-ൽ എത്തിച്ചേർന്നു` : `നിങ്ങൾ ${finalNode.name}-ൽ എത്തിച്ചേർന്നു`,
            instruction_kn: finalNode.name_kn ? `ನಿಮ್ಮ ಗಮ್ಯಸ್ಥಾನ ${finalNode.name_kn} ತಲುಪಿದೆ` : `ನಿಮ್ಮ ಗಮ್ಯಸ್ಥಾನ ${finalNode.name} ತಲುಪಿದೆ`,
            icon: "destination",
            floor: finalNode.floorNumber,
            landmarkImage: finalNode.image || "/panorama.jpg"
        });
    }

    return { path, steps, totalWeight };
};

function generateML(text: string, icon: string): string {
    if (icon === "left") return "ഇടത്തോട്ട് തിരിയുക";
    if (icon === "right") return "വലത്തോട്ട് തിരിയുക";
    if (icon === "straight") return "നേരെ പോകുക";
    if (icon.includes("stairs")) return "പടികൾ ഉപയോഗിക്കുക";
    if (icon.includes("lift")) return "ലിഫ്റ്റ് ഉപയോഗിക്കുക";
    if (text.toLowerCase().includes("exit")) return "പുറത്തുകടക്കുക";
    if (text.toLowerCase().includes("enter")) return "പ്രവേശിക്കുക";
    return text;
}

function generateKN(text: string, icon: string): string {
    if (icon === "left") return "ಎಡಕ್ಕೆ ತಿರುಗಿ";
    if (icon === "right") return "ಬಲಕ್ಕೆ ತಿರುಗಿ";
    if (icon === "straight") return "ನೇರವಾಗಿ ಹೋಗಿ";
    if (icon.includes("stairs")) return "ಮೆಟ್ಟಿಲುಗಳನ್ನು ಬಳಸಿ";
    if (icon.includes("lift")) return "ಲಿಫ್ಟ್ ಬಳಸಿ";
    if (text.toLowerCase().includes("exit")) return "ನಿರ್ಗಮಿಸಿ";
    if (text.toLowerCase().includes("enter")) return "ಪ್ರವೇಶಿಸಿ";
    return text;
}
