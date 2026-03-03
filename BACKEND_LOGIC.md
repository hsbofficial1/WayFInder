# WayFinder — Backend Navigation Logic Documentation

> This document explains exactly how WayFinder navigates a user from one location to another. It covers the data model, graph structure, Dijkstra's algorithm for shortest path, multi-floor routing, and how instructions are generated.

---

## Table of Contents
1. [High-Level Overview](#1-high-level-overview)
2. [Data Model — Nodes](#2-data-model--nodes)
3. [Data Model — Edges](#3-data-model--edges)
4. [What is a Junction?](#4-what-is-a-junction)
5. [How Data is Stored](#5-how-data-is-stored)
6. [Building the Graph in Memory](#6-building-the-graph-in-memory)
7. [Finding the Shortest Path — Dijkstra's Algorithm](#7-finding-the-shortest-path--dijkstras-algorithm)
8. [Distance Calculation](#8-distance-calculation)
9. [Multi-Floor Routing](#9-multi-floor-routing)
10. [Instruction & Icon Generation](#10-instruction--icon-generation)
11. [Language Translation (ML / KN)](#11-language-translation-ml--kn)
12. [Manual Routes vs. Graph Routes](#12-manual-routes-vs-graph-routes)
13. [Supabase Sync (Database)](#13-supabase-sync-database)
14. [End-to-End Flow Summary](#14-end-to-end-flow-summary)

---

## 1. High-Level Overview

WayFinder models the physical building as a **Graph**. In a graph:

- **Nodes** are places (rooms, junctions, stairs, lift, etc.)
- **Edges** are the walkable corridors between them
- Each edge has a **weight** (distance in steps)

When a user selects "From: Reception" and "To: Admin Office", the app:
1. Loads all nodes and edges for all floors into memory
2. Runs **Dijkstra's Algorithm** to find the cheapest (fewest steps) path
3. Converts the raw path into human-readable **instructions with icons**
4. Displays photos of each landmark along the way

---

## 2. Data Model — Nodes

A **Node** represents any physical point in the building. Defined in `src/types/building.ts`:

```typescript
interface BuildingNode {
    node_id: string;        // Unique ID e.g. "ASAP_G", "J1_G", "Stairs5_F1"
    node_type: NodeType;    // "junction" | "room" | "stairs" | "lift" | "entry" | "exit"
    category?: string;      // "office" | "lab" | "hotspot" | "utility" | "room" | "entry"
    name: string;           // Display name e.g. "ASAP Office"
    name_ml?: string;       // Malayalam name
    name_kn?: string;       // Kannada name
    floor: FloorId;         // "G" | "F1" | "F2"
    junction_id: string | null;  // Which junction this node belongs to (for rooms)
    image?: string;         // Path to panorama/photo for visual aid
    cue?: string;           // A short description to help identify the room
    is_unavailable?: boolean;   // If true, room is closed
    x?: number;             // Optional x coordinate on floor map
    y?: number;             // Optional y coordinate on floor map
}
```

### Node Types Explained

| Type       | What it is                                     | Example                   |
|------------|------------------------------------------------|---------------------------|
| `junction` | A corridor intersection / routing hub          | `J1_G`, `J13_F1`         |
| `room`     | Any named destination (office, lab, hotspot)   | `ASAP_G`, `SaneRoom_G`   |
| `stairs`   | A staircase node (connects floors)             | `StairsLeft1_G`           |
| `lift`     | An elevator/lift node (connects floors)        | `Lift1_G`                 |
| `entry`    | Main building entry point                      | `Reception_G`             |
| `exit`     | Emergency or building exit                     | `EmergencyExit_G`         |

### Real Example (from `building_data.ts`)
```typescript
{
    node_id: "ASAP_G",
    node_type: "room",
    category: "office",
    name: "ASAP Office",
    floor: "G",
    junction_id: "J2_G",          // <-- Connected to this junction
    image: "/assets/panoramas/j2.jpg",
    cue: "the ASAP Branding office"
}
```

---

## 3. Data Model — Edges

An **Edge** is a direct connection between two nodes. Defined in `src/types/building.ts`:

```typescript
interface BuildingEdge {
    id?: string;            // Database UUID (only when loaded from Supabase)
    from: string;           // Source node_id
    to: string;             // Target node_id
    distance_steps: number; // How many "steps" long this path segment is
    instruction: string;    // Human-readable instruction e.g. "Turn left towards ASAP Office"
    edge_type: EdgeType;    // "corridor" | "stairs" | "lift"
    turn?: "left" | "right" | "straight";  // Direction hint for icon
    floor_id?: string;      // Which floor this edge primarily belongs to
}
```

### Key Points About Edges
- **Edges are directional**: A→B and B→A are stored as separate edge entries.
- **Bidirectional storage**: Every corridor is stored twice (one for each direction), with a different instruction so it makes sense in both directions.
- **Inter-floor edges**: Stairs and lifts have edges that cross from one floor to another. No special handling is needed in the data — the algorithm handles it naturally.

### Real Example (from `building_data.ts`)
```typescript
// Going from J1 towards ASAP office direction:
{ from: "J1_G",  to: "J2_G",  distance_steps: 8, instruction: "Walk straight towards ASAP Office", edge_type: "corridor", turn: "straight" }

// Reverse direction:
{ from: "J2_G",  to: "J1_G",  distance_steps: 8, instruction: "Walk straight towards Reception",    edge_type: "corridor", turn: "straight" }
```

---

## 4. What is a Junction?

Junctions are the **backbone** of the WayFinder graph. They represent corridor intersections — points in the hallway where you can choose to go different directions.

### The "Hub and Spoke" Model

Rooms are **not** directly connected to each other. Instead:
- Every room is linked to a nearby **junction** via `junction_id`
- The graph system automatically creates a Room ↔ Junction edge (both directions)
- This means the actual path always goes: `Room A → Junction → ... → Junction → Room B`

```
Reception_G ──(5 steps)──► J1_G ──(8 steps)──► J2_G ──(5 steps)──► ASAP_G
```

### Why this design?
- **Simplicity**: You only need to wire junctions together. Rooms just declare which junction they are near.
- **Maintainability**: Adding a new room only requires adding the node with a `junction_id`. The edge is auto-generated.
- **Real-world accuracy**: In a real building, you walk out of a room into the corridor (junction), then navigate from there.

### Auto-Generated Junction ↔ Room Edges
In `graphData.ts`, the system scans all nodes. For any node that is **not** a junction but has a `junction_id`, it automatically creates:

```typescript
// Room → Junction (exiting a room)
addEdge(node.node_id, node.junction_id, 5, `Exit ${node.name} and proceed to the corridor`, "corridor");

// Junction → Room (entering a room)
addEdge(node.junction_id, node.node_id, 5, `Enter ${node.name}`, "corridor");
```

The default distance for this auto-generated connection is **5 steps**.

---

## 5. How Data is Stored

WayFinder uses a **dual-source** approach:

### Primary Source: `building_data.ts`
The file `src/data/building_data.ts` is the **single source of truth** for all building graph data.

```
BuildingData
└── Building (name: "Main Building")
    └── Floors[]
        ├── Floor G (Ground Floor)
        │   ├── nodes: [J1_G, J2_G, ..., Reception_G, ASAP_G, ...]
        │   └── edges: [{from: J1_G, to: J2_G, ...}, ...]
        ├── Floor F1 (First Floor)
        │   ├── nodes: [J13_F1, J14_F1, ..., AdminOffice_F1, ...]
        │   └── edges: [{from: J13_F1, to: J14_F1, ...}, ...]
        └── Floor F2 (Second Floor)
            └── ...
```

### Secondary Source: Supabase (Database)
The node and edge data can be synced to Supabase using the **Admin Seed Tool**. This allows the database to optionally override the local data at runtime. Tables involved:
- `building_nodes` — stores all node data
- `building_edges` — stores all edge data

If Supabase has data, it is loaded via the `NavigationContext` and passed to the routing functions. If no database data is available, the system falls back to `building_data.ts`.

---

## 6. Building the Graph in Memory

Before any pathfinding, the raw node/edge arrays are converted into an **adjacency list** — a dictionary where each key is a node ID and its value is a list of edges going out from it.

Done in `buildGraphFromData()` inside `src/data/graphData.ts`:

```typescript
// An adjacency list looks like this:
{
  "J1_G": [
    { to: "J2_G",  weight: 8,  instruction: "Walk straight...", type: "corridor" },
    { to: "J12_G", weight: 10, instruction: "Walk straight...", type: "corridor" },
    { to: "Reception_G", weight: 5, instruction: "Enter Reception", type: "corridor" }
  ],
  "J2_G": [
    { to: "J1_G",  weight: 8, ... },
    { to: "J3_G",  weight: 6, ... },
    { to: "ASAP_G", weight: 5, ... }
  ],
  ...
}
```

**Steps in `buildGraphFromData`:**
1. Loop over all nodes → build `nodesMap` (a dictionary of `node_id → node data`)
2. Loop over all explicit edges → add them to the adjacency list
3. Loop over all nodes again → auto-generate Junction ↔ Room edges for any node with a `junction_id`

---

## 7. Finding the Shortest Path — Dijkstra's Algorithm

The core pathfinding is implemented inside `findGraphRoute()` in `src/data/graphData.ts`.

### What is Dijkstra's Algorithm?

It's a **greedy** algorithm that guarantees finding the shortest path in a graph with non-negative weights. It works by always expanding the cheapest unvisited node first.

### Step-by-Step Execution

Given `From: Reception_G` → `To: AdminOffice_F1`:

**Step 1 — Initialization**
```
distances = {
    "J1_G":              Infinity,
    "Reception_G":       0,        ← Starting point is 0
    "J2_G":              Infinity,
    "AdminOffice_F1":    Infinity,
    ... (all other nodes → Infinity)
}
previous = { all nodes → null }
queue    = [ all node IDs ]
```

**Step 2 — Visit the Cheapest Unvisited Node**
The node with the lowest distance in the queue is picked: `Reception_G` (distance = 0).

Check its neighbors (edges from `Reception_G`):
- `J1_G` via edge weight 5 → `0 + 5 = 5 < Infinity` → update `distances["J1_G"] = 5`, `previous["J1_G"] = "Reception_G"`
- `J2_G` via shortcut edge weight 12 → `0 + 12 = 12` → update
- `J12_G` via shortcut edge weight 14 → update

Remove `Reception_G` from the queue.

**Step 3 — Repeat for Next Cheapest**
Now `J1_G` (distance = 5) is picked. Its neighbors:
- `J2_G` → `5 + 8 = 13`. But `J2_G` already has 12 from previous step, so no update.
- `J12_G` → `5 + 10 = 15`. Already has 14, no update.

...and so on, level by level across the entire graph.

**Step 4 — Stop When Destination is Reached**

```typescript
if (u === null || distances[u] === Infinity || u === toId) break;
```

Once `AdminOffice_F1` is the node being processed (i.e., it's the cheapest remaining), the loop stops.

**Step 5 — Reconstruct the Path**
Trace backwards using the `previous` map:

```
AdminOffice_F1 ← J16_F1 ← J15_F1 ← J14_F1 ← J13_F1 ← Stairs5_F1 ← StairsLeft1_G ← J12_G ← J1_G ← Reception_G
```

Then reverse it:
```
Reception_G → J1_G → J12_G → StairsLeft1_G → Stairs5_F1 → J13_F1 → J14_F1 → J15_F1 → J16_F1 → AdminOffice_F1
```

---

## 8. Distance Calculation

The **total distance** (`totalWeight`) of a route is calculated by summing the `weight` (= `distance_steps`) of every edge along the found path:

```typescript
let totalWeight = 0;

for (let i = 0; i < path.length - 1; i++) {
    const edge = graph[path[i]]?.find(e => e.to === path[i + 1]);
    if (edge) {
        totalWeight += edge.weight;
    }
}
```

### What is a "step"?
A **step** is an abstract unit of distance. It is used instead of meters to keep the system building-agnostic and easy to author. A typical room → junction edge is 5 steps, a corridor segment is 6–10 steps, and stairs are 20 steps.

The final `totalWeight` is returned as the route's `duration`, which the UI can display to the user ("Estimated: ~47 steps" or convert to time).

---

## 9. Multi-Floor Routing

The system handles multi-floor navigation **transparently** — no special code is needed for cross-floor routing. Here's why:

### Inter-floor Edges in Data
In `building_data.ts`, staircase nodes on different floors are explicitly connected:

```typescript
// Ground Floor edges:
{ from: "StairsLeft1_G",  to: "Stairs5_F1",     distance_steps: 20, instruction: "Go up to First Floor",   edge_type: "stairs" },
{ from: "StairsRight1_G", to: "Stairs4_F1",     distance_steps: 20, instruction: "Go up to First Floor",   edge_type: "stairs" },

// First Floor edges (reverse):
{ from: "Stairs4_F1", to: "StairsRight1_G",    distance_steps: 20, instruction: "Go down to Ground Floor", edge_type: "stairs" },
{ from: "Stairs5_F1", to: "StairsLeft1_G",     distance_steps: 20, instruction: "Go down to Ground Floor", edge_type: "stairs" }
```

Since all floors are flattened into one single graph in memory, Dijkstra's algorithm naturally finds paths that cross floors by traversing these stair/lift edges.

### Icon Detection for Floor Changes

After the path is found, when generating steps, the system checks if consecutive nodes are on different floors:

```typescript
if (currNode.floorNumber !== nextNode.floorNumber) {
    const isGoingUp = nextNode.floorNumber > currNode.floorNumber;
    icon = (edge.type === "lift")
        ? (isGoingUp ? "lift-up"   : "lift-down")
        : (isGoingUp ? "stairs-up" : "stairs-down");
}
```

`floorNumber` is derived from the `floor` string (`"G"` → 0, `"F1"` → 1, `"F2"` → 2).

---

## 10. Instruction & Icon Generation

After the path is found, each edge in the path is converted into a `RouteStep`:

```typescript
interface RouteStep {
    instruction: string;      // e.g. "Turn left towards ASAP Office"
    instruction_ml?: string;  // Same in Malayalam
    instruction_kn?: string;  // Same in Kannada
    icon: IconType;           // Visual icon for the step
    floor: number;            // Which floor this step is on
    landmarkImage?: string;   // Photo or panorama of the target node
}
```

### Icon Selection Logic

Icons are decided in this priority order:
1. **Floor change?** → `stairs-up`, `stairs-down`, `lift-up`, `lift-down`
2. **Arriving at destination (junction → room)?** → `destination`
3. **Departing from start (room → junction)?** → `start`
4. **Otherwise** → Use the `turn` field from the edge, or detect "left"/"right" keywords in the instruction text. Default: `straight`

### Final Destination Step
A special step is always appended at the end:
```typescript
steps.push({
    instruction: `You have reached ${finalNode.name}`,
    icon: "destination",
    floor: finalNode.floorNumber,
    landmarkImage: finalNode.image || "/panorama.jpg"
});
```

### Landmark Image
Every step shows the `image` of the **next node** (the target of that edge) as a visual landmark so the user can confirm "yes, that's what I should see".

---

## 11. Language Translation (ML / KN)

Instructions are automatically translated using `generateML()` and `generateKN()` functions in `graphData.ts`. The translation is icon-based (not text-based), so common actions are always translated correctly:

| Icon        | English                  | Malayalam (ML)              | Kannada (KN)               |
|-------------|--------------------------|-----------------------------|----------------------------|
| `left`      | Turn left                | ഇടത്തോട്ട് തിരിയുക           | ಎಡಕ್ಕೆ ತಿರುಗಿ               |
| `right`     | Turn right               | വലത്തോട്ട് തിരിയുക           | ಬಲಕ್ಕೆ ತಿರುಗಿ               |
| `straight`  | Walk straight            | നേരെ പോകുക                  | ನೇರವಾಗಿ ಹೋಗಿ               |
| `stairs-*`  | Use stairs               | പടികൾ ഉപയോഗിക്കുക           | ಮೆಟ್ಟಿಲುಗಳನ್ನು ಬಳಸಿ         |
| `lift-*`    | Use lift                 | ലിഫ്റ്റ് ഉപയോഗിക്കുക        | ಲಿಫ್ಟ್ ಬಳಸಿ                |
| enter/exit  | Detected from instruction text |  പ്രവേശിക്കുക / പുറത്തുകടക്കുക | ಪ್ರವೇಶಿಸಿ / ನಿರ್ಗಮಿಸಿ |

If the node has an explicit `name_ml` or `name_kn`, it is used in the final "You have reached..." step.

---

## 12. Manual Routes vs. Graph Routes

The system supports two types of routes:

### Manual Routes (`routes.ts`)
Pre-defined routes authored manually. These take **priority** over computed routes if a match is found for the `from` → `to` pair. Currently the `routes[]` array is empty and reserved for future use.

### Graph Routes (`graphData.ts`)
Automatically computed using Dijkstra's algorithm. This is what runs for every real navigation request.

**Priority logic in `useNavigation.ts`:**
```typescript
// 1. Check for a manual route first
const manualRoute = routes.find(r => r.from === from && r.to === to);

// 2. If no manual route, compute using graph
if (!manualRoute) {
    return findGraphRoute(from, to, graphNodes, graphEdges);
}
```

---

## 13. Supabase Sync (Database)

The graph data can be pushed to Supabase using the Admin Seed tool (`src/lib/graph-seed.ts`). This enables the admin to manage graph data from the cloud without deploying code.

### Seed Process (`seedGraphData`)
1. **Delete** all existing `building_edges` from Supabase (edges are deleted first to respect foreign key constraints)
2. **Delete** all existing `building_nodes` from Supabase
3. **Insert** all nodes (from `building_data.ts`) into the `building_nodes` table
4. **Insert** all edges (from `building_data.ts`) into the `building_edges` table

### Database Schema (logical)

**`building_nodes`**

| Column         | Type    | Description                      |
|----------------|---------|----------------------------------|
| `id`           | text    | Node ID (e.g. `J1_G`)           |
| `floor_id`     | text    | `G`, `F1`, or `F2`              |
| `node_type`    | text    | `junction`, `room`, etc.        |
| `name`         | text    | Display name                     |
| `junction_id`  | text    | Parent junction (nullable)       |
| `x`, `y`       | float   | Map coordinates (optional)       |
| `image`        | text    | Panorama image path              |
| `cue`          | text    | Landmark description             |
| `is_unavailable`| bool  | Whether the room is closed       |

**`building_edges`**

| Column           | Type    | Description                          |
|------------------|---------|--------------------------------------|
| `id`             | uuid    | Auto-generated                       |
| `floor_id`       | text    | Floor context                        |
| `from_node_id`   | text    | FK → `building_nodes.id`            |
| `to_node_id`     | text    | FK → `building_nodes.id`            |
| `distance_steps` | int     | Edge weight                          |
| `instruction`    | text    | Navigation instruction               |
| `edge_type`      | text    | `corridor`, `stairs`, or `lift`     |
| `turn`           | text    | `left`, `right`, or `straight`      |

---

## 14. End-to-End Flow Summary

Here is the complete journey from a user selecting locations to seeing turn-by-turn instructions:

```
User selects "From" and "To" in LocationSelector
          ↓
  useFindRoute(from, to, enabled) is called
          ↓
  Check manual routes first
  (If found → use manual steps)
          ↓
  findGraphRoute(from, to, nodes, edges) is called
          ↓
  buildGraphFromData(nodes, edges)
  ├── Build nodesMap { node_id → node }
  ├── Add all explicit edges to adjacency list
  └── Auto-generate Junction ↔ Room edges (5 steps each)
          ↓
  Dijkstra's Algorithm runs
  ├── Initialize all distances: from = 0, others = Infinity
  ├── Repeat: pick cheapest unvisited node → relax its neighbors
  └── Stop when destination is reached
          ↓
  Reconstruct path using `previous` pointer map
  [Reception_G → J1_G → ... → AdminOffice_F1]
          ↓
  Convert path into RouteStep[]
  ├── Detect floor changes → assign stair/lift icons
  ├── Assign turn icons (left/right/straight)
  ├── Add landmark image from target node
  └── Generate ML/KN translations for each step
          ↓
  Append final "You have reached X" step
          ↓
  Return { path, steps, totalWeight }
          ↓
  UI renders step-by-step navigation cards with
  icons, instructions (in chosen language), and landmark photos
```

---

*Last updated: February 2026 | WayFinder — ASAP Navigation System*
