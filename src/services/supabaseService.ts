import { supabase } from '@/integrations/supabase/client';

export interface HealthMetric {
  id: string;
  indicator_id: string;
  region_code: string;
  year: number;
  value: number;
  absolute_value: number;
  gender: string;
  data_source: string;
  last_updated: string;
  created_at: string;
}

export interface Indicator {
  id: string;
  sotkanet_id: number;
  title: string;
  description?: string;
  organization?: string;
  unit?: string;
  area_category?: string;
  created_at: string;
  updated_at: string;
}

export interface Region {
  id: string;
  code: string;
  name: string;
  category?: string;
  created_at: string;
  updated_at: string;
}

export interface TargetValue {
  id: string;
  indicator_id: string;
  region_code: string;
  target_value: number;
  target_year: number;
  created_at: string;
}

export interface MetricData {
  value: number;
  target: number;
  trend: 'up' | 'down';
  unit: string;
  name: string;
  lastUpdated: string;
}

export interface TrendDataPoint {
  year: number;
  month?: string;
  current: number;
  target: number;
  costs: number;
  dataType: 'yearly' | 'monthly';
}

class SupabaseService {
  // Trigger data sync via Edge Function
  async syncAllData(regionCode: string = '974', year?: number): Promise<any> {
    try {
      console.log(`🔄 Syncing all health data for region: ${regionCode}`);
      
      const currentYear = year || new Date().getFullYear();
      
      const { data, error } = await supabase.functions.invoke('sotkanet-api', {
        body: {
          region: regionCode,
          year: currentYear.toString()
        }
      });

      if (error) {
        console.error('Sync error:', error);
        throw error;
      }

      console.log('✅ Data sync completed:', data);
      return data;
    } catch (error) {
      console.error('Error in syncAllData:', error);
      throw error;
    }
  }

  // Get health metrics with indicators and targets
  async getHealthMetrics(areaCategory: string, regionCode: string = '974'): Promise<Record<string, MetricData>> {
    try {
      console.log(`🔍 Fetching health metrics for area: ${areaCategory}, region: ${regionCode}`);
      
      const { data: indicators, error: indicatorsError } = await supabase
        .from('indicators')
        .select('*')
        .eq('area_category', areaCategory);

      if (indicatorsError) {
        console.error('Error fetching indicators:', indicatorsError);
        throw indicatorsError;
      }

      if (!indicators || indicators.length === 0) {
        console.log(`No indicators found for area category: ${areaCategory}`);
        return this.getFallbackMetricsData(areaCategory);
      }

      const results: Record<string, MetricData> = {};
      const currentYear = new Date().getFullYear();

      for (const indicator of indicators) {
        try {
          // Get latest metric data (try multiple years)
          const { data: metrics, error: metricsError } = await supabase
            .from('health_metrics')
            .select('*')
            .eq('indicator_id', indicator.id)
            .eq('region_code', regionCode)
            .gte('year', currentYear - 3)
            .order('year', { ascending: false })
            .order('last_updated', { ascending: false })
            .limit(1);

          // Get target value
          const { data: targets, error: targetsError } = await supabase
            .from('target_values')
            .select('*')
            .eq('indicator_id', indicator.id)
            .eq('region_code', regionCode)
            .eq('target_year', currentYear)
            .limit(1);

          if (metricsError) {
            console.error(`Error fetching metrics for indicator ${indicator.id}:`, metricsError);
          }
          
          if (targetsError) {
            console.error(`Error fetching targets for indicator ${indicator.id}:`, targetsError);
          }

          const metric = metrics?.[0];
          const target = targets?.[0];

          if (metric || target) {
            const key = this.getIndicatorKey(indicator.sotkanet_id);
            const value = metric?.absolute_value || metric?.value || this.getDefaultValue(indicator.sotkanet_id);
            const targetValue = target?.target_value || this.getDefaultTarget(indicator.sotkanet_id);
            
            results[key] = {
              value: value,
              target: targetValue,
              trend: this.calculateTrend(value, targetValue),
              unit: indicator.unit || this.getDefaultUnit(indicator.sotkanet_id),
              name: key,
              lastUpdated: metric?.last_updated || new Date().toISOString()
            };
            
            console.log(`✅ Loaded metric ${key}: ${value} (target: ${targetValue})`);
          }
        } catch (error) {
          console.error(`Error processing indicator ${indicator.id}:`, error);
        }
      }

      console.log(`✅ Retrieved metrics for ${Object.keys(results).length} indicators`);
      
      // If no real data found, return fallback data
      if (Object.keys(results).length === 0) {
        console.log('⚠️ No metrics found, returning fallback data');
        return this.getFallbackMetricsData(areaCategory);
      }
      
      return results;
    } catch (error) {
      console.error('Error in getHealthMetrics:', error);
      // Return fallback data in case of error
      return this.getFallbackMetricsData(areaCategory);
    }
  }

