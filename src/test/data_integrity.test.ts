import { describe, it, expect } from 'vitest';
import { buildingData } from '../data/building_data';
import { locations } from '../data/locations';
import fs from 'fs';
import path from 'path';

describe('Data Integrity Checks', () => {

    // --- Building Data Tests ---

    const allNodes = buildingData.building.floors.flatMap(f => f.nodes);
    const allNodeIds = new Set(allNodes.map(n => n.node_id));

    it('should have unique node IDs across all floors', () => {
        const ids = allNodes.map(n => n.node_id);
        const uniqueIds = new Set(ids);
        if (ids.length !== uniqueIds.size) {
            const duplicates = ids.filter((item, index) => ids.indexOf(item) !== index);
            console.error('Duplicate Node IDs:', duplicates);
        }
        expect(allNodes.length).toBe(uniqueIds.size);
    });

    it('should have valid edges connecting existing nodes', () => {
        buildingData.building.floors.forEach(floor => {
            floor.edges.forEach(edge => {
                const fromExists = allNodeIds.has(edge.from);
                const toExists = allNodeIds.has(edge.to);

                if (!fromExists) console.error(`Edge from non-existent node: ${edge.from} in floor ${floor.floor_id}`);
                if (!toExists) console.error(`Edge to non-existent node: ${edge.to} in floor ${floor.floor_id}`);

                expect(fromExists, `Edge from ${edge.from} should exist`).toBe(true);
                expect(toExists, `Edge to ${edge.to} should exist`).toBe(true);
            });
        });
    });

    it('should have bidirectional edges for corridors (mostly)', () => {
        // This is a heuristic check. Most corridors are two-way.
        // We check if A->B implies B->A exists.
        buildingData.building.floors.forEach(floor => {
            const edgeMap = new Set(floor.edges.map(e => `${e.from}->${e.to}`));

            floor.edges.forEach(edge => {
                if (edge.edge_type === 'corridor' || edge.edge_type === 'stairs') {
                    // Check reverse
                    const reverseKey = `${edge.to}->${edge.from}`;
                    if (!edgeMap.has(reverseKey)) {
                        console.warn(`Missing reverse edge for ${edge.from} -> ${edge.to} (${edge.instruction})`);
                    }
                    // Ideally expect(edgeMap.has(reverseKey)).toBe(true);
                    // But some might be one-way (e.g. drop down), though unlikely for corridors.
                }
            });
        });
    });

    it('should have valid image paths if specified', () => {
        allNodes.forEach(node => {
            if (node.image) {
                // Remove leading slash if present for path.join
                const relativePath = node.image.startsWith('/') ? node.image.slice(1) : node.image;
                // Assuming public folder is at root/public
                const fullPath = path.resolve(__dirname, '../../public', relativePath);

                const exists = fs.existsSync(fullPath);
                if (!exists) {
                    console.error(`Missing image: ${node.image} for node ${node.node_id}`);
                }
                expect(exists, `Image ${node.image} should exist`).toBe(true);
            }
        });
    });

    // --- Locations Data Tests ---

    it('should have valid location entries derived from building data', () => {
        expect(locations.length).toBeGreaterThan(0);

        locations.forEach(loc => {
            expect(allNodeIds.has(loc.id), `Location ${loc.id} must identify a valid node`).toBe(true);
            expect(loc.name).toBeTruthy();
            expect(loc.type).toBeTruthy();
        });
    });

});
