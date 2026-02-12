import React, { useState, useEffect, useMemo, useCallback } from "react";
import {
  Navigation,
  AlertCircle,
  Loader2,
  MapPin,
  Target,
  ChevronRight,
  Clock
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

const Index = () => {
  const { t } = useLanguage();
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [searchTriggered, setSearchTriggered] = useState(false);
  const [activeRoute, setActiveRoute] = useState<RouteWithSteps | null>(null);
  const [error, setError] = useState("");

  const { edges, floors } = useNavigationContext();
  const { data: allLocations } = useLocations();

  /* REMOVED: useFindRoute hook usage to fix "Start Navigation" button issues */

  /* Direct Imperative Route Finding - Fixes Lag & State Issues */
  const handleShowRoute = () => {
    setError("");
    if (!from || !to) {
      setError(t('select_start_dest_error') || "Please select both a starting point and destination.");
      return;
    }
    if (from === to) {
      setError(t('same_location_error') || "You're already there! Pick a different destination.");
      return;
    }

    try {
      console.log("Starting route calculation...", { from, to });
      // Calculate route immediately
      const graphResult = findGraphRoute(from, to, allLocations, edges);
      console.log("Graph result:", graphResult);

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

        console.log("Setting active route:", route);
        setActiveRoute(route);

        // Background stat recording
        // setTimeout(() => recordNavigation(true, to), 100);
      } else {
        setError(t('no_route_error') || "No route found between these locations.");
        recordNavigation(false);
      }

    } catch (err) {
      console.error("Route calculation error:", err);
      setError("An error occurred while calculating the route.");
    }
  };



  const handleRestart = useCallback(() => {
    setActiveRoute(null);
    setFrom("");
    setTo("");
    setError("");
    setSearchTriggered(false);
  }, []);

  const handleLost = useCallback(() => {
    setActiveRoute(null);
    setFrom("");
    setSearchTriggered(false);
    setError("Please re-select your current location to update the route.");
  }, []);

  if (activeRoute) {
    return <StepView route={activeRoute} onRestart={handleRestart} onLost={handleLost} />;
  }

  return (
    <div className="min-h-dvh flex flex-col bg-background">
      {/* Header */}
      <header className="px-6 pt-10 pb-6">
        <div className="flex items-center gap-4 mb-2">
          <div className="w-12 h-12 rounded-2xl bg-primary flex items-center justify-center shadow-lg shadow-primary/25">
            <Navigation size={24} className="text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground tracking-tight">WayFinder</h1>
            <p className="text-sm text-muted-foreground font-medium">Indoor Navigation</p>
          </div>
          <div className="ml-auto">
            <LanguageSwitcher />
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 px-6 pb-8 flex flex-col gap-6">
        <div className="space-y-6">
          <div className="space-y-1">
            <h2 className="text-2xl font-bold text-foreground">
              {t('where_to')}
            </h2>
            <p className="text-muted-foreground">
              {t('select_path_msg')}
            </p>
          </div>

          <div className="space-y-4">
            <div className="relative">
              <LocationSelector
                value={from}
                onChange={(v) => { setFrom(v); setError(""); setSearchTriggered(false); }}
                label={t('start_point')}
                placeholder={t('select_start')}
                icon={<MapPin size={24} />}
              />

              {/* Connector Line visual */}
              <div className="absolute left-[2.2rem] top-[4.5rem] bottom-[-1rem] w-0.5 border-l-2 border-dashed border-border/60 -z-10" />
            </div>

            <LocationSelector
              value={to}
              onChange={(v) => { setTo(v); setError(""); setSearchTriggered(false); }}
              label={t('destination')}
              placeholder={t('select_destination')}
              excludeId={from}
              icon={<Target size={24} />}
            />
          </div>

          {error && (
            <div className="flex items-start gap-3 text-destructive bg-destructive/5 border border-destructive/20 px-4 py-4 rounded-xl text-sm animate-in fade-in slide-in-from-bottom-2">
              <AlertCircle size={18} className="mt-0.5 shrink-0" />
              <span className="font-medium">{error}</span>
            </div>
          )}

          <Button
            onClick={handleShowRoute}
            disabled={!from || !to}
            className="w-full h-16 text-lg font-bold rounded-2xl gap-3 shadow-xl transition-all active:scale-[0.98]"
            size="lg"
          >
            <Navigation size={24} className="fill-current" />
            {t('start_navigation')}
          </Button>


        </div>

        {/* Info section */}
        <div className="mt-auto pt-6 border-t border-border/50">
          <div className="flex gap-4 overflow-x-auto pb-2 no-scrollbar snap-x">
            <InfoCard icon="🏢" text="Works offline & locally" />
            <InfoCard icon="📍" text="No GPS needed" />
          </div>
        </div>
      </main>
    </div>
  );
};

// Helper Components
const InfoCard = ({ icon, text }: { icon: string, text: string }) => (
  <div className="flex items-center gap-3 p-3 rounded-xl bg-muted/50 text-muted-foreground whitespace-nowrap snap-center shrink-0">
    <span className="text-lg">{icon}</span>
    <span className="text-sm font-medium">{text}</span>
  </div>
);

export default Index;