  // Fetch data from Sotkanet via Edge Function
  async fetchSotkanetData(indicatorIds: number[], regionCode: string = '974') {
    try {
      console.log(`📡 Calling Sotkanet Edge Function for indicators: ${indicatorIds.join(', ')}`);
      
      const { data, error } = await supabase.functions.invoke('sotkanet-api', {
        body: {
          path: '/multiple',
          params: {
            indicators: indicatorIds.join(','),
            region: regionCode,
            year: new Date().getFullYear().toString()
          }
        }
      });

      if (error) {
        console.error('Edge function error:', error);
        throw error;
      }

      console.log('✅ Sotkanet data received via Edge Function');
      return data;
    } catch (error) {
      console.error('Error calling Sotkanet Edge Function:', error);
      throw error;
    }
  }

  // Get trend data - check what's available and use real data
  async getTrendData(areaCategory: string, regionCode: string = '974'): Promise<TrendDataPoint[]> {
    try {
      console.log(`📈 Fetching trend data for area: ${areaCategory}, region: ${regionCode}`);
      
      const { data: indicators, error } = await supabase
        .from('indicators')
        .select('*')
        .eq('area_category', areaCategory);

      if (error || !indicators || indicators.length === 0) {
        console.log('No indicators found, using fallback yearly data');
        return this.getFallbackYearlyTrendData();
      }

      const indicator = indicators[0];
      console.log(`Using indicator ${indicator.title} for trend analysis`);
      
      // Fetch multiple years of data
      const currentYear = new Date().getFullYear();
      const yearsToFetch = [currentYear - 4, currentYear - 3, currentYear - 2, currentYear - 1, currentYear];
      
      const { data: metrics, error: metricsError } = await supabase
        .from('health_metrics')
        .select('*')
        .eq('indicator_id', indicator.id)
        .eq('region_code', regionCode)
        .in('year', yearsToFetch)
        .order('year', { ascending: true });

      if (metricsError) {
        console.error('Error fetching metrics:', metricsError);
        return this.getFallbackYearlyTrendData();
      }

      console.log(`Found ${metrics?.length || 0} yearly data points`);

      if (!metrics || metrics.length === 0) {
        console.log('No yearly metrics found, using fallback data');
        return this.getFallbackYearlyTrendData();
      }

      // Check if we have enough data for a real trend
      if (metrics.length >= 3) {
        console.log('✅ Using real yearly data for trends');
        return this.processYearlyTrendData(metrics, indicator);
      } else {
        console.log('⚠️ Not enough yearly data, using fallback');
        return this.getFallbackYearlyTrendData();
      }
    } catch (error) {
      console.error('Error getting trend data:', error);
      return this.getFallbackYearlyTrendData();
    }
  }

