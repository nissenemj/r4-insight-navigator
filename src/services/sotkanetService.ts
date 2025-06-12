import { SotkanetDataPoint, SotkanetRegion, SotkanetIndicator } from '@/types/sotkanet';

// Backend API URL - Korjattu käyttämään paljastettua URL:ää
const BACKEND_BASE_URL = 'https://3001-ilh4mzv0cqypycdhs9yan-02027ef7.manusvm.computer/api/sotkanet';

// Pohjois-Savon hyvinvointialueen ID
export const PSHVA_REGION_ID = 974;

// Avainmittarit per osa-alue - korjatut indikaattorikoodit
export const INDICATORS = {
  avoterveydenhuolto: {
    hoitotakuu: 2230, // Hoitotakuun toteutuminen perusterveydenhuollossa
    kayntimaara: 1820, // Avosairaanhoidon käynnit / 1000 asukasta
    digipalvelut: 4420, // Sähköisten palvelujen käyttö (%)
  },
  leikkaustoiminta: {
    jonotusaika: 2150, // Leikkaustoiminnan jonotusaika (päivää)
    leikkaukset: 1840, // Toimenpiteet / 1000 asukasta
    peruutukset: 2160, // Peruutettujen leikkausten osuus (%)
  },
  paivystys: {
    odotusaika: 2170, // Päivystyksen odotusaika (min)
    kayntimaara: 1782, // Päivystyskäynnit / 1000 asukasta
    uudelleenkaynnit: 2180, // Uudelleenkäynnit 72h sisällä (%)
  },
  tutkimus: {
    hankkeet: 3200, // Tutkimushankkeiden määrä
    palaute: 3210, // Opiskelijapalaute keskiarvo
    julkaisut: 3220, // Tieteelliset julkaisut / vuosi
  }
};

class SotkanetService {
  private async fetchData<T>(endpoint: string): Promise<T> {
    const url = `${BACKEND_BASE_URL}${endpoint}`;
    console.log(`Haetaan backend-palvelimelta: ${url}`);
    
    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      });
      
      console.log(`Response status: ${response.status}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('Data haettu onnistuneesti backend-palvelimelta:', data);
      return data;
      
    } catch (error) {
      console.error('Backend API error:', error);
      throw error;
    }
  }

  async getRegions(): Promise<SotkanetRegion[]> {
    try {
      return await this.fetchData<SotkanetRegion[]>('/regions');
    } catch (error) {
      console.error('Failed to fetch regions:', error);
      return [];
    }
  }

  async getIndicators(): Promise<SotkanetIndicator[]> {
    try {
      return await this.fetchData<SotkanetIndicator[]>('/indicators');
    } catch (error) {
      console.error('Failed to fetch indicators:', error);
      return [];
    }
  }

  async getIndicatorData(
    indicator: number, 
    regions: string[] = [PSHVA_REGION_ID.toString()], 
    year?: number
  ): Promise<SotkanetDataPoint[]> {
    try {
      const currentYear = year || new Date().getFullYear() - 1;
      const region = regions[0] || PSHVA_REGION_ID;
      
      const endpoint = `/data/${indicator}?region=${region}&year=${currentYear}`;
      console.log(`Indicator data endpoint: ${endpoint}`);
      
      return await this.fetchData<SotkanetDataPoint[]>(endpoint);
    } catch (error) {
      console.error('Failed to fetch indicator data:', error);
      return [];
    }
  }

  async getComparisonData(
    indicator: number, 
    years: number[] = [2022, 2023]
  ): Promise<SotkanetDataPoint[]> {
    try {
      const latestYear = Math.max(...years);
      
      const endpoint = `/data/${indicator}?region=${PSHVA_REGION_ID}&year=${latestYear}`;
      console.log(`Comparison data endpoint: ${endpoint}`);
      
      return await this.fetchData<SotkanetDataPoint[]>(endpoint);
    } catch (error) {
      console.error('Failed to fetch comparison data:', error);
      return [];
    }
  }

  async getMultipleIndicators(
    indicators: number[], 
    region: string = PSHVA_REGION_ID.toString()
  ): Promise<SotkanetDataPoint[]> {
    try {
      const currentYear = new Date().getFullYear() - 1;
      const indicatorsParam = indicators.join(',');
      
      const endpoint = `/multiple?indicators=${indicatorsParam}&region=${region}&year=${currentYear}`;
      console.log(`Multiple indicators endpoint: ${endpoint}`);
      
      const data = await this.fetchData<any>(endpoint);
      
      // Muunna backend-vastaus yhtenäiseksi listaksi
      const result: SotkanetDataPoint[] = [];
      for (const [indicatorId, indicatorData] of Object.entries(data)) {
        if (Array.isArray(indicatorData)) {
          result.push(...indicatorData as SotkanetDataPoint[]);
        }
      }
      
      return result;
    } catch (error) {
      console.error('Failed to fetch multiple indicators:', error);
      return [];
    }
  }

  async getAreaData(area: string, region: string = PSHVA_REGION_ID.toString()): Promise<any> {
    try {
      const currentYear = new Date().getFullYear() - 1;
      
      const endpoint = `/area/${area}?region=${region}&year=${currentYear}`;
      console.log(`Area data endpoint: ${endpoint}`);
      
      return await this.fetchData<any>(endpoint);
    } catch (error) {
      console.error('Failed to fetch area data:', error);
      return null;
    }
  }

  async testIndicator(indicator: number): Promise<any> {
    try {
      const endpoint = `/test/${indicator}`;
      console.log(`Testing indicator ${indicator} with THL Sotkanet...`);
      
      return await this.fetchData<any>(endpoint);
    } catch (error) {
      console.error(`Failed to test indicator ${indicator}:`, error);
      throw error;
    }
  }
}

export const sotkanetService = new SotkanetService();
