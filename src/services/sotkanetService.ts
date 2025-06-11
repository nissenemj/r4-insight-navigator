
import { SotkanetDataPoint, SotkanetRegion, SotkanetIndicator } from '@/types/sotkanet';

// Korjattu Sotkanet REST API URL
const BASE_URL = 'https://sotkanet.fi/rest/1.1';
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
    console.log(`Haetaan backendistä: ${BACKEND_BASE_URL}${endpoint}`);
    
    try {
      const response = await fetch(`${BACKEND_BASE_URL}${endpoint}`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      });
      
      console.log(`Backend response status: ${response.status}`);
      
      if (!response.ok) {
        throw new Error(`Backend HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('Backend data received:', data);
      return data;
      
    } catch (error) {
      console.error('Backend fetch error:', error);
      throw error;
    }
  }

  async getRegions(): Promise<SotkanetRegion[]> {
    try {
      return await this.fetchFromBackend<SotkanetRegion[]>('/regions');
    } catch (error) {
      console.error('Failed to fetch regions from backend:', error);
      return [];
    }
  }

  async getIndicators(): Promise<SotkanetIndicator[]> {
    try {
      return await this.fetchFromBackend<SotkanetIndicator[]>('/indicators');
    } catch (error) {
      console.error('Failed to fetch indicators from backend:', error);
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
      console.log(`Backend indicator data endpoint: ${endpoint}`);
      
      return await this.fetchFromBackend<SotkanetDataPoint[]>(endpoint);
    } catch (error) {
      console.error('Failed to fetch indicator data from backend:', error);
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
      console.log(`Backend comparison data endpoint: ${endpoint}`);
      
      return await this.fetchFromBackend<SotkanetDataPoint[]>(endpoint);
    } catch (error) {
      console.error('Failed to fetch comparison data from backend:', error);
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
      console.log(`Backend multiple indicators endpoint: ${endpoint}`);
      
      return await this.fetchFromBackend<SotkanetDataPoint[]>(endpoint);
    } catch (error) {
      console.error('Failed to fetch multiple indicators from backend:', error);
      return [];
    }
  }
}

export const sotkanetService = new SotkanetService();
