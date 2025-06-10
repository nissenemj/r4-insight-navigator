
export interface SotkanetIndicator {
  indicator: number;
  title: string;
  organization: string;
  description?: string;
}

export interface SotkanetDataPoint {
  indicator: number;
  year: number;
  region: string;
  value: number;
  gender: string;
  absolute_value?: number; // Changed from absoluteValue to absolute_value to match API
  region_title?: string;   // Added to match API response
  indicator_title?: string; // Added to match API response
}

export interface SotkanetRegion {
  code: string;
  title: string;
  category: string;
}

export interface ProcessedMetric {
  value: number;
  target: number;
  trend: 'up' | 'down';
  unit?: string;
  name: string;
}

export interface ProcessedMetricsSet {
  [key: string]: ProcessedMetric;
}
