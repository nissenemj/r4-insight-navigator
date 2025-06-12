
import { SotkanetDataPoint, SotkanetRegion, SotkanetIndicator } from '@/types/sotkanet';

// Backend API URL
const BACKEND_BASE_URL = 'http://localhost:3001/api/sotkanet';

// Pohjois-Savon hyvinvointialueen oikea ID
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
  private async fetchFromBackend<T>(endpoint: string): Promise<T> {
    const url = `${BACKEND_BASE_URL}${endpoint}`;
    console.log(`Fetching real Sotkanet data via backend: ${url}`);
    
    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      });
      
      console.log(`Backend response status: ${response.status}`);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Backend error response:', errorText);
        throw new Error(`Backend HTTP error! status: ${response.status}, message: ${errorText}`);
      }
      
      const data = await response.json();
      console.log(`Real Sotkanet data received via backend:`, {
        endpoint,
        dataType: Array.isArray(data) ? 'array' : typeof data,
        count: Array.isArray(data) ? data.length : 'N/A',
        sample: Array.isArray(data) && data.length > 0 ? data[0] : data
      });
      
      return data;
      
    } catch (error) {
      console.error('Backend fetch error:', error);
      throw error;
    }
  }

  async getRegions(): Promise<SotkanetRegion[]> {
    try {
      console.log('Fetching real regions from THL Sotkanet...');
      return await this.fetchFromBackend<SotkanetRegion[]>('/regions');
    } catch (error) {
      console.error('Failed to fetch regions from Sotkanet:', error);
      throw error;
    }
  }

  async getIndicators(): Promise<SotkanetIndicator[]> {
    try {
      console.log('Fetching real indicators from THL Sotkanet...');
      return await this.fetchFromBackend<SotkanetIndicator[]>('/indicators');
    } catch (error) {
      console.error('Failed to fetch indicators from Sotkanet:', error);
      throw error;
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
      console.log(`Fetching real indicator data from THL Sotkanet: ${endpoint}`);
      
      return await this.fetchFromBackend<SotkanetDataPoint[]>(endpoint);
    } catch (error) {
      console.error(`Failed to fetch indicator ${indicator} data from Sotkanet:`, error);
      throw error;
    }
  }

  async getComparisonData(
    indicator: number, 
    years: number[] = [2022, 2023]
  ): Promise<SotkanetDataPoint[]> {
    try {
      const latestYear = Math.max(...years);
      
      const endpoint = `/data/${indicator}?region=${PSHVA_REGION_ID}&year=${latestYear}`;
      console.log(`Fetching real comparison data from THL Sotkanet: ${endpoint}`);
      
      return await this.fetchFromBackend<SotkanetDataPoint[]>(endpoint);
    } catch (error) {
      console.error(`Failed to fetch comparison data for indicator ${indicator}:`, error);
      throw error;
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
      console.log(`Fetching real multiple indicators from THL Sotkanet: ${endpoint}`);
      
      return await this.fetchFromBackend<SotkanetDataPoint[]>(endpoint);
    } catch (error) {
      console.error(`Failed to fetch multiple indicators [${indicators.join(',')}] from Sotkanet:`, error);
      throw error;
    }
  }

  async getAreaData(
    area: string,
    region: string = PSHVA_REGION_ID.toString()
  ): Promise<SotkanetDataPoint[]> {
    try {
      const currentYear = new Date().getFullYear() - 1;
      
      const endpoint = `/area/${area}?region=${region}&year=${currentYear}`;
      console.log(`Fetching real area data from THL Sotkanet: ${endpoint}`);
      
      return await this.fetchFromBackend<SotkanetDataPoint[]>(endpoint);
    } catch (error) {
      console.error(`Failed to fetch area ${area} data from Sotkanet:`, error);
      throw error;
    }
  }

  async testIndicator(indicator: number): Promise<any> {
    try {
      const endpoint = `/test/${indicator}`;
      console.log(`Testing indicator ${indicator} with THL Sotkanet...`);
      
      return await this.fetchFromBackend<any>(endpoint);
    } catch (error) {
      console.error(`Failed to test indicator ${indicator}:`, error);
      throw error;
    }
  }
}

export const sotkanetService = new SotkanetService();
