import Header from "@/components/dashboard/Header";
import IndiaMap from "@/components/dashboard/IndiaMap";
import KPICards from "@/components/dashboard/KPICards";
import StatePanel from "@/components/dashboard/StatePanel";
import AnalyzeView from "@/components/dashboard/AnalyzeView";
import { useDashboardState } from "@/hooks/useDashboardState";
import { STATES } from "@/data/stateData";
import { Zap, MapPin } from "lucide-react";

const Index = () => {
  const {
    viewMode, metricMode, selectedState, energyData, isGenerating,
    setMetricMode, handleGenerate, handleAnalyze, handleHome, handleStateClick,
  } = useDashboardState();

  const selectedStateInfo = selectedState ? STATES[selectedState] : null;
  const selectedEnergyData = selectedState ? energyData.get(selectedState) : null;

  return (
    <div className="flex flex-col h-screen bg-background overflow-hidden">
      <Header
        viewMode={viewMode}
        metricMode={metricMode}
        isGenerating={isGenerating}
        onHome={handleHome}
        onGenerate={handleGenerate}
        onAnalyze={handleAnalyze}
        onMetricChange={setMetricMode}
      />

      {viewMode !== 'home' && (
        <KPICards energyData={energyData} selectedState={selectedState} metricMode={metricMode} />
      )}

      <div className="flex-1 flex overflow-hidden">
        {viewMode === 'analyze' ? (
          <div className="flex-1 overflow-auto">
            <AnalyzeView energyData={energyData} selectedState={selectedState} metricMode={metricMode} />
          </div>
        ) : (
          <>
            <div className="flex-1 relative flex items-center justify-center">
              {isGenerating && (
                <div className="absolute inset-0 bg-background/80 backdrop-blur-sm z-20 flex items-center justify-center">
                  <div className="text-center space-y-3">
                    <Zap className="w-12 h-12 text-primary animate-pulse mx-auto" />
                    <p className="text-sm text-muted-foreground">Generating energy data for all states...</p>
                  </div>
                </div>
              )}

              {viewMode === 'home' && energyData.size === 0 && (
                <div className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none">
                  <div className="text-center space-y-2 mb-48">
                    <MapPin className="w-8 h-8 text-primary/50 mx-auto" />
                    <p className="text-sm text-muted-foreground">
                      Click <span className="text-primary font-semibold">Generate</span> to simulate energy data
                    </p>
                    <p className="text-xs text-muted-foreground/60">Hover over states to explore the map</p>
                  </div>
                </div>
              )}

              <IndiaMap
                energyData={energyData}
                selectedState={selectedState}
                onStateClick={handleStateClick}
              />

              {energyData.size > 0 && (
                <div className="absolute bottom-4 left-4 bg-card/90 backdrop-blur-sm border border-border rounded-lg p-3 space-y-1">
                  <p className="text-[9px] font-semibold text-muted-foreground uppercase tracking-wider">Renewable %</p>
                  <div className="flex items-center gap-2">
                    {[
                      { label: ">70%", bg: "hsl(145,60%,35%)" },
                      { label: "55-70%", bg: "hsl(145,45%,30%)" },
                      { label: "40-55%", bg: "hsl(80,45%,30%)" },
                      { label: "25-40%", bg: "hsl(50,50%,30%)" },
                      { label: "<25%", bg: "hsl(35,55%,28%)" },
                    ].map(item => (
                      <div key={item.label} className="flex items-center gap-1">
                        <div className="w-3 h-3 rounded-sm" style={{ background: item.bg }} />
                        <span className="text-[8px] text-muted-foreground">{item.label}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {selectedState && selectedStateInfo && selectedEnergyData && (
              <div className="w-[420px] min-w-[380px] overflow-hidden border-l border-border">
                <StatePanel
                  stateName={selectedState}
                  stateInfo={selectedStateInfo}
                  energyData={selectedEnergyData}
                  metricMode={metricMode}
                  onClose={() => handleStateClick(selectedState)}
                />
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Index;
