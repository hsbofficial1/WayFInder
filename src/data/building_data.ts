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
                    { node_id: "J1_G", node_type: "junction", name: "Reception Junction", floor: "G", junction_id: null, image: "/assets/panoramas/J1.jpg" },
                    { node_id: "J2_G", node_type: "junction", name: "ASAP Office Junction", floor: "G", junction_id: null, image: "/assets/panoramas/j2.jpg" },
                    { node_id: "J3_G", node_type: "junction", name: "Emergency Exit Corner Junction", floor: "G", junction_id: null, image: "/assets/panoramas/j3.jpg" },
                    { node_id: "J4_G", node_type: "junction", name: "Lift Junction", floor: "G", junction_id: null, image: "/assets/panoramas/j4.jpg" },
                    { node_id: "J5_G", node_type: "junction", name: "Right Stairs Junction", floor: "G", junction_id: null, image: "/assets/panoramas/j5.jpg" },
                    { node_id: "J6_G", node_type: "junction", name: "KSUM Corner Junction", floor: "G", junction_id: null, image: "/assets/panoramas/j6.jpg" },
                    { node_id: "J7_G", node_type: "junction", name: "Openmind Junction", floor: "G", junction_id: null, image: "/assets/panoramas/j7.jpg" },
                    { node_id: "J8_G", node_type: "junction", name: "Sane Room Junction", floor: "G", junction_id: null, image: "/assets/panoramas/j8.jpg" },
                    { node_id: "J9_G", node_type: "junction", name: "AUAS Corner Junction", floor: "G", junction_id: null, image: "/assets/panoramas/j9.jpg" },
                    { node_id: "J10_G", node_type: "junction", name: "Corridor Junction", floor: "G", junction_id: null, image: "/assets/panoramas/j10.jpg" },
                    { node_id: "J11_G", node_type: "junction", name: "Washroom Junction", floor: "G", junction_id: null, image: "/assets/panoramas/j11.jpg" },
                    { node_id: "J12_G", node_type: "junction", name: "Dining / First Aid / Stairs Corner Junction", floor: "G", junction_id: null, image: "/assets/panoramas/j12.jpg" },

                    // Rooms / Entries / Exits
                    { node_id: "Reception_G", node_type: "entry", name: "Reception", floor: "G", junction_id: "J1_G", image: "/assets/panoramas/Reception.jpg" },
                    { node_id: "EntryGate_G", node_type: "exit", name: "Entry Gate", floor: "G", junction_id: "J1_G", image: "/assets/panoramas/Entry Gate.jpg" },
                    { node_id: "ASAP_G", node_type: "room", name: "ASAP Office", floor: "G", junction_id: "J2_G", image: "/assets/panoramas/j2.jpg" },
                    { node_id: "EmergencyExit_G", node_type: "exit", name: "Emergency Exit", floor: "G", junction_id: "J3_G", image: "/assets/panoramas/j3.jpg" },
                    { node_id: "Lift1_G", node_type: "lift", name: "Lift 1", floor: "G", junction_id: "J4_G", image: "/assets/panoramas/j4.jpg" },
                    { node_id: "StairsRight1_G", node_type: "stairs", name: "Stairs Right 1", floor: "G", junction_id: "J5_G", image: "/assets/panoramas/j5.jpg" },
                    { node_id: "KSUM_G", node_type: "room", "name": "Leap / Mission Start up Kerala", floor: "G", junction_id: "J6_G", image: "/assets/panoramas/j6.jpg" },
                    { node_id: "Openmind_G", node_type: "room", "name": "Openmind", floor: "G", junction_id: "J7_G", image: "/assets/panoramas/j7.jpg" },
                    { node_id: "SaneRoom_G", node_type: "room", "name": "The Sane Room", floor: "G", junction_id: "J8_G", image: "/assets/panoramas/j8.jpg" },
                    { node_id: "AUAS_G", node_type: "room", "name": "Autonomous AUAS", floor: "G", junction_id: "J9_G", image: "/assets/panoramas/j9.jpg" },
                    { node_id: "Unknown1_G", node_type: "room", "name": "Empty Room", floor: "G", junction_id: "J10_G", image: "/assets/panoramas/j10.jpg" },
                    { node_id: "Washroom1_G", node_type: "room", "name": "Washroom 1", floor: "G", junction_id: "J11_G", image: "/assets/panoramas/j11.jpg" },
                    { node_id: "DiningHall_G", node_type: "room", "name": "Dining Hall", floor: "G", junction_id: "J12_G", image: "/assets/panoramas/Dining Hall.jpg" },
                    { node_id: "FirstAid_G", node_type: "room", "name": "First Aid Room", floor: "G", junction_id: "J12_G", image: "/assets/panoramas/j12.jpg" },
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
                    { from: "J12_G", to: "Reception_G", distance_steps: 14, instruction: "Turn Right into Reception", edge_type: "corridor", turn: "right" },

                    // Inter-floor Connections
                    { from: "StairsLeft1_G", to: "Stairs5_F1", distance_steps: 20, instruction: "Go up to First Floor", edge_type: "stairs", turn: "straight" },
                    { from: "StairsRight1_G", to: "Stairs4_F1", distance_steps: 20, instruction: "Go up to First Floor", edge_type: "stairs", turn: "straight" }
                ]
            },
            {
                floor_id: "F1",
                floor_name: "First Floor",
                nodes: [
                    // Junctions
                    { node_id: "J13_F1", node_type: "junction", name: "Stairs 3 Junction", floor: "F1", junction_id: null, image: "/assets/panoramas/j13.jpg" },
                    { node_id: "J14_F1", node_type: "junction", name: "Crown Down Junction", floor: "F1", junction_id: null, image: "/assets/panoramas/j14.jpg" },
                    { node_id: "J15_F1", node_type: "junction", name: "Unknown 2 Junction", floor: "F1", junction_id: null, image: "/assets/panoramas/j15.jpg" },
                    { node_id: "J16_F1", node_type: "junction", name: "Admin Office Junction", floor: "F1", junction_id: null, image: "/assets/panoramas/j16.jpg" },
                    { node_id: "J17_F1", node_type: "junction", name: "Top Left Corner Junction", floor: "F1", junction_id: null, image: "/assets/panoramas/j17.jpg" },
                    { node_id: "J18_F1", node_type: "junction", name: "Lift 2 Top Junction", floor: "F1", junction_id: null, image: "/assets/panoramas/j18.jpg" },
                    { node_id: "J19_F1", node_type: "junction", name: "Lift 2 Bottom Junction", floor: "F1", junction_id: null, image: "/assets/panoramas/j19.jpg" },
                    { node_id: "J20_F1", node_type: "junction", name: "Foursquare Corner Junction", floor: "F1", junction_id: null, image: "/assets/panoramas/j20.jpg" },
                    { node_id: "J21_F1", node_type: "junction", name: "Noodling Space Junction", floor: "F1", junction_id: null, image: "/assets/panoramas/j21.jpg" },
                    { node_id: "J22_F1", node_type: "junction", name: "Premium Space Junction", floor: "F1", junction_id: null, image: "/assets/panoramas/j22.jpg" },
                    { node_id: "J23_F1", node_type: "junction", name: "Server Room Junction", floor: "F1", junction_id: null, image: "/assets/panoramas/j23.jpg" },
                    { node_id: "J24_F1", node_type: "junction", name: "Focus Space Junction", floor: "F1", junction_id: null, image: "/assets/panoramas/j24.jpg" },
                    { node_id: "J25_F1", node_type: "junction", name: "CW Junction", floor: "F1", junction_id: null, image: "/assets/panoramas/j25.jpg" },

                    // Rooms
                    { node_id: "RuffinRange_F1", node_type: "room", name: "Rappin Range", floor: "F1", junction_id: "J13_F1", image: "/assets/panoramas/rappin range.jpg" },
                    { node_id: "Stairs5_F1", node_type: "stairs", name: "Stairs 3", floor: "F1", junction_id: "J13_F1", image: "/assets/panoramas/j13.jpg" },
                    { node_id: "Washroom2_F1", node_type: "room", name: "Washroom 2", floor: "F1", junction_id: "J13_F1", image: "/assets/panoramas/j13.jpg" },
                    { node_id: "CrownDown_F1", node_type: "room", name: "Crown Down", floor: "F1", junction_id: "J14_F1", image: "/assets/panoramas/j14.jpg" },
                    { node_id: "Unknown2_F1", node_type: "room", name: "Unknown Room 2", floor: "F1", junction_id: "J15_F1", image: "/assets/panoramas/j15.jpg" },
                    { node_id: "AdminOffice_F1", node_type: "room", name: "Administrative Office", floor: "F1", junction_id: "J16_F1", image: "/assets/panoramas/j16.jpg" },
                    { node_id: "Lift2_F1", node_type: "lift", name: "Lift 2", floor: "F1", junction_id: "J18_F1", image: "/assets/panoramas/j18.jpg" },
                    { node_id: "Foursquare_F1", node_type: "room", name: "Foursquare", floor: "F1", junction_id: "J20_F1", image: "/assets/panoramas/j20.jpg" },
                    { node_id: "Stairs4_F1", node_type: "stairs", name: "Stairs 4", floor: "F1", junction_id: "J20_F1", image: "/assets/panoramas/j20.jpg" },
                    { node_id: "NoodlingSpace_F1", node_type: "room", name: "Noodlin Space", floor: "F1", junction_id: "J21_F1", image: "/assets/panoramas/j21.jpg" },
                    { node_id: "PremiumSpace_F1", node_type: "room", name: "Cranium Space", floor: "F1", junction_id: "J22_F1", image: "/assets/panoramas/j22.jpg" },
                    { node_id: "ServerRoom_F1", node_type: "room", name: "Server Room", floor: "F1", junction_id: "J23_F1", image: "/assets/panoramas/j23.jpg" },
                    { node_id: "FocusSpace_F1", node_type: "room", name: "Focus Space", floor: "F1", junction_id: "J24_F1", image: "/assets/panoramas/j24.jpg" },
                    { node_id: "CW_F1", node_type: "room", name: "Curiosity Weekends", floor: "F1", junction_id: "J25_F1", image: "/assets/panoramas/curiosity weekends (cw).jpg" }
                ],
                edges: [
                    // Loop: 13-14-15-16-17-18-19-20-21-22-23-24-25-13
                    // J13 <-> J14
                    { from: "J13_F1", to: "J14_F1", distance_steps: 8, instruction: "Walk straight towards Crown Down", edge_type: "corridor", turn: "straight" },
                    { from: "J14_F1", to: "J13_F1", distance_steps: 8, instruction: "Walk straight towards Ruffin Range", edge_type: "corridor", turn: "straight" },

                    // J14 <-> J15
                    { from: "J14_F1", to: "J15_F1", distance_steps: 6, instruction: "Walk straight towards Unknown Room", edge_type: "corridor", turn: "straight" },
                    { from: "J15_F1", to: "J14_F1", distance_steps: 6, instruction: "Walk straight towards Crown Down", edge_type: "corridor", turn: "straight" },

                    // J15 <-> J16
                    { from: "J15_F1", to: "J16_F1", distance_steps: 6, instruction: "Walk straight towards Admin Office", edge_type: "corridor", turn: "straight" },
                    { from: "J16_F1", to: "J15_F1", distance_steps: 6, instruction: "Walk straight towards Unknown Room", edge_type: "corridor", turn: "straight" },

                    // J16 <-> J17
                    { from: "J16_F1", to: "J17_F1", distance_steps: 6, instruction: "Walk straight towards the corner", edge_type: "corridor", turn: "straight" },
                    { from: "J17_F1", to: "J16_F1", distance_steps: 6, instruction: "Turn Right towards Admin Office", edge_type: "corridor", turn: "right" },

                    // J17 <-> J18
                    { from: "J17_F1", to: "J18_F1", distance_steps: 8, instruction: "Turn Left towards Lift 2", edge_type: "corridor", turn: "left" },
                    { from: "J18_F1", to: "J17_F1", distance_steps: 8, instruction: "Walk straight towards the corner", edge_type: "corridor", turn: "straight" },

                    // J18 <-> J19
                    { from: "J18_F1", to: "J19_F1", distance_steps: 4, instruction: "Walk straight along Lift area", edge_type: "corridor", turn: "straight" },
                    { from: "J19_F1", to: "J18_F1", distance_steps: 4, instruction: "Walk straight along Lift area", edge_type: "corridor", turn: "straight" },

                    // J19 <-> J20
                    { from: "J19_F1", to: "J20_F1", distance_steps: 8, instruction: "Walk straight towards Foursquare", edge_type: "corridor", turn: "straight" },
                    { from: "J20_F1", to: "J19_F1", distance_steps: 8, instruction: "Walk straight towards Lift 2", edge_type: "corridor", turn: "straight" },

                    // J20 <-> J21
                    { from: "J20_F1", to: "J21_F1", distance_steps: 8, instruction: "Turn Left towards Noodling Space", edge_type: "corridor", turn: "left" },
                    { from: "J21_F1", to: "J20_F1", distance_steps: 8, instruction: "Walk straight towards Foursquare", edge_type: "corridor", turn: "straight" },

                    // J21 <-> J22
                    { from: "J21_F1", to: "J22_F1", distance_steps: 8, instruction: "Walk straight towards Premium Space", edge_type: "corridor", turn: "straight" },
                    { from: "J22_F1", to: "J21_F1", distance_steps: 8, instruction: "Walk straight towards Noodling Space", edge_type: "corridor", turn: "straight" },

                    // J22 <-> J23
                    { from: "J22_F1", to: "J23_F1", distance_steps: 8, instruction: "Follow curve to Server Room", edge_type: "corridor", turn: "left" },
                    { from: "J23_F1", to: "J22_F1", distance_steps: 8, instruction: "Follow curve to Premium Space", edge_type: "corridor", turn: "right" },

                    // J23 <-> J24
                    { from: "J23_F1", to: "J24_F1", distance_steps: 6, instruction: "Walk straight towards Focus Space", edge_type: "corridor", turn: "straight" },
                    { from: "J24_F1", to: "J23_F1", distance_steps: 6, instruction: "Walk straight towards Server Room", edge_type: "corridor", turn: "straight" },

                    // J24 <-> J25
                    { from: "J24_F1", to: "J25_F1", distance_steps: 6, instruction: "Walk straight towards CW", edge_type: "corridor", turn: "straight" },
                    { from: "J25_F1", to: "J24_F1", distance_steps: 6, instruction: "Walk straight towards Focus Space", edge_type: "corridor", turn: "straight" },

                    // J25 <-> J13
                    { from: "J25_F1", to: "J13_F1", distance_steps: 6, instruction: "Walk straight to Stairs 3", edge_type: "corridor", turn: "straight" },
                    { from: "J13_F1", to: "J25_F1", distance_steps: 6, instruction: "Walk straight towards CW", edge_type: "corridor", turn: "straight" },

                    // Room Connections
                    { from: "RuffinRange_F1", to: "J13_F1", distance_steps: 4, instruction: "Exit Ruffin Range", edge_type: "corridor", turn: "straight" },
                    { from: "J13_F1", to: "RuffinRange_F1", distance_steps: 4, instruction: "Enter Ruffin Range", edge_type: "corridor", turn: "straight" },

                    { from: "Stairs5_F1", to: "J13_F1", distance_steps: 4, instruction: "Exit Stairs", edge_type: "stairs", turn: "straight" },
                    { from: "J13_F1", to: "Stairs5_F1", distance_steps: 4, instruction: "Go to Stairs 3", edge_type: "stairs", turn: "straight" },

                    { from: "Washroom2_F1", to: "J13_F1", distance_steps: 4, instruction: "Exit Washroom", edge_type: "corridor", turn: "straight" },
                    { from: "J13_F1", to: "Washroom2_F1", distance_steps: 4, instruction: "Enter Washroom", edge_type: "corridor", turn: "straight" },

                    { from: "CrownDown_F1", to: "J14_F1", distance_steps: 4, instruction: "Exit Crown Down", edge_type: "corridor", turn: "straight" },
                    { from: "J14_F1", to: "CrownDown_F1", distance_steps: 4, instruction: "Enter Crown Down", edge_type: "corridor", turn: "straight" },

                    { from: "Unknown2_F1", to: "J15_F1", distance_steps: 4, instruction: "Exit Room", edge_type: "corridor", turn: "straight" },
                    { from: "J15_F1", to: "Unknown2_F1", distance_steps: 4, instruction: "Enter Unknown Room", edge_type: "corridor", turn: "straight" },

                    { from: "AdminOffice_F1", to: "J16_F1", distance_steps: 4, instruction: "Exit Admin Office", edge_type: "corridor", turn: "straight" },
                    { from: "J16_F1", to: "AdminOffice_F1", distance_steps: 4, instruction: "Enter Admin Office", edge_type: "corridor", turn: "straight" },

                    { from: "Lift2_F1", to: "J18_F1", distance_steps: 4, instruction: "Exit Lift", edge_type: "corridor", turn: "straight" },
                    { from: "J18_F1", to: "Lift2_F1", distance_steps: 4, instruction: "Go to Lift 2", edge_type: "corridor", turn: "straight" },

                    { from: "Foursquare_F1", to: "J20_F1", distance_steps: 4, instruction: "Exit Foursquare", edge_type: "corridor", turn: "straight" },
                    { from: "J20_F1", to: "Foursquare_F1", distance_steps: 4, instruction: "Enter Foursquare", edge_type: "corridor", turn: "straight" },

                    { from: "Stairs4_F1", to: "J20_F1", distance_steps: 4, instruction: "Exit Stairs", edge_type: "stairs", turn: "straight" },
                    { from: "J20_F1", to: "Stairs4_F1", distance_steps: 4, instruction: "Go to Stairs 4", edge_type: "stairs", turn: "straight" },

                    { from: "NoodlingSpace_F1", to: "J21_F1", distance_steps: 4, instruction: "Exit Noodling Space", edge_type: "corridor", turn: "straight" },
                    { from: "J21_F1", to: "NoodlingSpace_F1", distance_steps: 4, instruction: "Enter Noodling Space", edge_type: "corridor", turn: "straight" },

                    { from: "PremiumSpace_F1", to: "J22_F1", distance_steps: 4, instruction: "Exit Premium Space", edge_type: "corridor", turn: "straight" },
                    { from: "J22_F1", to: "PremiumSpace_F1", distance_steps: 4, instruction: "Enter Premium Space", edge_type: "corridor", turn: "straight" },

                    { from: "ServerRoom_F1", to: "J23_F1", distance_steps: 4, instruction: "Exit Server Room", edge_type: "corridor", turn: "straight" },
                    { from: "J23_F1", to: "ServerRoom_F1", distance_steps: 4, instruction: "Enter Server Room", edge_type: "corridor", turn: "straight" },

                    { from: "FocusSpace_F1", to: "J24_F1", distance_steps: 4, instruction: "Exit Focus Space", edge_type: "corridor", turn: "straight" },
                    { from: "J24_F1", to: "FocusSpace_F1", distance_steps: 4, instruction: "Enter Focus Space", edge_type: "corridor", turn: "straight" },

                    { from: "CW_F1", to: "J25_F1", distance_steps: 4, instruction: "Exit CW", edge_type: "corridor", turn: "straight" },
                    { from: "J25_F1", to: "CW_F1", distance_steps: 4, instruction: "Enter CW", edge_type: "corridor", turn: "straight" },

                    // Inter-floor Connections (Back to Ground)
                    { from: "Stairs4_F1", to: "StairsRight1_G", distance_steps: 20, instruction: "Go down to Ground Floor", edge_type: "stairs", turn: "straight" },
                    { from: "Stairs5_F1", to: "StairsLeft1_G", distance_steps: 20, instruction: "Go down to Ground Floor", edge_type: "stairs", turn: "straight" }
                ]
            }
        ]
    }
};
