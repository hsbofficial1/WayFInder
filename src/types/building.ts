export type IconType = "straight" | "left" | "right" | "stairs-up" | "stairs-down" | "lift-up" | "lift-down" | "destination" | "start";

export interface RouteStep {
    instruction: string;
    instruction_ml?: string;
    instruction_kn?: string;
    icon: IconType;
    floor: number;
    landmarkImage?: string;
}

export type FloorId = "G" | "F1" | "F2";
export type NodeType = "junction" | "room" | "stairs" | "lift" | "entry" | "exit";
export type EdgeType = "corridor" | "stairs" | "lift";

export interface BuildingNode {
    node_id: string;
    node_type: NodeType;
    category?: "office" | "lab" | "hotspot" | "utility" | "room" | "entry";
    name: string;
    name_ml?: string;
    name_kn?: string;
    floor: FloorId;
    junction_id: string | null;
    image?: string;
    cue?: string;
    cue_ml?: string;
    cue_kn?: string;
    is_unavailable?: boolean;
    x?: number;
    y?: number;
}

export interface BuildingEdge {
    id?: string; // DB ID (UUID)
    from: string; // from_node_id
    to: string; // to_node_id
    distance_steps: number;
    instruction: string;
    edge_type: EdgeType;
    turn?: "left" | "right" | "straight";
    floor_id?: string; // Optional context
}

export interface FloorData {
    floor_id: FloorId;
    floor_name: string;
    nodes: BuildingNode[];
    edges?: BuildingEdge[]; // Edges might be stored per floor or globally, user showed them in floor in snippet 1 but global in snippet 5? 
    // Snippet 1: "floors": [ { ..., "nodes": [], "edges": [] } ]
    // So edges are per floor? 
    // But Stairs/Lift edges connect floors.
    // User said: "Always store both directions (A→B and B→A)"
}

export interface Building {
    name: string;
    floors: FloorData[];
}

export interface BuildingData {
    building: Building;
}
