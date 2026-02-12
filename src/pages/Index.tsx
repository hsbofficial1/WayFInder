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
import { useFindRoute, useLocations, type RouteWithSteps } from "@/hooks/useNavigation";
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

  const { recordNavigation, floors } = useNavigationContext();
  const { data: allLocations } = useLocations();

  const filteredLocations = useMemo(() => {
    return allLocations?.filter(l => {
      if (l.isUnavailable) return false;
      const floor = floors.find(f => f.number === l.floor);
      return !floor?.isUnavailable;
    }) || [];
  }, [allLocations, floors]);

  const { data: foundRoute, isLoading: isSearching } = useFindRoute(
    from,
    to,
    searchTriggered && !!from && !!to && from !== to
  );

  // Transition to navigation view when route is found
  useEffect(() => {
    if (searchTriggered && !isSearching) {
      if (foundRoute) {
        // Atomic update to transition view
        setActiveRoute(foundRoute);
        setSearchTriggered(false);
        // Defer statistics recording slightly to allow render to settle
        const timer = setTimeout(() => {
          recordNavigation(true, to);
        }, 300);
        return () => clearTimeout(timer);
      } else if (foundRoute === null) {
        setError("Sorry, no route found between these locations. Try different points.");
        setSearchTriggered(false);
        recordNavigation(false);
      }
    }
  }, [searchTriggered, isSearching, foundRoute, to, recordNavigation]);

  const handleShowRoute = useCallback(() => {
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
  }, [from, to]);

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
            disabled={!from || !to || isSearching}
            className="w-full h-16 text-lg font-bold rounded-2xl gap-3 shadow-xl transition-all active:scale-[0.98]"
            size="lg"
          >
            {isSearching ? (
              <Loader2 size={24} className="animate-spin" />
            ) : (
              <Navigation size={24} className="fill-current" />
            )}
            {isSearching ? "Finding Route..." : t('start_navigation')}
          </Button>

          {foundRoute?.duration !== undefined && !isSearching && !error && (
            <div className="flex items-center justify-center gap-2 py-3 bg-primary/5 rounded-xl border border-primary/10 animate-in fade-in slide-in-from-top-2">
              <Clock size={16} className="text-primary" />
              <span className="text-sm font-semibold text-primary">
                Estimated Time: {foundRoute.duration >= 60
                  ? `${Math.floor(foundRoute.duration / 60)}m ${foundRoute.duration % 60}s`
                  : `${foundRoute.duration}s`}
              </span>
            </div>
          )}
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
