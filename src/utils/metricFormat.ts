/**
 * Shared metric formatting utilities for the dashboard.
 * Converts MW values to carbon emissions (t CO₂) or cost (₹ Cr) based on mode.
 */

export type MetricMode = 'energy' | 'carbon' | 'cost';

const CARBON_FACTOR = 0.82; // t CO₂ per MWh (grid average)
const COST_FACTOR = 4.5;    // ₹ per kWh (average)

export function formatMetric(mw: number, metricMode: MetricMode | string): string {
  if (!mw || isNaN(mw)) return metricMode === 'cost' ? '₹0' : '0';
  
  if (metricMode === 'carbon') {
    const tons = mw * CARBON_FACTOR * 24 / 1000;
    return tons > 999 ? `${(tons / 1000).toFixed(1)}K t CO₂` : `${tons.toFixed(0)} t CO₂`;
  }
  if (metricMode === 'cost') {
    const cr = mw * COST_FACTOR * 24 / 100000;
    return cr > 999 ? `₹${(cr / 1000).toFixed(1)}K Cr` : `₹${cr.toFixed(1)} Cr`;
  }
  if (mw > 99999) return `${(mw / 1000).toFixed(1)}K MW`;
  return `${mw.toLocaleString()} MW`;
}

export function convertToMetric(mw: number, metricMode: MetricMode | string): number {
  if (!mw || isNaN(mw)) return 0;
  if (metricMode === 'carbon') return Math.round(mw * CARBON_FACTOR * 24 / 1000);
  if (metricMode === 'cost') return +(mw * COST_FACTOR * 24 / 100000).toFixed(2);
  return mw;
}

export function getMetricUnit(metricMode: MetricMode | string): string {
  if (metricMode === 'carbon') return 't CO₂/day';
  if (metricMode === 'cost') return '₹ Cr/day';
  return 'MW';
}

export function getMetricLabel(metricMode: MetricMode | string): string {
  if (metricMode === 'carbon') return 'Carbon Emissions';
  if (metricMode === 'cost') return 'Financial Cost';
  return 'Energy';
}
