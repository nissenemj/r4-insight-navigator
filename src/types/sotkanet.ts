
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
  absoluteValue?: number;
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
