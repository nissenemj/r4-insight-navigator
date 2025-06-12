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
  month: string;
  current: number;
  target: number;
  costs: number;
}

class SupabaseService {
  // Trigger data sync via Edge Function
  async syncAllData(regionCode: string = '974', year?: number): Promise<any> {
    try {
      console.log(`🔄 Syncing all health data for region: ${regionCode}`);
      
      const currentYear = year || new Date().getFullYear();
      
      const { data, error } = await supabase.functions.invoke('sotkanet-api', {
        body: {
          path: '/sync',
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
        return {};
      }

      const results: Record<string, MetricData> = {};
      const currentYear = new Date().getFullYear();

      for (const indicator of indicators) {
        try {
          // Get latest metric data
          const { data: metrics, error: metricsError } = await supabase
            .from('health_metrics')
            .select('*')
            .eq('indicator_id', indicator.id)
            .eq('region_code', regionCode)
            .gte('year', currentYear - 2)
            .order('year', { ascending: false })
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
            results[key] = {
              value: metric?.absolute_value || metric?.value || 0,
              target: target?.target_value || 100,
              trend: this.calculateTrend(metric?.value || 0, target?.target_value || 100),
              unit: indicator.unit || '',
              name: key,
              lastUpdated: metric?.last_updated || new Date().toISOString()
            };
          }
        } catch (error) {
          console.error(`Error processing indicator ${indicator.id}:`, error);
        }
      }

      console.log(`✅ Retrieved metrics for ${Object.keys(results).length} indicators`);
      return results;
    } catch (error) {
      console.error('Error in getHealthMetrics:', error);
      throw error;
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

  // Get trend data for charts
  async getTrendData(areaCategory: string, regionCode: string = '974'): Promise<TrendDataPoint[]> {
    try {
      const { data: indicators, error } = await supabase
        .from('indicators')
        .select('*')
        .eq('area_category', areaCategory)
        .limit(1);

      if (error || !indicators || indicators.length === 0) {
        return this.getFallbackTrendData();
      }

      const indicator = indicators[0];
      const currentYear = new Date().getFullYear();
      
      const { data: metrics } = await supabase
        .from('health_metrics')
        .select('*')
        .eq('indicator_id', indicator.id)
        .eq('region_code', regionCode)
        .gte('year', currentYear - 2)
        .order('year', { ascending: true });

      if (!metrics || metrics.length === 0) {
        return this.getFallbackTrendData();
      }

      // Generate monthly data from yearly metrics
      return this.generateMonthlyTrendData(metrics, indicator);
    } catch (error) {
      console.error('Error getting trend data:', error);
      return this.getFallbackTrendData();
    }
  }

  // Helper methods
  private getIndicatorKey(sotkanetId: number): string {
    const mapping: { [key: number]: string } = {
      2230: 'hoitotakuu',
      1820: 'kayntimaara',
      4420: 'digipalvelut',
      2150: 'jonotusaika',
      1840: 'leikkaukset',
      2160: 'peruutukset',
      2170: 'odotusaika',
      1782: 'kayntimaara',
      2180: 'uudelleenkaynnit'
    };
    return mapping[sotkanetId] || `indicator_${sotkanetId}`;
  }

  private calculateTrend(value: number, target: number): 'up' | 'down' {
    return value >= target ? 'up' : 'down';
  }

  private generateMonthlyTrendData(metrics: any[], indicator: Indicator): TrendDataPoint[] {
    const months = ['Tam', 'Hel', 'Maa', 'Huh', 'Tou', 'Kes', 'Hei', 'Elo', 'Syy', 'Lok', 'Mar', 'Jou'];
    const latestMetric = metrics[metrics.length - 1];
    const baseValue = latestMetric?.absolute_value || latestMetric?.value || 1000;

    return months.map((month, index) => {
      const seasonalVariation = Math.sin((index / 12) * 2 * Math.PI) * (baseValue * 0.1);
      const noise = (Math.random() - 0.5) * (baseValue * 0.05);
      
      return {
        month,
        current: Math.round(baseValue + seasonalVariation + noise),
        target: baseValue,
        costs: Math.round((baseValue + seasonalVariation + noise) * 150),
      };
    });
  }

  private getFallbackTrendData(): TrendDataPoint[] {
    const months = ['Tam', 'Hel', 'Maa', 'Huh', 'Tou', 'Kes', 'Hei', 'Elo', 'Syy', 'Lok', 'Mar', 'Jou'];
    const baseValue = 1000;

    return months.map((month, index) => {
      const seasonalVariation = Math.sin((index / 12) * 2 * Math.PI) * (baseValue * 0.1);
      const noise = (Math.random() - 0.5) * (baseValue * 0.05);
      
      return {
        month,
        current: Math.round(baseValue + seasonalVariation + noise),
        target: baseValue,
        costs: Math.round((baseValue + seasonalVariation + noise) * 150),
      };
    });
  }
}

export const supabaseService = new SupabaseService();
