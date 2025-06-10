
import { useQuery } from '@tanstack/react-query';
import { sotkanetService, INDICATORS } from '@/services/sotkanetService';
import { ProcessedMetricsSet, ProcessedMetric } from '@/types/sotkanet';

// Simuloidut tavoitearvot (koska Sotkanetista ei saa tavoitteita)
const TARGETS = {
  avoterveydenhuolto: {
    hoitotakuu: 95,
    kayntimaara: 3000,
    digipalvelut: 80,
  },
  leikkaustoiminta: {
    jonotusaika: 30,
    leikkaukset: 180,
    peruutukset: 5,
  },
  paivystys: {
    odotusaika: 20,
    kayntimaara: 800,
    uudelleenkaynnit: 10,
  },
  tutkimus: {
    hankkeet: 25,
    palaute: 4.0,
    julkaisut: 20,
  }
};

const UNITS = {
  hoitotakuu: '%',
  kayntimaara: '/1000 as.',
  digipalvelut: '%',
  jonotusaika: 'päivää',
  leikkaukset: 'kpl/kk',
  peruutukset: '%',
  odotusaika: 'min',
  uudelleenkaynnit: '%',
  hankkeet: 'kpl',
  palaute: '/5',
  julkaisut: 'kpl/v'
};

export const useSotkanetMetrics = (area: string, location: string) => {
  return useQuery({
    queryKey: ['sotkanet-metrics', area, location],
    queryFn: async () => {
      console.log(`Fetching metrics for area: ${area}, location: ${location}`);
      
      const areaIndicators = INDICATORS[area as keyof typeof INDICATORS];
      if (!areaIndicators) {
        throw new Error(`Unknown area: ${area}`);
      }

      const indicatorNumbers = Object.values(areaIndicators);
      const data = await sotkanetService.getMultipleIndicators(indicatorNumbers);
      
      console.log('Sotkanet data received:', data);

      // Prosessoi data komponenttien käyttämään muotoon
      const processedMetrics: ProcessedMetricsSet = {};
      
      Object.entries(areaIndicators).forEach(([key, indicatorNum]) => {
        const dataPoint = data.find(d => d.indicator === indicatorNum);
        const targets = TARGETS[area as keyof typeof TARGETS] as any;
        
        if (dataPoint && targets[key]) {
          // Laske trendi (simuloitu, koska tarvitsisi historiadata)
          const trend = dataPoint.value >= targets[key] ? 'up' : 'down';
          
          processedMetrics[key] = {
            value: dataPoint.value || 0,
            target: targets[key],
            trend: trend as 'up' | 'down',
            unit: UNITS[key as keyof typeof UNITS],
            name: key
          };
        } else {
          // Fallback simuloituun dataan jos API-kutsu epäonnistuu
          const fallbackData = getFallbackData(area, key);
          processedMetrics[key] = fallbackData;
        }
      });

      return processedMetrics;
    },
    staleTime: 5 * 60 * 1000, // 5 minuuttia
    retry: 2,
  });
};

export const useSotkanetTrends = (area: string, location: string) => {
  return useQuery({
    queryKey: ['sotkanet-trends', area, location],
    queryFn: async () => {
      console.log(`Fetching trends for area: ${area}, location: ${location}`);
      
      const areaIndicators = INDICATORS[area as keyof typeof INDICATORS];
      if (!areaIndicators) {
        return [];
      }

      // Hae pääindikaattori trendeille
      const mainIndicator = Object.values(areaIndicators)[0];
      const trendData = await sotkanetService.getComparisonData(mainIndicator, [2020, 2021, 2022, 2023]);
      
      console.log('Trend data received:', trendData);

      // Muodosta kuukausittainen data (simuloitu jakauma vuosidata)
      const months = ['Tam', 'Hel', 'Maa', 'Huh', 'Tou', 'Kes', 'Hei', 'Elo', 'Syy', 'Lok', 'Mar', 'Jou'];
      const latestYear = trendData.find(d => d.year === 2023);
      const baseValue = latestYear?.value || 1000;

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
    },
    staleTime: 10 * 60 * 1000, // 10 minuuttia
    retry: 1,
  });
};

// Fallback-data jos API-kutsu epäonnistuu
function getFallbackData(area: string, key: string): ProcessedMetric {
  const fallbackValues: any = {
    avoterveydenhuolto: {
      hoitotakuu: { value: 91, target: 95, trend: 'up', unit: '%' },
      kayntimaara: { value: 2847, target: 3000, trend: 'up', unit: '/1000 as.' },
      digipalvelut: { value: 73, target: 80, trend: 'up', unit: '%' },
    },
    leikkaustoiminta: {
      jonotusaika: { value: 42, target: 30, trend: 'down', unit: 'päivää' },
      leikkaukset: { value: 156, target: 180, trend: 'up', unit: 'kpl/kk' },
      peruutukset: { value: 8, target: 5, trend: 'down', unit: '%' },
    },
    paivystys: {
      odotusaika: { value: 28, target: 20, trend: 'down', unit: 'min' },
      kayntimaara: { value: 892, target: 800, trend: 'up', unit: '/1000 as.' },
      uudelleenkaynnit: { value: 12, target: 10, trend: 'down', unit: '%' },
    },
    tutkimus: {
      hankkeet: { value: 23, target: 25, trend: 'up', unit: 'kpl' },
      palaute: { value: 4.2, target: 4.0, trend: 'up', unit: '/5' },
      julkaisut: { value: 18, target: 20, trend: 'up', unit: 'kpl/v' },
    }
  };

  return {
    ...fallbackValues[area]?.[key] || { value: 0, target: 100, trend: 'up', unit: '' },
    name: key
  };
}
