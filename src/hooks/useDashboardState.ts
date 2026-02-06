import { useState, useCallback } from 'react';
import { GeneratedEnergy, generateAllStatesEnergy } from '@/data/stateData';

export type ViewMode = 'home' | 'generated' | 'analyze';
export type MetricMode = 'energy' | 'carbon' | 'cost';

export const useDashboardState = () => {
  const [viewMode, setViewMode] = useState<ViewMode>('home');
  const [metricMode, setMetricMode] = useState<MetricMode>('energy');
  const [selectedState, setSelectedState] = useState<string | null>(null);
  const [energyData, setEnergyData] = useState<Map<string, GeneratedEnergy>>(new Map());
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerate = useCallback(async () => {
    setIsGenerating(true);
    await new Promise(r => setTimeout(r, 1500));
    const data = generateAllStatesEnergy();
    setEnergyData(data);
    setViewMode('generated');
    setIsGenerating(false);
    setSelectedState(null);
  }, []);

  const handleAnalyze = useCallback(() => {
    if (energyData.size > 0) setViewMode('analyze');
  }, [energyData]);

  const handleHome = useCallback(() => {
    setViewMode('home');
    setSelectedState(null);
    setEnergyData(new Map());
  }, []);

  const handleStateClick = useCallback((stateName: string) => {
    setSelectedState(prev => prev === stateName ? null : stateName);
  }, []);

  return {
    viewMode, metricMode, selectedState, energyData, isGenerating,
    setMetricMode: (mode: string) => setMetricMode(mode as MetricMode),
    handleGenerate, handleAnalyze, handleHome, handleStateClick,
  };
};
