
import { buildingData } from "@/data/building_data";
import { locations } from "@/data/locations";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const seedGraphData = async () => {
    try {
        console.log("Starting Graph Seed...");

        // 1. Clear existing data (Optional: for development. In prod, maybe update?)
        // Deleting edges first due to FK constraints
        const { error: delEdgeErr } = await supabase.from('building_edges').delete().neq('id', '00000000-0000-0000-0000-000000000000'); // Hack to delete all
        if (delEdgeErr) throw delEdgeErr;

        const { error: delNodeErr } = await supabase.from('building_nodes').delete().neq('id', 'PLACEHOLDER');
        if (delNodeErr) throw delNodeErr;

        // 2. Prepare Nodes
        const nodesToInsert: any[] = [];

        // Helper to find location metadata
        const getLocationMeta = (id: string) => locations.find(l => l.id === id);

        for (const floor of buildingData.building.floors) {
            for (const node of floor.nodes) {
                const meta = getLocationMeta(node.node_id);

                nodesToInsert.push({
                    id: node.node_id,
                    floor_id: floor.floor_id,
                    node_type: node.node_type,
                    name: node.name,
                    junction_id: node.junction_id || null,
                    // Metadata from locations.ts (if any)
                    x: meta?.x || null,
                    y: meta?.y || null,
                    image: meta?.image || null,
                    cue: meta?.cue || null,
                    is_unavailable: meta?.isUnavailable || false
                });
            }
        }

        // 3. Insert Nodes
        const { error: nodeErr } = await supabase.from('building_nodes').insert(nodesToInsert);
        if (nodeErr) {
            console.error("Node Insert Error:", nodeErr);
            throw nodeErr;
        }

        // 4. Prepare Edges
        const edgesToInsert: any[] = [];

        for (const floor of buildingData.building.floors) {
            if (!floor.edges) continue;

            for (const edge of floor.edges) {
                // Determine directionality? Assuming bidirectional if turn is present or logic implies it?
                // The edge structure in building_data seems to have explicit edge entries for each direction usually.
                // Let's just insert what is there.

                // We need to make sure FROM and TO nodes exist. They should, since we just inserted all nodes.

                edgesToInsert.push({
                    floor_id: floor.floor_id,
                    from_node_id: edge.from,
                    to_node_id: edge.to,
                    distance_steps: edge.distance_steps,
                    instruction: edge.instruction,
                    edge_type: edge.edge_type,
                    turn: edge.turn || null
                });
            }
        }

        // 5. Insert Edges
        if (edgesToInsert.length > 0) {
            const { error: edgeErr } = await supabase.from('building_edges').insert(edgesToInsert);
            if (edgeErr) {
                console.error("Edge Insert Error:", edgeErr);
                throw edgeErr;
            }
        }

        toast.success("Graph Data synced to Database successfully!");
        return true;

    } catch (error: any) {
        console.error("Seeding Failed:", error);
        toast.error("Failed to seed graph data: " + error.message);
        return false;
    }
};
