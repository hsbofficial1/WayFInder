export interface Point {
    x: number;
    y: number;
    floor: number;
}

export interface GraphNode {
    id: string;
    floor: number;
}

export interface GraphEdge {
    to: string;
    weight: number; // Distance/Cost
    type: "walk" | "stairs" | "lift";
}

export type AdjacencyList = Record<string, GraphEdge[]>;
export type Coordinates = Record<string, Point>;

export class NavigationGraph {
    adjacencyList: AdjacencyList = {};
    coordinates: Coordinates = {};

    addNode(id: string, coords: Point) {
        this.coordinates[id] = coords;
        if (!this.adjacencyList[id]) {
            this.adjacencyList[id] = [];
        }
    }

    addEdge(from: string, to: string, weight: number, type: "walk" | "stairs" | "lift" = "walk", bidirectional: boolean = true) {
        if (!this.adjacencyList[from]) this.adjacencyList[from] = [];
        this.adjacencyList[from].push({ to, weight, type });

        if (bidirectional) {
            if (!this.adjacencyList[to]) this.adjacencyList[to] = [];
            this.adjacencyList[to].push({ to: from, weight, type });
        }
    }

    findPath(startId: string, endId: string): string[] | null {
        const distances: Record<string, number> = {};
        const previous: Record<string, string | null> = {};
        const queue: string[] = [];

        // Initialize
        for (const id in this.coordinates) {
            distances[id] = Infinity;
            previous[id] = null;
            queue.push(id);
        }

        distances[startId] = 0;

        while (queue.length > 0) {
            // Find node with min distance
            let minNode: string | null = null;
            for (const node of queue) {
                if (minNode === null || distances[node] < distances[minNode]) {
                    minNode = node;
                }
            }

            if (minNode === null || distances[minNode] === Infinity) break;
            if (minNode === endId) break;

            // Remove from queue
            const index = queue.indexOf(minNode);
            if (index > -1) queue.splice(index, 1);

            // Explore neighbors
            const neighbors = this.adjacencyList[minNode] || [];
            for (const edge of neighbors) {
                if (!queue.includes(edge.to)) continue;

                const alt = distances[minNode] + edge.weight;
                if (alt < distances[edge.to]) {
                    distances[edge.to] = alt;
                    previous[edge.to] = minNode;
                }
            }
        }

        if (distances[endId] === Infinity) return null;

        // Reconstruct path
        const path: string[] = [];
        let current: string | null = endId;
        while (current !== null) {
            path.unshift(current);
            current = previous[current];
        }

        return path;
    }

    getTurnDirection(p1: Point, p2: Point, p3: Point): "straight" | "left" | "right" | "uturn" {
        // Only applies if floors are the same
        if (p1.floor !== p2.floor || p2.floor !== p3.floor) return "straight";

        const v1 = { x: p2.x - p1.x, y: p2.y - p1.y };
        const v2 = { x: p3.x - p2.x, y: p3.y - p2.y };

        // Cross product (2D)
        const cross = v1.x * v2.y - v1.y * v2.x;
        const dot = v1.x * v2.x + v1.y * v2.y;

        // Check strictness for "straight"
        // Normalize vectors
        const mag1 = Math.sqrt(v1.x * v1.x + v1.y * v1.y);
        const mag2 = Math.sqrt(v2.x * v2.x + v2.y * v2.y);

        if (mag1 === 0 || mag2 === 0) return "straight";

        const cosTheta = dot / (mag1 * mag2);

        if (cosTheta > 0.8) return "straight"; // < 36 degrees
        if (cosTheta < -0.8) return "uturn";

        return cross < 0 ? "left" : "right";
    }
}
