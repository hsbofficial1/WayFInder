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
                    // --- Main Corridor Chain (Reverse Order per Request) ---
                    // J1 -> J12 -> J11 -> J10 -> J9 -> J8 -> J7 -> J6 -> J5 -> J4 -> J3 -> J2

                    { from: "J1_G", to: "J12_G", distance_steps: 10, instruction: "Walk towards Dining Hall / First Aid", edge_type: "corridor", turn: "straight" },
                    { from: "J12_G", to: "J1_G", distance_steps: 10, instruction: "Walk towards Reception", edge_type: "corridor", turn: "straight" },

                    { from: "J12_G", to: "J11_G", distance_steps: 8, instruction: "Turn left towards Washroom", edge_type: "corridor", turn: "left" },
                    { from: "J11_G", to: "J12_G", distance_steps: 8, instruction: "Turn right towards Dining Area", edge_type: "corridor", turn: "right" },

                    { from: "J11_G", to: "J10_G", distance_steps: 6, instruction: "Walk past the Washroom", edge_type: "corridor", turn: "straight" },
                    { from: "J10_G", to: "J11_G", distance_steps: 6, instruction: "Walk towards Washroom", edge_type: "corridor", turn: "straight" },

                    { from: "J10_G", to: "J9_G", distance_steps: 6, instruction: "Turn right towards AUAS", edge_type: "corridor", turn: "right" },
                    { from: "J9_G", to: "J10_G", distance_steps: 6, instruction: "Go straight down the corridor", edge_type: "corridor", turn: "left" },

                    { from: "J9_G", to: "J8_G", distance_steps: 8, instruction: "Walk straight towards Sane Room", edge_type: "corridor", turn: "straight" },
                    { from: "J8_G", to: "J9_G", distance_steps: 8, instruction: "Go straight towards AUAS", edge_type: "corridor", turn: "straight" },

                    { from: "J8_G", to: "J7_G", distance_steps: 6, instruction: "Turn left towards Openmind", edge_type: "corridor", turn: "left" },
                    { from: "J7_G", to: "J8_G", distance_steps: 6, instruction: "Go straight towards Sane Room", edge_type: "corridor", turn: "right" },

                    { from: "J7_G", to: "J6_G", distance_steps: 8, instruction: "Walk towards KSUM", edge_type: "corridor", turn: "straight" },
                    { from: "J6_G", to: "J7_G", distance_steps: 8, instruction: "Go straight towards Openmind", edge_type: "corridor", turn: "straight" },

                    { from: "J6_G", to: "J5_G", distance_steps: 10, instruction: "Turn right towards Stairs", edge_type: "corridor", turn: "right" },
                    { from: "J5_G", to: "J6_G", distance_steps: 10, instruction: "Go straight towards KSUM", edge_type: "corridor", turn: "left" },

                    { from: "J5_G", to: "J4_G", distance_steps: 6, instruction: "Walk straight towards Lift", edge_type: "corridor", turn: "straight" },
                    { from: "J4_G", to: "J5_G", distance_steps: 6, instruction: "Go straight past the Lift", edge_type: "corridor", turn: "straight" },

                    { from: "J4_G", to: "J3_G", distance_steps: 6, instruction: "Turn left towards Emergency Exit", edge_type: "corridor", turn: "left" },
                    { from: "J3_G", to: "J4_G", distance_steps: 6, instruction: "Go straight towards Lift", edge_type: "corridor", turn: "right" },

                    { from: "J3_G", to: "J2_G", distance_steps: 6, instruction: "Walk towards ASAP Office", edge_type: "corridor", turn: "straight" },
                    { from: "J2_G", to: "J3_G", distance_steps: 6, instruction: "Go straight towards Emergency Exit", edge_type: "corridor", turn: "straight" },


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

                    // J5: Stairs Right 1
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

                    // J10: Unknown
                    { from: "Unknown1_G", to: "J10_G", distance_steps: 5, instruction: "Exit Room", edge_type: "corridor" },
                    { from: "J10_G", to: "Unknown1_G", distance_steps: 5, instruction: "Enter Room", edge_type: "corridor" },

                    // J11: Washroom
                    { from: "Washroom1_G", to: "J11_G", distance_steps: 4, instruction: "Exit Washroom", edge_type: "corridor" },
                    { from: "J11_G", to: "Washroom1_G", distance_steps: 4, instruction: "Enter Washroom 1", edge_type: "corridor" },

                    // J12: Multiple Connections
                    // Dining Hall
                    { from: "DiningHall_G", to: "J12_G", distance_steps: 5, instruction: "Exit the dining hall and walk 5 steps", edge_type: "corridor" },
                    { from: "J12_G", to: "DiningHall_G", distance_steps: 5, instruction: "Walk 5 steps, the dining hall will be in front of you", edge_type: "corridor" },
                    // First Aid
                    { from: "FirstAid_G", to: "J12_G", distance_steps: 4, instruction: "Exit First Aid Room", edge_type: "corridor" },
                    { from: "J12_G", to: "FirstAid_G", distance_steps: 4, instruction: "Enter First Aid Room", edge_type: "corridor" },
                    // Stairs Left
                    { from: "StairsLeft1_G", to: "J12_G", distance_steps: 4, instruction: "Move from stairs to corridor", edge_type: "stairs" },
                    { from: "J12_G", to: "StairsLeft1_G", distance_steps: 4, instruction: "Go to the Left Stairs", edge_type: "stairs" }
                ]
            }
        ]
    }
};
