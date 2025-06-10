
import { SotkanetDataPoint, SotkanetRegion, SotkanetIndicator } from '@/types/sotkanet';

// Käytetään luotettavaa CORS-proxya - korjattu URL
const CORS_PROXY = 'https://corsproxy.io/?';
const BASE_URL = 'https://sotkanet.fi/api/2';

// PSHVA hyvinvointialueen koodi
export const PSHVA_CODE = 'HVA16';

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
    console.log(`Yritetään hakea: ${BASE_URL}${endpoint}`);
    
    try {
      // Kokeile ensin proxyn kanssa
      const proxyUrl = `${CORS_PROXY}${encodeURIComponent(BASE_URL + endpoint)}`;
      console.log(`Proxy URL: ${proxyUrl}`);
      
      const response = await fetch(proxyUrl, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      });
      
      console.log(`Response status: ${response.status}`);
      console.log(`Response headers:`, Object.fromEntries(response.headers));
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const text = await response.text();
      console.log(`Response text preview: ${text.substring(0, 200)}...`);
      
      // Tarkista että vastaus on JSON eikä HTML
      if (text.trim().startsWith('<!DOCTYPE html>') || text.trim().startsWith('<html')) {
        throw new Error('API palautti HTML-sivun JSON:n sijaan');
      }
      
      const data = JSON.parse(text);
      console.log('JSON data parsittu onnistuneesti:', data);
      return data;
      
    } catch (error) {
      console.error('Sotkanet API error:', error);
      throw error;
    }
  }

  async getRegions(): Promise<SotkanetRegion[]> {
    try {
      // Dokumentaation mukainen endpoint
      return await this.fetchData<SotkanetRegion[]>('/regions?type=HYVINVOINTIALUE');
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
    regions: string[] = [PSHVA_CODE], 
    year?: number
  ): Promise<SotkanetDataPoint[]> {
    try {
      const currentYear = year || new Date().getFullYear() - 1;
      // Dokumentaation mukaan: pilkulla erotettu merkkijono
      const regionsParam = regions.join(',');
      
      // Dokumentaation mukainen parametrimuoto
      const endpoint = `/data?indicator=${indicator}&year=${currentYear}&regions=${regionsParam}&genders=total`;
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
      // Huom: API tukee vain yhtä vuotta kerrallaan dokumentaation mukaan
      const latestYear = Math.max(...years);
      
      const endpoint = `/data?indicator=${indicator}&year=${latestYear}&regions=${PSHVA_CODE}&genders=total`;
      console.log(`Comparison data endpoint: ${endpoint}`);
      
      return await this.fetchData<SotkanetDataPoint[]>(endpoint);
    } catch (error) {
      console.error('Failed to fetch comparison data:', error);
      return [];
    }
  }

  async getMultipleIndicators(
    indicators: number[], 
    region: string = PSHVA_CODE
  ): Promise<SotkanetDataPoint[]> {
    try {
      const currentYear = new Date().getFullYear() - 1;
      // Dokumentaation mukaan: pilkulla erotettu merkkijono
      const indicatorsParam = indicators.join(',');
      
      const endpoint = `/data?indicator=${indicatorsParam}&year=${currentYear}&regions=${region}&genders=total`;
      console.log(`Multiple indicators endpoint: ${endpoint}`);
      
      return await this.fetchData<SotkanetDataPoint[]>(endpoint);
    } catch (error) {
      console.error('Failed to fetch multiple indicators:', error);
      return [];
    }
  }
}

export const sotkanetService = new SotkanetService();
