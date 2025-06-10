import { useQuery } from '@tanstack/react-query';
import { sotkanetService, INDICATORS } from '@/services/sotkanetService';
import { ProcessedMetricsSet, ProcessedMetric } from '@/types/sotkanet';
import { useToast } from '@/hooks/use-toast';

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
  const { toast } = useToast();

  return useQuery({
    queryKey: ['sotkanet-metrics', area, location],
    queryFn: async () => {
      console.log(`Haetaan mittareita alueelle: ${area}, sijainti: ${location}`);
      
      const areaIndicators = INDICATORS[area as keyof typeof INDICATORS];
      if (!areaIndicators) {
        throw new Error(`Tuntematon alue: ${area}`);
      }

      const indicatorNumbers = Object.values(areaIndicators);
      console.log('Haetaan indikaattorit:', indicatorNumbers);
      
      try {
        console.log('Aloitetaan Sotkanet API-kutsu...');
        const data = await sotkanetService.getMultipleIndicators(indicatorNumbers);
        
        console.log('Sotkanet vastaus saatu:', data);

        // Jos data on tyhjä tai virheellinen
        if (!data || data.length === 0) {
          console.log('Ei dataa Sotkanetista, käytetään fallback-dataa');
          toast({
            title: "Tietojen haku epäonnistui",
            description: "Sotkanet API ei palauttanut dataa. Käytetään simuloitua dataa.",
            variant: "destructive",
          });
          return getFallbackMetrics(area);
        }

        // Tarkista että data on oikeassa muodossa
        if (!Array.isArray(data)) {
          console.error('Data ei ole array-muodossa:', typeof data);
          throw new Error('API palautti väärän muotoista dataa');
        }

        // Prosessoi data komponenttien käyttämään muotoon
        const processedMetrics: ProcessedMetricsSet = {};
        
        Object.entries(areaIndicators).forEach(([key, indicatorNum]) => {
          const dataPoint = data.find(d => d.indicator === indicatorNum);
          const targets = TARGETS[area as keyof typeof TARGETS] as any;
          
          console.log(`Prosessoidaan ${key} (indikaattori ${indicatorNum}):`, dataPoint);
          
          if (dataPoint && 
              dataPoint.absolute_value !== null && 
              dataPoint.absolute_value !== undefined && 
              targets[key]) {
            
            const value = dataPoint.absolute_value;
            const target = targets[key];
            const trend = value >= target ? 'up' : 'down';
            
            processedMetrics[key] = {
              value: value,
              target: target,
              trend: trend as 'up' | 'down',
              unit: UNITS[key as keyof typeof UNITS],
              name: key
            };
          } else {
            console.log(`Ei kelvollista dataa kohteelle ${key}, käytetään fallback-dataa`);
            const fallbackData = getFallbackData(area, key);
            processedMetrics[key] = fallbackData;
          }
        });

        console.log('Prosessoidut mittarit:', processedMetrics);
        
        // Näytä onnistumisviesti jos saatiin oikeaa dataa
        const hasRealData = Object.values(processedMetrics).some(metric => 
          data.some(d => d.absolute_value === metric.value)
        );
        
        if (hasRealData) {
          toast({
            title: "Tiedot päivitetty",
            description: "Sotkanet data haettu onnistuneesti.",
          });
        }
        
        return processedMetrics;
      } catch (error) {
        console.error('Virhe Sotkanet datan käsittelyssä:', error);
        toast({
          title: "Virhe tietojen haussa",
          description: `Sotkanet API-virhe: ${error instanceof Error ? error.message : 'Tuntematon virhe'}. Käytetään simuloitua dataa.`,
          variant: "destructive",
        });
        return getFallbackMetrics(area);
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minuuttia
    retry: 1, // Vähennetään retry-määrää
    retryDelay: 2000,
    refetchOnWindowFocus: false,
  });
};

export const useSotkanetTrends = (area: string, location: string) => {
  return useQuery({
    queryKey: ['sotkanet-trends', area, location],
    queryFn: async () => {
      console.log(`Fetching trends for area: ${area}, location: ${location}`);
      
      const areaIndicators = INDICATORS[area as keyof typeof INDICATORS];
      if (!areaIndicators) {
        return getFallbackTrendData();
      }

      try {
        // Hae pääindikaattori trendeille
        const mainIndicator = Object.values(areaIndicators)[0];
        console.log('Fetching trend data for indicator:', mainIndicator);
        
        const trendData = await sotkanetService.getComparisonData(mainIndicator, [2020, 2021, 2022, 2023]);
        
        console.log('Trend data received:', trendData);

        // Jos ei saada dataa, käytä fallback-dataa
        if (!trendData || trendData.length === 0) {
          console.log('No trend data received, using fallback');
          return getFallbackTrendData();
        }

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
      } catch (error) {
        console.error('Error fetching trend data:', error);
        return getFallbackTrendData();
      }
    },
    staleTime: 15 * 60 * 1000, // 15 minuuttia
    retry: 1,
    refetchOnWindowFocus: false,
  });
};

// Fallback-data koko osa-alueelle
function getFallbackMetrics(area: string): ProcessedMetricsSet {
  const fallbackData = getFallbackData(area, '');
  const areaKeys = Object.keys(TARGETS[area as keyof typeof TARGETS] || {});
  
  const metrics: ProcessedMetricsSet = {};
  areaKeys.forEach(key => {
    metrics[key] = getFallbackData(area, key);
  });
  
  return metrics;
}

// Fallback-data yksittäiselle mittarille
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

// Fallback trendidata
function getFallbackTrendData() {
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
