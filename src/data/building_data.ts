import { BuildingData } from "@/types/building";

export const buildingData: BuildingData = {
    building: {
        name: "Main Building",
        floors: [
            {
                floor_id: "G",
                floor_name: "Ground Floor",
                nodes: [
                    // Junctions
                    { node_id: "J1_G", node_type: "junction", name: "Reception Junction", floor: "G", junction_id: null },
                    { node_id: "J2_G", node_type: "junction", name: "ASAP Office Junction", floor: "G", junction_id: null },
                    { node_id: "J3_G", node_type: "junction", name: "Emergency Exit Junction", floor: "G", junction_id: null },
                    { node_id: "J4_G", node_type: "junction", name: "Lift Junction", floor: "G", junction_id: null },
                    { node_id: "J5_G", node_type: "junction", name: "Right Stairs Junction", floor: "G", junction_id: null },
                    { node_id: "J6_G", node_type: "junction", name: "KSUM Junction", floor: "G", junction_id: null },
                    { node_id: "J7_G", node_type: "junction", name: "Openmind Junction", floor: "G", junction_id: null },
                    { node_id: "J8_G", node_type: "junction", name: "Sane Room Junction", floor: "G", junction_id: null },
                    { node_id: "J9_G", node_type: "junction", name: "AUAS Junction", floor: "G", junction_id: null },
                    { node_id: "J10_G", node_type: "junction", name: "Unknown Room Junction", floor: "G", junction_id: null },
                    { node_id: "J11_G", node_type: "junction", name: "Washroom Junction", floor: "G", junction_id: null },
                    { node_id: "J12_G", node_type: "junction", name: "Dining / First Aid / Left Stairs Junction", floor: "G", junction_id: null },

                    // Rooms / Entries / Exits
                    { node_id: "Reception_G", node_type: "entry", name: "Reception", floor: "G", junction_id: "J1_G" },
                    { node_id: "ASAP_G", node_type: "room", name: "ASAP Office", floor: "G", junction_id: "J2_G" },
                    { node_id: "EmergencyExit_G", node_type: "exit", name: "Emergency Exit", floor: "G", junction_id: "J3_G" },
                    { node_id: "Lift1_G", node_type: "lift", name: "Lift 1", floor: "G", junction_id: "J4_G" },
                    { node_id: "StairsRight1_G", node_type: "stairs", name: "Stairs Right 1", floor: "G", junction_id: "J5_G" },
                    { node_id: "KSUM_G", node_type: "room", "name": "Leap / Kerala Startup Mission", floor: "G", junction_id: "J6_G" },
                    { node_id: "Openmind_G", node_type: "room", "name": "Openmind Makerspace", floor: "G", junction_id: "J7_G" },
                    { node_id: "SaneRoom_G", node_type: "room", "name": "The Sane Room", floor: "G", junction_id: "J8_G" },
                    { node_id: "AUAS_G", node_type: "room", "name": "Autonomous AUAS", floor: "G", junction_id: "J9_G" },
                    { node_id: "Unknown1_G", node_type: "room", "name": "Unknown Room 1", floor: "G", junction_id: "J10_G" },
                    { node_id: "Washroom1_G", node_type: "room", "name": "Washroom 1", floor: "G", junction_id: "J11_G" },
                    { node_id: "DiningHall_G", node_type: "room", "name": "Dining Hall", floor: "G", junction_id: "J12_G" },
                    { node_id: "FirstAid_G", node_type: "room", "name": "First Aid Room", floor: "G", junction_id: "J12_G" },
                    { node_id: "StairsLeft1_G", node_type: "stairs", name: "Stairs Left 1", floor: "G", junction_id: "J12_G" }
                ],
                edges: [
                    // --- Loop Topology (Clockwise: West -> North -> East -> South) ---

                    // 1. Bottom Corridor: Reception (J1) <-> Dining (J12)
                    { from: "J1_G", to: "J12_G", distance_steps: 10, instruction: "Walk Left towards Dining Hall", edge_type: "corridor", turn: "left" },
                    { from: "J12_G", to: "J1_G", distance_steps: 10, instruction: "Walk straight towards Reception", edge_type: "corridor", turn: "straight" },

                    // 2. West Corridor (Up): Dining (J12) <-> Washroom (J11)
                    { from: "J12_G", to: "J11_G", distance_steps: 8, instruction: "Turn Right into the corridor towards Washroom", edge_type: "corridor", turn: "right" },
                    { from: "J11_G", to: "J12_G", distance_steps: 8, instruction: "Walk straight towards Dining Hall", edge_type: "corridor", turn: "straight" },

                    // 3. West Corridor (Up): Washroom (J11) <-> AUAS (J9) (J10 skipped/repurposed)
                    { from: "J11_G", to: "J9_G", distance_steps: 6, instruction: "Walk straight past Washroom towards AUAS", edge_type: "corridor", turn: "straight" },
                    { from: "J9_G", to: "J11_G", distance_steps: 6, instruction: "Walk straight towards Washroom", edge_type: "corridor", turn: "straight" },

                    // 4. West Corridor (Up): AUAS (J9) <-> Sane Room (J8)
                    { from: "J9_G", to: "J8_G", distance_steps: 8, instruction: "Walk straight towards Sane Room", edge_type: "corridor", turn: "straight" },
                    { from: "J8_G", to: "J9_G", distance_steps: 8, instruction: "Walk straight towards AUAS", edge_type: "corridor", turn: "straight" },

                    // 5. West Corridor to North Corner: Sane Room (J8) <-> Top Left Corner (J10)
                    { from: "J8_G", to: "J10_G", distance_steps: 6, instruction: "Walk straight to the end of the corridor", edge_type: "corridor", turn: "straight" },
                    { from: "J10_G", to: "J8_G", distance_steps: 6, instruction: "Walk straight towards Sane Room", edge_type: "corridor", turn: "straight" },

                    // 6. North Corridor (Right): Top Left Corner (J10) <-> Openmind (J7)
                    { from: "J10_G", to: "J7_G", distance_steps: 8, instruction: "Turn Right towards Openmind", edge_type: "corridor", turn: "right" },
                    { from: "J7_G", to: "J10_G", distance_steps: 8, instruction: "Walk straight to the corner", edge_type: "corridor", turn: "straight" },

                    // 7. North Corridor (Right): Openmind (J7) <-> KSUM (J6)
                    { from: "J7_G", to: "J6_G", distance_steps: 8, instruction: "Walk straight towards KSUM", edge_type: "corridor", turn: "straight" },
                    { from: "J6_G", to: "J7_G", distance_steps: 8, instruction: "Walk straight towards Openmind", edge_type: "corridor", turn: "straight" },

                    // 8. North Corridor to East Corner: KSUM (J6) <-> Stairs/Lift (J5)
                    { from: "J6_G", to: "J5_G", distance_steps: 10, instruction: "Walk straight towards Stairs/Lift", edge_type: "corridor", turn: "straight" },
                    { from: "J5_G", to: "J6_G", distance_steps: 10, instruction: "Walk straight towards KSUM", edge_type: "corridor", turn: "straight" },

                    // 9. East Corridor (Down): Stairs/Lift (J5) <-> Lift Jxn (J4) (Close proximity)
                    { from: "J5_G", to: "J4_G", distance_steps: 4, instruction: "Turn Right towards Lift", edge_type: "corridor", turn: "right" },
                    { from: "J4_G", to: "J5_G", distance_steps: 4, instruction: "Walk straight towards Stairs", edge_type: "corridor", turn: "straight" },

                    // 10. East Corridor (Down): Lift (J4) <-> Emergency Exit (J3)
                    { from: "J4_G", to: "J3_G", distance_steps: 8, instruction: "Walk straight towards Emergency Exit", edge_type: "corridor", turn: "straight" },
                    { from: "J3_G", to: "J4_G", distance_steps: 8, instruction: "Walk straight towards Lift", edge_type: "corridor", turn: "straight" },

                    // 11. East Corridor (Down): Emergency Exit (J3) <-> ASAP (J2)
                    { from: "J3_G", to: "J2_G", distance_steps: 6, instruction: "Walk straight towards ASAP Office", edge_type: "corridor", turn: "straight" },
                    { from: "J2_G", to: "J3_G", distance_steps: 6, instruction: "Walk straight towards Emergency Exit", edge_type: "corridor", turn: "straight" },

                    // 12. Bottom Corridor (Close Loop): ASAP (J2) <-> Reception (J1)
                    { from: "J2_G", to: "J1_G", distance_steps: 8, instruction: "Turn Right towards Reception", edge_type: "corridor", turn: "right" },
                    { from: "J1_G", to: "J2_G", distance_steps: 8, instruction: "Walk straight towards ASAP Office", edge_type: "corridor", turn: "straight" },


                    // --- Room <-> Junction Connections ---
                    // J1: Reception
                    { from: "Reception_G", to: "J1_G", distance_steps: 5, instruction: "Move to the main corridor", edge_type: "corridor" },
                    { from: "J1_G", to: "Reception_G", distance_steps: 5, instruction: "Enter Reception", edge_type: "corridor" },

                    // J2: ASAP Office
                    { from: "ASAP_G", to: "J2_G", distance_steps: 5, instruction: "Exit ASAP Office", edge_type: "corridor" },
                    { from: "J2_G", to: "ASAP_G", distance_steps: 5, instruction: "Enter ASAP Office", edge_type: "corridor" },

                    // J3: Emergency Exit
                    { from: "EmergencyExit_G", to: "J3_G", distance_steps: 5, instruction: "Walk inwards from Exit", edge_type: "corridor" },
                    { from: "J3_G", to: "EmergencyExit_G", distance_steps: 5, instruction: "Go to Emergency Exit", edge_type: "corridor" },

                    // J4: Lift 1
                    { from: "Lift1_G", to: "J4_G", distance_steps: 3, instruction: "Exit Lift area", edge_type: "corridor" },
                    { from: "J4_G", to: "Lift1_G", distance_steps: 3, instruction: "Go to Lift 1", edge_type: "corridor" },

                    // J5: Stairs Right
                    { from: "StairsRight1_G", to: "J5_G", distance_steps: 4, instruction: "Move from stairs to corridor", edge_type: "stairs" },
                    { from: "J5_G", to: "StairsRight1_G", distance_steps: 4, instruction: "Go to the Right Stairs", edge_type: "stairs" },

                    // J6: KSUM
                    { from: "KSUM_G", to: "J6_G", distance_steps: 5, instruction: "Exit KSUM Office", edge_type: "corridor" },
                    { from: "J6_G", to: "KSUM_G", distance_steps: 5, instruction: "Enter KSUM Office", edge_type: "corridor" },

                    // J7: Openmind
                    { from: "Openmind_G", to: "J7_G", distance_steps: 5, instruction: "Exit Openmind Makerspace", edge_type: "corridor" },
                    { from: "J7_G", to: "Openmind_G", distance_steps: 5, instruction: "Enter Openmind Makerspace", edge_type: "corridor" },

                    // J8: Sane Room
                    { from: "SaneRoom_G", to: "J8_G", distance_steps: 5, instruction: "Exit Sane Room", edge_type: "corridor" },
                    { from: "J8_G", to: "SaneRoom_G", distance_steps: 5, instruction: "Enter Sane Room", edge_type: "corridor" },

                    // J9: AUAS
                    { from: "AUAS_G", to: "J9_G", distance_steps: 5, instruction: "Exit Autonomous AUAS", edge_type: "corridor" },
                    { from: "J9_G", to: "AUAS_G", distance_steps: 5, instruction: "Enter Autonomous AUAS", edge_type: "corridor" },

                    // J10: Unknown (Used as Top Left Corner)
                    { from: "Unknown1_G", to: "J10_G", distance_steps: 5, instruction: "Exit Room", edge_type: "corridor" },
                    { from: "J10_G", to: "Unknown1_G", distance_steps: 5, instruction: "Enter Room", edge_type: "corridor" },

                    // J11: Washroom
                    { from: "Washroom1_G", to: "J11_G", distance_steps: 4, instruction: "Exit Washroom", edge_type: "corridor" },
                    { from: "J11_G", to: "Washroom1_G", distance_steps: 4, instruction: "Enter Washroom 1", edge_type: "corridor" },

                    // J12: Multiple Connections - Dining & First Aid
                    { from: "DiningHall_G", to: "J12_G", distance_steps: 5, instruction: "Exit Dining Hall", edge_type: "corridor" },
                    { from: "J12_G", to: "DiningHall_G", distance_steps: 5, instruction: "Enter Dining Hall", edge_type: "corridor" },

                    { from: "FirstAid_G", to: "J12_G", distance_steps: 4, instruction: "Exit First Aid Room", edge_type: "corridor" },
                    { from: "J12_G", to: "FirstAid_G", distance_steps: 4, instruction: "Enter First Aid Room", edge_type: "corridor" },

                    { from: "StairsLeft1_G", to: "J12_G", distance_steps: 4, instruction: "Move from stairs to corridor", edge_type: "stairs" },
                    { from: "J12_G", to: "StairsLeft1_G", distance_steps: 4, instruction: "Go to the Left Stairs", edge_type: "stairs" }
                ]
            }
        ]
    }
};
