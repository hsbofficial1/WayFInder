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
                    { node_id: "J3_G", node_type: "junction", name: "Emergency Exit Corner Junction", floor: "G", junction_id: null },
                    { node_id: "J4_G", node_type: "junction", name: "Lift Junction", floor: "G", junction_id: null },
                    { node_id: "J5_G", node_type: "junction", name: "Right Stairs Junction", floor: "G", junction_id: null },
                    { node_id: "J6_G", node_type: "junction", name: "KSUM Corner Junction", floor: "G", junction_id: null },
                    { node_id: "J7_G", node_type: "junction", name: "Openmind Junction", floor: "G", junction_id: null },
                    { node_id: "J8_G", node_type: "junction", name: "Sane Room Junction", floor: "G", junction_id: null },
                    { node_id: "J9_G", node_type: "junction", name: "AUAS Corner Junction", floor: "G", junction_id: null },
                    { node_id: "J10_G", node_type: "junction", name: "Corridor Junction", floor: "G", junction_id: null },
                    { node_id: "J11_G", node_type: "junction", name: "Washroom Junction", floor: "G", junction_id: null },
                    { node_id: "J12_G", node_type: "junction", name: "Dining / First Aid / Stairs Corner Junction", floor: "G", junction_id: null },

                    // Rooms / Entries / Exits
                    { node_id: "Reception_G", node_type: "entry", name: "Reception", floor: "G", junction_id: "J1_G" },
                    { node_id: "ASAP_G", node_type: "room", name: "ASAP Office", floor: "G", junction_id: "J2_G" },
                    { node_id: "EmergencyExit_G", node_type: "exit", name: "Emergency Exit", floor: "G", junction_id: "J3_G" },
                    { node_id: "Lift1_G", node_type: "lift", name: "Lift 1", floor: "G", junction_id: "J4_G" },
                    { node_id: "StairsRight1_G", node_type: "stairs", name: "Stairs Right 1", floor: "G", junction_id: "J5_G" },
                    { node_id: "KSUM_G", node_type: "room", "name": "Leap / Mission Start up Kerala", floor: "G", junction_id: "J6_G" },
                    { node_id: "Openmind_G", node_type: "room", "name": "Openmind makerspace << >>", floor: "G", junction_id: "J7_G" },
                    { node_id: "SaneRoom_G", node_type: "room", "name": "The Sane Room", floor: "G", junction_id: "J8_G" },
                    { node_id: "AUAS_G", node_type: "room", "name": "Autonomous AUAS", floor: "G", junction_id: "J9_G" },
                    { node_id: "Unknown1_G", node_type: "room", "name": "Empty Room", floor: "G", junction_id: "J10_G" },
                    { node_id: "Washroom1_G", node_type: "room", "name": "Washroom 1", floor: "G", junction_id: "J11_G" },
                    { node_id: "DiningHall_G", node_type: "room", "name": "Dining Hall", floor: "G", junction_id: "J12_G" },
                    { node_id: "FirstAid_G", node_type: "room", "name": "First Aid Room", floor: "G", junction_id: "J12_G" },
                    { node_id: "StairsLeft1_G", node_type: "stairs", name: "Stairs Left 1", floor: "G", junction_id: "J12_G" }
                ],
                edges: [
                    // 1. Bottom Corridor: J12 <-> J1 <-> J2 <-> J3
                    // J12 <-> J1
                    { from: "J12_G", to: "J1_G", distance_steps: 10, instruction: "Walk straight towards Reception", edge_type: "corridor", turn: "straight" },
                    { from: "J1_G", to: "J12_G", distance_steps: 10, instruction: "Walk straight towards Dining Hall", edge_type: "corridor", turn: "straight" },
                    // J1 <-> J2
                    { from: "J1_G", to: "J2_G", distance_steps: 8, instruction: "Walk straight towards ASAP Office", edge_type: "corridor", turn: "straight" },
                    { from: "J2_G", to: "J1_G", distance_steps: 8, instruction: "Walk straight towards Reception", edge_type: "corridor", turn: "straight" },
                    // J2 <-> J3
                    { from: "J2_G", to: "J3_G", distance_steps: 6, instruction: "Walk straight towards the corner", edge_type: "corridor", turn: "straight" },
                    { from: "J3_G", to: "J2_G", distance_steps: 6, instruction: "Turn Right towards ASAP Office", edge_type: "corridor", turn: "right" },

                    // 2. Right Corridor: J3 <-> J4 <-> J5 <-> J6
                    // J3 <-> J4
                    { from: "J3_G", to: "J4_G", distance_steps: 8, instruction: "Turn Left towards Lift", edge_type: "corridor", turn: "left" },
                    { from: "J4_G", to: "J3_G", distance_steps: 8, instruction: "Walk straight towards the corner", edge_type: "corridor", turn: "straight" },
                    // J4 <-> J5
                    { from: "J4_G", to: "J5_G", distance_steps: 4, instruction: "Walk straight towards Stairs", edge_type: "corridor", turn: "straight" },
                    { from: "J5_G", to: "J4_G", distance_steps: 4, instruction: "Walk straight towards Lift", edge_type: "corridor", turn: "straight" },
                    // J5 <-> J6
                    { from: "J5_G", to: "J6_G", distance_steps: 10, instruction: "Walk straight towards KSUM corner", edge_type: "corridor", turn: "straight" },
                    { from: "J6_G", to: "J5_G", distance_steps: 10, instruction: "Turn Right towards Stairs", edge_type: "corridor", turn: "right" },

                    // 3. Top Corridor: J6 <-> J7 <-> J8 <-> J9
                    // J6 <-> J7
                    { from: "J6_G", to: "J7_G", distance_steps: 8, instruction: "Turn Left towards Openmind", edge_type: "corridor", turn: "left" },
                    { from: "J7_G", to: "J6_G", distance_steps: 8, instruction: "Walk straight towards the corner", edge_type: "corridor", turn: "straight" },
                    // J7 <-> J8
                    { from: "J7_G", to: "J8_G", distance_steps: 8, instruction: "Walk straight towards Sane Room", edge_type: "corridor", turn: "straight" },
                    { from: "J8_G", to: "J7_G", distance_steps: 8, instruction: "Walk straight towards Openmind", edge_type: "corridor", turn: "straight" },
                    // J8 <-> J9
                    { from: "J8_G", to: "J9_G", distance_steps: 8, instruction: "Walk straight towards AUAS corner", edge_type: "corridor", turn: "straight" },
                    { from: "J9_G", to: "J8_G", distance_steps: 8, instruction: "Turn Right towards Sane Room", edge_type: "corridor", turn: "right" },

                    // 4. Left Corridor: J9 <-> J10 <-> J11 <-> J12
                    // J9 <-> J10
                    { from: "J9_G", to: "J10_G", distance_steps: 6, instruction: "Turn Left towards Washroom", edge_type: "corridor", turn: "left" },
                    { from: "J10_G", to: "J9_G", distance_steps: 6, instruction: "Walk straight towards AUAS corner", edge_type: "corridor", turn: "straight" },
                    // J10 <-> J11
                    { from: "J10_G", to: "J11_G", distance_steps: 6, instruction: "Walk straight towards Washroom", edge_type: "corridor", turn: "straight" },
                    { from: "J11_G", to: "J10_G", distance_steps: 6, instruction: "Walk straight towards AUAS corner", edge_type: "corridor", turn: "straight" },
                    // J11 <-> J12
                    { from: "J11_G", to: "J12_G", distance_steps: 8, instruction: "Walk straight towards the corner", edge_type: "corridor", turn: "straight" },
                    { from: "J12_G", to: "J11_G", distance_steps: 8, instruction: "Turn Right towards Washroom", edge_type: "corridor", turn: "right" },
                    // Closing Loop (J12 to J1)
                    { from: "J12_G", to: "J1_G", distance_steps: 10, instruction: "Turn Left towards Reception", edge_type: "corridor", turn: "left" },
                    { from: "J1_G", to: "J12_G", distance_steps: 10, instruction: "Walk straight towards the corner", edge_type: "corridor", turn: "straight" },

                    // --- Room <-> Junction Connections ---
                    // J1: Reception
                    { from: "Reception_G", to: "J1_G", distance_steps: 5, instruction: "Move to the main corridor", edge_type: "corridor", turn: "straight" },
                    { from: "J1_G", to: "Reception_G", distance_steps: 5, instruction: "Enter Reception", edge_type: "corridor", turn: "straight" },

                    // J2: ASAP Office
                    { from: "ASAP_G", to: "J2_G", distance_steps: 5, instruction: "Exit ASAP Office", edge_type: "corridor", turn: "straight" },
                    { from: "J2_G", to: "ASAP_G", distance_steps: 5, instruction: "Enter ASAP Office", edge_type: "corridor", turn: "straight" },

                    // J3: Emergency Exit
                    { from: "EmergencyExit_G", to: "J3_G", distance_steps: 5, instruction: "Walk inwards", edge_type: "corridor", turn: "straight" },
                    { from: "J3_G", to: "EmergencyExit_G", distance_steps: 5, instruction: "Go to Emergency Exit", edge_type: "corridor", turn: "straight" },

                    // J4: Lift 1
                    { from: "Lift1_G", to: "J4_G", distance_steps: 3, instruction: "Exit Lift area", edge_type: "corridor", turn: "straight" },
                    { from: "J4_G", to: "Lift1_G", distance_steps: 3, instruction: "Go to Lift 1", edge_type: "corridor", turn: "straight" },

                    // J5: Stairs Right
                    { from: "StairsRight1_G", to: "J5_G", distance_steps: 4, instruction: "Move to corridor", edge_type: "stairs", turn: "straight" },
                    { from: "J5_G", to: "StairsRight1_G", distance_steps: 4, instruction: "Go to Stairs", edge_type: "stairs", turn: "straight" },

                    // J6: KSUM
                    { from: "KSUM_G", to: "J6_G", distance_steps: 5, instruction: "Exit KSUM", edge_type: "corridor", turn: "straight" },
                    { from: "J6_G", to: "KSUM_G", distance_steps: 5, instruction: "Enter KSUM", edge_type: "corridor", turn: "straight" },

                    // J7: Openmind
                    { from: "Openmind_G", to: "J7_G", distance_steps: 5, instruction: "Exit Openmind", edge_type: "corridor", turn: "straight" },
                    { from: "J7_G", to: "Openmind_G", distance_steps: 5, instruction: "Enter Openmind", edge_type: "corridor", turn: "straight" },

                    // J8: Sane Room
                    { from: "SaneRoom_G", to: "J8_G", distance_steps: 5, instruction: "Exit Sane Room", edge_type: "corridor", turn: "straight" },
                    { from: "J8_G", to: "SaneRoom_G", distance_steps: 5, instruction: "Enter Sane Room", edge_type: "corridor", turn: "straight" },

                    // J9: AUAS
                    { from: "AUAS_G", to: "J9_G", distance_steps: 5, instruction: "Exit AUAS", edge_type: "corridor", turn: "straight" },
                    { from: "J9_G", to: "AUAS_G", distance_steps: 5, instruction: "Enter AUAS", edge_type: "corridor", turn: "straight" },

                    // J10: Unknown (Corner)
                    { from: "Unknown1_G", to: "J10_G", distance_steps: 5, instruction: "Exit Room", edge_type: "corridor", turn: "straight" },
                    { from: "J10_G", to: "Unknown1_G", distance_steps: 5, instruction: "Enter Room", edge_type: "corridor", turn: "straight" },

                    // J11: Washroom
                    { from: "Washroom1_G", to: "J11_G", distance_steps: 4, instruction: "Exit Washroom", edge_type: "corridor", turn: "straight" },
                    { from: "J11_G", to: "Washroom1_G", distance_steps: 4, instruction: "Enter Washroom", edge_type: "corridor", turn: "straight" },

                    // J12: Multiple Connections
                    { from: "DiningHall_G", to: "J12_G", distance_steps: 5, instruction: "Exit Dining Hall", edge_type: "corridor", turn: "straight" },
                    { from: "J12_G", to: "DiningHall_G", distance_steps: 5, instruction: "Enter Dining Hall", edge_type: "corridor", turn: "straight" },

                    { from: "FirstAid_G", to: "J12_G", distance_steps: 4, instruction: "Exit First Aid", edge_type: "corridor", turn: "straight" },
                    { from: "J12_G", to: "FirstAid_G", distance_steps: 4, instruction: "Enter First Aid", edge_type: "corridor", turn: "straight" },

                    { from: "StairsLeft1_G", to: "J12_G", distance_steps: 4, instruction: "To corridor", edge_type: "stairs", turn: "straight" },
                    { from: "J12_G", to: "StairsLeft1_G", distance_steps: 4, instruction: "Go to Stairs", edge_type: "stairs", turn: "straight" },

                    // Direct Shortcuts for Navigation Quality
                    { from: "Reception_G", to: "J2_G", distance_steps: 12, instruction: "Turn Right towards ASAP Office", edge_type: "corridor", turn: "right" },
                    { from: "Reception_G", to: "J12_G", distance_steps: 14, instruction: "Turn Left towards Dining Hall", edge_type: "corridor", turn: "left" },
                    { from: "J2_G", to: "Reception_G", distance_steps: 12, instruction: "Turn Left into Reception", edge_type: "corridor", turn: "left" },
                    { from: "J12_G", to: "Reception_G", distance_steps: 14, instruction: "Turn Right into Reception", edge_type: "corridor", turn: "right" }
                ]
            }
        ]
    }
};
