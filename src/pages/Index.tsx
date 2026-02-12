import React, { useState, useCallback, useEffect } from "react";
import {
  Navigation,
  MapPin,
  Target,
  ArrowRight,
  Info
} from "lucide-react";
import { Button } from "@/components/ui/button";
import LocationSelector from "@/components/LocationSelector";
import StepView from "@/components/StepView";
import { useLocations, type RouteWithSteps } from "@/hooks/useNavigation";
import { findGraphRoute } from "@/data/graphData";
import { RouteStep } from "@/data/routes";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { useLanguage } from "@/context/LanguageContext";
import { useNavigationContext } from "@/context/NavigationContext";
import { toast } from "sonner";

const Index = () => {
  const { t } = useLanguage();
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [activeRoute, setActiveRoute] = useState<RouteWithSteps | null>(null);
  const [greeting, setGreeting] = useState("Hello");
  const { locations } = useNavigationContext();

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting("Good Morning");
    else if (hour < 18) setGreeting("Good Afternoon");
    else setGreeting("Good Evening");
  }, []);

  const handleShowRoute = () => {
    if (!from || !to) {
      toast.error(t('select_start_dest_error') || "Please select both a starting point and destination.");
      return;
    }
    if (from === to) {
      toast.error(t('same_location_error') || "You're already there! Pick a different destination.");
      return;
    }

    try {
      const graphResult = findGraphRoute(from, to, undefined, undefined);
      if (graphResult) {
        const steps: RouteStep[] = graphResult.steps.map((step: any) => ({
          instruction: step.instruction,
          instruction_ml: step.instruction_ml,
          instruction_kn: step.instruction_kn,
          icon: step.icon_type as any,
          floor: step.floor ?? 0,
          landmarkImage: step.landmarkImage,
        }));

        const route: RouteWithSteps = {
          id: "generated-route",
          from,
          to,
          steps,
          duration: graphResult.totalWeight
        };
        setActiveRoute(route);
      } else {
        toast.error(t('no_route_error') || "No route found between these locations.");
      }
    } catch (err) {
      console.error("Route calculation error:", err);
      toast.error("An error occurred while calculating the route.");
    }
  };

  const handleRestart = useCallback(() => {
    setActiveRoute(null);
    setFrom("");
    setTo("");
  }, []);

  const handleLost = useCallback(() => {
    setActiveRoute(null);
    setFrom("");
    toast.info("Please re-select your current location.");
  }, []);

  const quickSelect = (typeOrId: string) => {
    // Try to find by type first, then by ID match
    const target = locations.find(l => l.type === typeOrId || l.id === typeOrId);

    if (target) {
      setTo(target.id);
      toast.success(`Destination set to ${target.name}`);
    } else {
      // Fallback: finding first of type
      const firstOfType = locations.find(l => l.type === typeOrId);
      if (firstOfType) {
        setTo(firstOfType.id);
        toast.success(`Destination set to ${firstOfType.name}`);
      } else {
        toast.info(`No location found for ${typeOrId}`);
      }
    }
  };

  if (activeRoute) {
    return <StepView route={activeRoute} onRestart={handleRestart} onLost={handleLost} />;
  }

  return (
    <div className="min-h-dvh flex flex-col bg-background selection:bg-primary/20">
      {/* Header */}
      <header className="px-6 pt-5 pb-2 flex justify-between items-center z-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary shadow-sm">
            <Navigation size={20} className="fill-current" />
          </div>
          <div>
            <span className="font-bold text-lg tracking-tight leading-none block">WayFinder</span>
            <span className="text-[10px] text-muted-foreground font-medium tracking-wider uppercase">Indoor Guide</span>
          </div>
        </div>
        <LanguageSwitcher />
      </header>

      {/* Main Content */}
      <main className="flex-1 px-6 flex flex-col gap-6 pb-8 overflow-y-auto no-scrollbar">

        {/* Hero / Greeting */}
        <div className="pt-6 space-y-1 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <h1 className="text-3xl font-extrabold text-foreground tracking-tight leading-tight">
            {greeting},
          </h1>
          <p className="text-lg text-muted-foreground font-medium">Where would you like to go?</p>
        </div>

        {/* Input Cards */}
        <div className="flex flex-col gap-0 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-100">
          {/* FROM Card */}
          <div className="group relative z-20">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 z-10 text-primary pointer-events-none">
              <MapPin size={20} />
            </div>
            <div className="relative">
              <LocationSelector
                value={from}
                onChange={setFrom}
                label=""
                placeholder="Start Point"
                icon={<></>}
              />
            </div>
            {/* Custom styling override */}
            <style>{`
               .group:first-child button { 
                 padding-left: 3.5rem !important; 
                 height: 4.5rem !important;
                 border-radius: 1.5rem 1.5rem 0.5rem 0.5rem !important;
                 background: var(--card) !important;
                 border: 1px solid var(--border) !important;
                 box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.02) !important;
               }
             `}</style>
          </div>

          {/* Dotted Connector */}
          <div className="h-6 w-0.5 border-l-2 border-dashed border-border/50 ml-9 -my-1 z-0" />

          {/* TO Card */}
          <div className="group relative z-20">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 z-10 text-destructive pointer-events-none">
              <Target size={20} />
            </div>
            <div className="relative">
              <LocationSelector
                value={to}
                onChange={setTo}
                label=""
                placeholder="Destination"
                excludeId={from}
                icon={<></>}
              />
            </div>
            <style>{`
               .group:last-child button { 
                 padding-left: 3.5rem !important; 
                 height: 4.5rem !important;
                 border-radius: 0.5rem 0.5rem 1.5rem 1.5rem !important;
                 background: var(--card) !important;
                 border: 1px solid var(--border) !important;
                 box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.05) !important;
               }
             `}</style>
          </div>
        </div>

        {/* Action Button - Only visible when ready */}
        <div className={`transition-all duration-500 ease-out transform ${from && to ? 'opacity-100 translate-y-0' : 'opacity-40 translate-y-2 grayscale'}`}>
          <Button
            onClick={handleShowRoute}
            disabled={!from || !to}
            className="w-full h-16 text-lg font-bold rounded-2xl shadow-xl shadow-primary/25 hover:shadow-primary/40 transition-all hover:scale-[1.02] active:scale-[0.98] bg-primary text-primary-foreground gap-2"
            size="lg"
          >
            Start Navigation
            <ArrowRight className="w-5 h-5" />
          </Button>
        </div>

        {/* Quick Access */}
        <div className="pt-4 animate-in fade-in slide-in-from-bottom-12 duration-700 delay-200">
          <p className="text-xs font-bold text-muted-foreground mb-4 uppercase tracking-wider pl-1">Quick Access</p>
          <div className="grid grid-cols-2 gap-3">
            <QuickCard icon="☕" label="Cafeteria" onClick={() => quickSelect('cafe')} />
            <QuickCard icon="🚻" label="Restroom" onClick={() => quickSelect('utility')} />
            <QuickCard icon="🚪" label="Exit" onClick={() => quickSelect('entry')} />
            <QuickCard icon="💼" label="Office" onClick={() => quickSelect('office')} />
          </div>
        </div>

      </main>

      {/* Bottom Info */}
      <footer className="p-6 pt-0 mt-auto text-center animate-in fade-in duration-1000 delay-500">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-secondary/50 text-[10px] font-medium text-muted-foreground border border-border/50 backdrop-blur-sm">
          <Info size={12} />
          <span>Offline Capable • No GPS Needed</span>
        </div>
      </footer>
    </div>
  );
}; // End of Index

const QuickCard = ({ icon, label, onClick }: { icon: string, label: string, onClick: () => void }) => (
  <button
    onClick={onClick}
    className="flex items-center gap-3 p-4 rounded-2xl bg-card border border-border/60 shadow-sm hover:shadow-md hover:border-primary/30 transition-all active:scale-95 text-left group"
  >
    <span className="text-2xl group-hover:scale-110 transition-transform duration-300 filter grayscale-[0.2] group-hover:grayscale-0">{icon}</span>
    <span className="font-semibold text-sm text-foreground/80 group-hover:text-primary transition-colors">{label}</span>
  </button>
);

export default Index;
