# WayFinder - Indoor Navigation System 📍

[Live Demo](https://asap-wayfinder.vercel.app/)

**WayFinder** is an open-source, manual indoor navigation Progressive Web App (PWA) designed to help visitors navigate complex buildings without relying on GPS, internet connectivity, or expensive sensor infrastructure.

It uses a **graph-based routing algorithm** to generate step-by-step visual instructions, making it perfect for campuses, office buildings, conference venues, and hospitals.

![WayFinder Preview](/public/wayfinder-social-preview.png)

## 🚀 Key Features

- **🚫 No GPS Needed**: Works entirely based on visual landmarks and logical routing.
- **⚡ Offline Capable**: Built as a PWA, so it works even without an internet connection once loaded.
- **📸 Visual Guidance**: Provides clear, visual cues (e.g., "Turn left at the Reception", "Take the stairs to Floor 1").
- **🌍 Multilingual Support**: Fully localized in **English**, **Malayalam**, and **Kannada**.
- **🔎 Interaction**: 
    - **Quick Access Buttons**: One-tap directions to common places like Restrooms, Cafeteria, and Exits.
    - **"I'm Lost" Feature**: Allows users to re-orient themselves if they miss a turn.
- **♿ Accessibility**: Simple, high-contrast UI with large touch targets.

---

## 🛠️ Technology Stack

- **Frontend Framework**: [React](https://react.dev/) with [TypeScript](https://www.typescriptlang.org/)
- **Build Tool**: [Vite](https://vitejs.dev/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **UI Components**: [shadcn/ui](https://ui.shadcn.com/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Routing Algorithm**: Custom graph implementation (Dijkstra/BFS based)
- **Deployment**: Vercel

---

## 📂 Project Structure

Here's a quick overview of the key directories:

```
src/
├── components/        # Reusable UI components (StepView, LocationSelector, etc.)
├── context/           # React Contexts (LanguageContext, NavigationContext)
├── data/              # Core Logic & Data
│   ├── graphData.ts   # Defines map nodes, edges, and connections
│   ├── locations.ts   # List of all searchable locations
│   └── routes.ts      # Type definitions for routes
├── hooks/             # Custom hooks (useNavigation)
├── pages/             # Main application pages
└── lib/               # Utilities (graph algorithms, class mergers)
```

---

## 🧭 How It Works

WayFinder treats the building as a **Graph** where:
- **Nodes** represent physical locations (Rooms, Corners, Intersections).
- **Edges** represent walkable paths between them, with "weights" (distance/effort).

When a user selects a **Start** and **Destination**:
1.  The app calculates the shortest path using the graph algorithm.
2.  It converts the abstract path (List of Node IDs) into human-readable instructions.
    - *Example:* If moving from `Node A` -> `Node B` involves a floor change, it generates: *"Take the stairs/lift to Floor X".*
3.  Each step is enriched with metadata like **Landmark Images**, **Floor Numbers**, and **Directional Icons** (Left, Right, Straight, U-Turn).

---

## 🚀 Getting Started

Follow these steps to run WayFinder on your local machine.

### Prerequisites
- Node.js (v18 or higher)
- npm or bun

### Installation

1.  **Clone the repository**:
    ```bash
    git clone https://github.com/hsbofficial1/WayFInder.git
    cd WayFinder
    ```

2.  **Install dependencies**:
    ```bash
    npm install
    ```

3.  **Start the development server**:
    ```bash
    npm run dev
    ```

4.  Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## 🗺️ Customizing the Map

To use this for your own building, you need to modify the data files in `src/data/`:

1.  **Define Locations (`locations.ts`)**:
    Add your rooms and points of interest.
    ```typescript
    export const locations = [
      { id: "lobby", name: "Main Lobby", type: "connector", floor: 0 },
      { id: "room-101", name: "Conference Room A", type: "room", floor: 1 },
      // ...
    ];
    ```

2.  **Connect the Graph (`graphData.ts`)**:
    Define how these locations connect to each other.
    ```typescript
    const graph = new NavigationGraph();
    
    // Add nodes with coordinates (x, y are for relative positioning logic)
    graph.addNode("lobby", { x: 0, y: 0, floor: 0 });
    graph.addNode("staircase", { x: 10, y: 0, floor: 0 });
    
    // Connect them (distance in approximate meters/seconds)
    graph.addEdge("lobby", "staircase", 20, "walk");
    ```

3.  **Add Landmarks & Instructions**:
    Update the `landmarks` object in `graphData.ts` to provide visual cues (e.g., "Near the water cooler").

---

## 🤝 Contributing

Contributions are welcome! Whether it's fixing bugs, improving the pathfinding algorithm, or adding new UI features.

1.  Fork the project.
2.  Create your feature branch (`git checkout -b feature/AmazingFeature`).
3.  Commit your changes (`git commit -m 'Add some AmazingFeature'`).
4.  Push to the branch (`git push origin feature/AmazingFeature`).
5.  Open a Pull Request.

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

Built with ❤️ for **Curiosity Weekends** at **ASAP Community Skill Park, Vidyanagar**.