  // Process real yearly data into trend format
  private processYearlyTrendData(metrics: any[], indicator: Indicator): TrendDataPoint[] {
    console.log('Processing real yearly trend data:', metrics);
    
    return metrics.map(metric => {
      const value = metric.absolute_value || metric.value;
      const targetValue = this.getDefaultTarget(indicator.sotkanet_id);
      
      return {
        year: metric.year,
        current: value,
        target: targetValue,
        costs: Math.round(value * 150), // Estimated cost calculation
        dataType: 'yearly' as const
      };
    });
  }

  // Fallback yearly trend data when no real data available
  private getFallbackYearlyTrendData(): TrendDataPoint[] {
    const currentYear = new Date().getFullYear();
    const years = [currentYear - 4, currentYear - 3, currentYear - 2, currentYear - 1, currentYear];
    const baseValue = 1000;

    console.log('📋 Creating fallback yearly trend data');
    
    return years.map((year, index) => {
      const yearlyVariation = (Math.random() - 0.5) * (baseValue * 0.2);
      const trend = baseValue + (index * 50) + yearlyVariation; // Slight upward trend
      
      return {
        year,
        current: Math.round(trend),
        target: baseValue,
        costs: Math.round(trend * 150),
        dataType: 'yearly' as const
      };
    });
  }

  // Helper methods - päivitetty uusilla indikaattoreilla
  private getIndicatorKey(sotkanetId: number): string {
    const mapping: { [key: number]: string } = {
      // Avoterveydenhuolto
      3176: 'hoitotakuu_3kk',
      2676: 'hoitotakuu_7pv',
      1552: 'kayntimaara_kaikki',
      4123: 'kayntimaara_avosairaanhoito',
      5549: 'digipalvelut_asioinut',
      5534: 'digipalvelut_korvasi',
      5543: 'digipalvelut_esteet',
      // Leikkaustoiminta
      5083: 'odotusaika_mediaani',
      2989: 'hoitojakso_pituus',
      3336: 'odotusaika_yli6kk',
      3000: 'hoitopaivat_18_64',
      // Päivystys
      5081: 'paivystys_perusterveydenhuolto',
      5077: 'paivystys_erikoissairaanhoito',
      5104: 'palanneet_48h_aikuiset',
      5244: 'palanneet_48h_lapset'
    };
    return mapping[sotkanetId] || `indicator_${sotkanetId}`;
  }

  private getDefaultValue(sotkanetId: number): number {
    const defaults: { [key: number]: number } = {
      // Avoterveydenhuolto
      3176: 8.5, 2676: 12.3, 1552: 2947, 4123: 2156,
      5549: 67.3, 5534: 68.9, 5543: 23.7,
      // Leikkaustoiminta
      5083: 67.2, 2989: 8.5, 3336: 62.1, 3000: 187,
      // Päivystys
      5081: 427, 5077: 465, 5104: 6.8, 5244: 5.2
    };
    return defaults[sotkanetId] || 100;
  }

  private getDefaultTarget(sotkanetId: number): number {
    const targets: { [key: number]: number } = {
      // Avoterveydenhuolto
      3176: 5, 2676: 7, 1552: 3000, 4123: 2800,
      5549: 80, 5534: 75, 5543: 15,
      // Leikkaustoiminta  
      5083: 60, 2989: 7, 3336: 50, 3000: 200,
      // Päivystys
      5081: 400, 5077: 400, 5104: 8, 5244: 8
    };
    return targets[sotkanetId] || 100;
  }

  private getDefaultUnit(sotkanetId: number): string {
    const units: { [key: number]: string } = {
      // Avoterveydenhuolto
      3176: '%', 2676: '%', 1552: '/1000', 4123: '/1000',
      5549: '%', 5534: '%', 5543: '%',
      // Leikkaustoiminta
      5083: 'päivää', 2989: 'päivää', 3336: '/10000', 3000: '/1000',
      // Päivystys
      5081: '/1000', 5077: '/1000', 5104: '%', 5244: '%'
    };
    return units[sotkanetId] || '%';
  }

