-- Create building_nodes table
CREATE TABLE IF NOT EXISTS public.building_nodes (
    id TEXT PRIMARY KEY, -- e.g. "J1_G", "Reception_G"
    floor_id TEXT NOT NULL, -- e.g. "G", "F1"
    node_type TEXT NOT NULL, -- "junction", "room", "entry", etc.
    name TEXT NOT NULL,
    junction_id TEXT, -- Links room to its access junction
    x FLOAT,
    y FLOAT,
    image TEXT,
    cue TEXT,
    is_unavailable BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create building_edges table
CREATE TABLE IF NOT EXISTS public.building_edges (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    floor_id TEXT NOT NULL,
    from_node_id TEXT NOT NULL REFERENCES public.building_nodes(id) ON DELETE CASCADE,
    to_node_id TEXT NOT NULL REFERENCES public.building_nodes(id) ON DELETE CASCADE,
    distance_steps INTEGER NOT NULL,
    instruction TEXT NOT NULL,
    edge_type TEXT NOT NULL, -- "corridor", "stairs", "lift"
    turn TEXT, -- "left", "right", "straight"
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE public.building_nodes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.building_edges ENABLE ROW LEVEL SECURITY;

-- Create policies (Allow all for now, or match existing patterns)
-- Assuming public read, authenticated write is standard, or just public for everything if it's a demo/internal app.
-- Given existing tables likely have policies, I'll add basic public read/write for simplicity as per user request context.
CREATE POLICY "Enable read access for all users" ON public.building_nodes FOR SELECT USING (true);
CREATE POLICY "Enable write access for all users" ON public.building_nodes FOR ALL USING (true);

CREATE POLICY "Enable read access for all users" ON public.building_edges FOR SELECT USING (true);
CREATE POLICY "Enable write access for all users" ON public.building_edges FOR ALL USING (true);
