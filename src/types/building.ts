export type FloorId = "G" | "F1" | "F2";
export type NodeType = "junction" | "room" | "stairs" | "lift" | "entry" | "exit";
export type EdgeType = "corridor" | "stairs" | "lift";

export interface BuildingNode {
    node_id: string; // This corresponds to 'id' in DB
    node_type: NodeType;
    name: string;
    floor: FloorId; // corresponds to 'floor_id' column
    junction_id: string | null;
    // Optional, for mapping back to old "Location" type
    display_name?: string;
    // Database fields
    x?: number;
    y?: number;
    image?: string;
    cue?: string;
    is_unavailable?: boolean;
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