  private getFallbackMetricsData(areaCategory: string): Record<string, MetricData> {
    const fallbackData: Record<string, Record<string, MetricData>> = {
      avoterveydenhuolto: {
        hoitotakuu_3kk: { value: 8.5, target: 5, trend: 'down', unit: '%', name: 'hoitotakuu_3kk', lastUpdated: new Date().toISOString() },
        hoitotakuu_7pv: { value: 12.3, target: 7, trend: 'down', unit: '%', name: 'hoitotakuu_7pv', lastUpdated: new Date().toISOString() },
        kayntimaara_kaikki: { value: 2947, target: 3000, trend: 'down', unit: '/1000', name: 'kayntimaara_kaikki', lastUpdated: new Date().toISOString() },
        kayntimaara_avosairaanhoito: { value: 2156, target: 2800, trend: 'down', unit: '/1000', name: 'kayntimaara_avosairaanhoito', lastUpdated: new Date().toISOString() },
        digipalvelut_asioinut: { value: 67.3, target: 80, trend: 'down', unit: '%', name: 'digipalvelut_asioinut', lastUpdated: new Date().toISOString() },
        digipalvelut_korvasi: { value: 68.9, target: 75, trend: 'down', unit: '%', name: 'digipalvelut_korvasi', lastUpdated: new Date().toISOString() },
        digipalvelut_esteet: { value: 23.7, target: 15, trend: 'down', unit: '%', name: 'digipalvelut_esteet', lastUpdated: new Date().toISOString() }
      },
      leikkaustoiminta: {
        odotusaika_mediaani: { value: 67.2, target: 60, trend: 'down', unit: 'päivää', name: 'odotusaika_mediaani', lastUpdated: new Date().toISOString() },
        hoitojakso_pituus: { value: 8.5, target: 7, trend: 'down', unit: 'päivää', name: 'hoitojakso_pituus', lastUpdated: new Date().toISOString() },
        odotusaika_yli6kk: { value: 62.1, target: 50, trend: 'down', unit: '/10000', name: 'odotusaika_yli6kk', lastUpdated: new Date().toISOString() },
        hoitopaivat_18_64: { value: 187, target: 200, trend: 'down', unit: '/1000', name: 'hoitopaivat_18_64', lastUpdated: new Date().toISOString() }
      },
      paivystys: {
        paivystys_perusterveydenhuolto: { value: 427, target: 400, trend: 'up', unit: '/1000', name: 'paivystys_perusterveydenhuolto', lastUpdated: new Date().toISOString() },
        paivystys_erikoissairaanhoito: { value: 465, target: 400, trend: 'up', unit: '/1000', name: 'paivystys_erikoissairaanhoito', lastUpdated: new Date().toISOString() },
        palanneet_48h_aikuiset: { value: 6.8, target: 8, trend: 'up', unit: '%', name: 'palanneet_48h_aikuiset', lastUpdated: new Date().toISOString() },
        palanneet_48h_lapset: { value: 5.2, target: 8, trend: 'up', unit: '%', name: 'palanneet_48h_lapset', lastUpdated: new Date().toISOString() }
      },
      tutkimus: {
        hankkeet: { value: 23, target: 25, trend: 'down', unit: 'kpl', name: 'hankkeet', lastUpdated: new Date().toISOString() },
        palaute: { value: 4.2, target: 4.5, trend: 'down', unit: '/5', name: 'palaute', lastUpdated: new Date().toISOString() },
        julkaisut: { value: 18, target: 20, trend: 'down', unit: 'kpl', name: 'julkaisut', lastUpdated: new Date().toISOString() }
      }
    };

    return fallbackData[areaCategory] || {};
  }

  private calculateTrend(value: number, target: number): 'up' | 'down' {
    return value >= target ? 'up' : 'down';
  }
}

export const supabaseService = new SupabaseService();
