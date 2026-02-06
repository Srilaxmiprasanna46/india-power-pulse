import { Zap, Leaf, IndianRupee } from "lucide-react";
import { Button } from "@/components/ui/button";

interface MetricToggleProps {
  metricMode: string;
  onChange: (mode: string) => void;
}

const MetricToggle = ({ metricMode, onChange }: MetricToggleProps) => (
  <div className="flex items-center gap-1 bg-secondary/50 rounded-lg p-1">
    <Button
      variant={metricMode === 'energy' ? 'default' : 'ghost'}
      size="sm"
      onClick={() => onChange('energy')}
      className="gap-1 h-7 text-xs"
    >
      <Zap className="w-3 h-3" /> Energy
    </Button>
    <Button
      variant={metricMode === 'carbon' ? 'default' : 'ghost'}
      size="sm"
      onClick={() => onChange('carbon')}
      className="gap-1 h-7 text-xs"
    >
      <Leaf className="w-3 h-3" /> CO₂
    </Button>
    <Button
      variant={metricMode === 'cost' ? 'default' : 'ghost'}
      size="sm"
      onClick={() => onChange('cost')}
      className="gap-1 h-7 text-xs"
    >
      <IndianRupee className="w-3 h-3" /> Cost
    </Button>
  </div>
);

export default MetricToggle;
