import { useState, memo } from "react";
import { ComposableMap, Geographies, Geography } from "react-simple-maps";
import { GeneratedEnergy, STATES, normalizeStateName } from "@/data/stateData";

const INDIA_GEO = "/india-topo.json";

interface IndiaMapProps {
  energyData: Map<string, GeneratedEnergy>;
  selectedState: string | null;
  onStateClick: (stateName: string) => void;
}

const getStateColor = (
  stateName: string,
  energyData: Map<string, GeneratedEnergy>,
  isSelected: boolean,
  isHovered: boolean
): string => {
  if (isSelected) return "hsl(185, 80%, 50%)";
  if (isHovered) return "hsl(185, 60%, 40%)";

  const data = energyData.get(stateName);
  if (!data) return "hsl(222, 15%, 20%)";

  const pct = data.renewablePercent;
  if (pct > 70) return "hsl(145, 60%, 35%)";
  if (pct > 55) return "hsl(145, 45%, 30%)";
  if (pct > 40) return "hsl(80, 45%, 30%)";
  if (pct > 25) return "hsl(50, 50%, 30%)";
  return "hsl(35, 55%, 28%)";
};

const IndiaMap = memo(({ energyData, selectedState, onStateClick }: IndiaMapProps) => {
  const [hoveredState, setHoveredState] = useState<string | null>(null);
  const [tooltipData, setTooltipData] = useState<{ name: string; icon: string; data?: GeneratedEnergy } | null>(null);

  return (
    <div className="relative w-full h-full flex items-center justify-center">
      {tooltipData && (
        <div className="absolute top-4 left-4 z-10 bg-card/95 backdrop-blur-md border border-border rounded-lg p-3 min-w-[200px] animate-fade-in">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-lg">{tooltipData.icon}</span>
            <span className="font-semibold text-foreground text-sm">{tooltipData.name}</span>
          </div>
          {tooltipData.data ? (
            <div className="space-y-1 text-xs text-muted-foreground">
              <div>Renewable: <span className="text-renewable font-mono font-semibold">{tooltipData.data.renewablePercent}%</span></div>
              <div>Demand: <span className="text-primary font-mono">{tooltipData.data.totalDemand.toLocaleString()} MW</span></div>
              <div>Dominant: <span className="text-solar font-mono">{tooltipData.data.dominantSource}</span></div>
            </div>
          ) : (
            <p className="text-xs text-muted-foreground">Click Generate for data</p>
          )}
        </div>
      )}

      <ComposableMap
        projection="geoMercator"
        projectionConfig={{ scale: 1000, center: [80, 22] }}
        width={600}
        height={680}
        style={{ width: "100%", height: "100%", maxHeight: "calc(100vh - 200px)" }}
      >
        <Geographies geography={INDIA_GEO}>
          {({ geographies }) =>
            geographies.map((geo) => {
              const rawName = geo.properties?.ST_NM || geo.properties?.NAME_1 || geo.properties?.name || geo.properties?.NAME || "";
              const stateName = normalizeStateName(rawName);
              const stateInfo = STATES[stateName];
              const isSelected = selectedState === stateName;
              const isHovered = hoveredState === stateName;

              return (
                <Geography
                  key={geo.rsmKey}
                  geography={geo}
                  onClick={() => {
                    if (stateInfo) onStateClick(stateName);
                  }}
                  onMouseEnter={() => {
                    setHoveredState(stateName);
                    if (stateInfo) {
                      setTooltipData({
                        name: stateName,
                        icon: stateInfo.icon,
                        data: energyData.get(stateName),
                      });
                    }
                  }}
                  onMouseLeave={() => {
                    setHoveredState(null);
                    setTooltipData(null);
                  }}
                  style={{
                    default: {
                      fill: getStateColor(stateName, energyData, isSelected, false),
                      stroke: isSelected ? "hsl(185, 80%, 60%)" : "hsl(222, 15%, 30%)",
                      strokeWidth: isSelected ? 1.5 : 0.5,
                      outline: "none",
                      transition: "fill 0.3s ease, stroke 0.3s ease",
                    },
                    hover: {
                      fill: getStateColor(stateName, energyData, isSelected, true),
                      stroke: "hsl(185, 80%, 50%)",
                      strokeWidth: 1,
                      outline: "none",
                      cursor: stateInfo ? "pointer" : "default",
                    },
                    pressed: {
                      fill: "hsl(185, 80%, 45%)",
                      outline: "none",
                    },
                  }}
                />
              );
            })
          }
        </Geographies>
      </ComposableMap>
    </div>
  );
});

IndiaMap.displayName = "IndiaMap";
export default IndiaMap;
