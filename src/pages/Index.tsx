import { useState } from "react";
import { Navigation, AlertCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import LocationSelector from "@/components/LocationSelector";
import StepView from "@/components/StepView";
import { useFindRoute, type RouteWithSteps } from "@/hooks/useNavigation";

const Index = () => {
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [searchTriggered, setSearchTriggered] = useState(false);
  const [activeRoute, setActiveRoute] = useState<RouteWithSteps | null>(null);
  const [error, setError] = useState("");

  const { data: foundRoute, isLoading: isSearching } = useFindRoute(
    from,
    to,
    searchTriggered && !!from && !!to && from !== to
  );

  // Handle route found/not found after query
  const handleShowRoute = () => {
    setError("");
    if (!from || !to) {
      setError("Please select both a starting point and destination.");
      return;
    }
    if (from === to) {
      setError("You're already there! Pick a different destination.");
      return;
    }
    setSearchTriggered(true);
  };

  // Watch for query result
  if (searchTriggered && !isSearching && foundRoute !== undefined) {
    if (foundRoute && !activeRoute) {
      setActiveRoute(foundRoute);
      setSearchTriggered(false);
    } else if (foundRoute === null && !error) {
      setError("Sorry, no route found between these locations. Try different points.");
      setSearchTriggered(false);
    }
  }

  const handleRestart = () => {
    setActiveRoute(null);
    setFrom("");
    setTo("");
    setError("");
    setSearchTriggered(false);
  };

  if (activeRoute) {
    return <StepView route={activeRoute} onRestart={handleRestart} />;
  }

  return (
    <div className="min-h-dvh flex flex-col bg-background">
      {/* Header */}
      <header className="px-5 pt-8 pb-4">
        <div className="flex items-center gap-3 mb-1">
          <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
            <Navigation size={22} className="text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-foreground">WayFinder</h1>
            <p className="text-xs text-muted-foreground">Indoor Navigation</p>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 px-5 pb-8">
        <div className="rounded-2xl bg-card border border-border p-5 shadow-sm space-y-5">
          <div>
            <h2 className="text-lg font-bold text-foreground mb-1">
              Where do you need to go?
            </h2>
            <p className="text-sm text-muted-foreground">
              Select your current location and destination. We'll guide you step by step.
            </p>
          </div>

          <LocationSelector
            value={from}
            onChange={(v) => { setFrom(v); setError(""); setSearchTriggered(false); }}
            label="📍 Where are you now?"
            placeholder="Select your current location"
          />

          <LocationSelector
            value={to}
            onChange={(v) => { setTo(v); setError(""); setSearchTriggered(false); }}
            label="🎯 Where do you want to go?"
            placeholder="Select your destination"
            excludeId={from}
          />

          {error && (
            <div className="flex items-start gap-2 text-destructive bg-destructive/10 px-4 py-3 rounded-xl text-sm">
              <AlertCircle size={18} className="mt-0.5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <Button
            onClick={handleShowRoute}
            disabled={!from || !to || isSearching}
            className="w-full h-14 text-base font-semibold rounded-xl gap-2"
          >
            {isSearching ? (
              <Loader2 size={20} className="animate-spin" />
            ) : (
              <Navigation size={20} />
            )}
            {isSearching ? "Finding Route..." : "Show Route"}
          </Button>
        </div>

        {/* Info section */}
        <div className="mt-6 px-1 space-y-3">
          <div className="flex items-start gap-3 text-sm text-muted-foreground">
            <span className="text-lg">🏢</span>
            <span>This app works inside the building. No GPS or sensors needed — just follow the steps!</span>
          </div>
          <div className="flex items-start gap-3 text-sm text-muted-foreground">
            <span className="text-lg">📶</span>
            <span>Works offline once installed. Add to your home screen for quick access.</span>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Index;
