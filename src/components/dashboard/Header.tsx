import { Home, Activity, BarChart3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import MetricToggle from "./MetricToggle";
import smartIndiaLogo from "@/assets/smart-india-logo.png";

interface HeaderProps {
  viewMode: string;
  metricMode: string;
  isGenerating: boolean;
  onHome: () => void;
  onGenerate: () => void;
  onAnalyze: () => void;
  onMetricChange: (mode: string) => void;
}

const Header = ({ viewMode, metricMode, isGenerating, onHome, onGenerate, onAnalyze, onMetricChange }: HeaderProps) => (
  <header className="flex items-center justify-between px-4 md:px-6 py-3 border-b border-border bg-card/80 backdrop-blur-md z-50 flex-shrink-0">
    <div className="flex items-center gap-3">
      <img src={smartIndiaLogo} alt="Smart India" className="w-10 h-10 rounded-lg" />
      <div>
        <h1 className="text-lg md:text-xl font-bold text-gradient-primary tracking-tight leading-none">SMART INDIA</h1>
        <p className="text-[10px] text-muted-foreground tracking-wider uppercase">Power Analytics Dashboard</p>
      </div>
    </div>

    <div className="hidden md:block">
      {viewMode !== 'home' && (
        <MetricToggle metricMode={metricMode} onChange={onMetricChange} />
      )}
    </div>

    <div className="flex items-center gap-2">
      <Button variant={viewMode === 'home' ? 'default' : 'outline'} size="sm" onClick={onHome} className="gap-1.5">
        <Home className="w-4 h-4" /> Home
      </Button>
      <Button
        variant={viewMode === 'generated' ? 'default' : 'outline'}
        size="sm"
        onClick={onGenerate}
        disabled={isGenerating}
        className="gap-1.5"
      >
        <Activity className={`w-4 h-4 ${isGenerating ? 'animate-pulse' : ''}`} />
        {isGenerating ? 'Generating...' : 'Generate'}
      </Button>
      <Button
        variant={viewMode === 'analyze' ? 'default' : 'outline'}
        size="sm"
        onClick={onAnalyze}
        disabled={viewMode === 'home'}
        className="gap-1.5"
      >
        <BarChart3 className="w-4 h-4" /> Analyze
      </Button>
    </div>
  </header>
);

export default Header;
