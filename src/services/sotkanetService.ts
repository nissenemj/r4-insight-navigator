
import { SotkanetDataPoint, SotkanetRegion, SotkanetIndicator } from '@/types/sotkanet';

// Käytetään CORS-proxya Sotkanet API-kutsujen mahdollistamiseksi
const CORS_PROXY = 'https://cors-anywhere.herokuapp.com/';
const BASE_URL = 'https://sotkanet.fi/api/2';

// PSHVA hyvinvointialueen koodi
export const PSHVA_CODE = 'HVA16';

// Avainmittarit per osa-alue
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
  private async fetchData<T>(endpoint: string, useProxy: boolean = true): Promise<T> {
    try {
      console.log(`Attempting to fetch: ${endpoint}`);
      
      // Kokeile ensin ilman proxya
      let url = `${BASE_URL}${endpoint}`;
      let response = await fetch(url);
      
      // Jos epäonnistuu CORS-virheen vuoksi, kokeile proxyn kanssa
      if (!response.ok && useProxy) {
        console.log('Direct fetch failed, trying with CORS proxy...');
        url = `${CORS_PROXY}${BASE_URL}${endpoint}`;
        response = await fetch(url);
      }
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('Successfully fetched data:', data);
      return data;
    } catch (error) {
      console.error('Sotkanet API error:', error);
      // Palautetaan tyhjä data virhetilanteessa
      return [] as unknown as T;
    }
  }

  async getRegions(): Promise<SotkanetRegion[]> {
    try {
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
      const currentYear = year || new Date().getFullYear() - 1; // Käytä edellistä vuotta
      // KORJAUS: Muunna regions-lista pilkulla erotetuksi merkkijonoksi
      const regionsParam = regions.join(',');
      
      return await this.fetchData<SotkanetDataPoint[]>(
        `/data?indicator=${indicator}&regions=${regionsParam}&year=${currentYear}&genders=total`
      );
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
      // KORJAUS: Muunna years-lista pilkulla erotetuksi merkkijonoksi
      const yearsParam = years.join(',');
      
      return await this.fetchData<SotkanetDataPoint[]>(
        `/data?indicator=${indicator}&regions=${PSHVA_CODE}&year=${yearsParam}&genders=total`
      );
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
      // KORJAUS: Muunna indicators-lista pilkulla erotetuksi merkkijonoksi
      const indicatorsParam = indicators.join(',');
      
      return await this.fetchData<SotkanetDataPoint[]>(
        `/data?indicator=${indicatorsParam}&regions=${region}&genders=total`
      );
    } catch (error) {
      console.error('Failed to fetch multiple indicators:', error);
      return [];
    }
  }
}

export const sotkanetService = new SotkanetService();
