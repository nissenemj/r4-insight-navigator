
import { SotkanetDataPoint, SotkanetRegion, SotkanetIndicator } from '@/types/sotkanet';

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
  private async fetchData<T>(endpoint: string): Promise<T> {
    try {
      const response = await fetch(`${BASE_URL}${endpoint}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Sotkanet API error:', error);
      throw new Error('Tietojen haku epäonnistui');
    }
  }

  async getRegions(): Promise<SotkanetRegion[]> {
    return this.fetchData<SotkanetRegion[]>('/regions?type=HYVINVOINTIALUE');
  }

  async getIndicators(): Promise<SotkanetIndicator[]> {
    return this.fetchData<SotkanetIndicator[]>('/indicators');
  }

  async getIndicatorData(
    indicator: number, 
    regions: string[] = [PSHVA_CODE], 
    year?: number
  ): Promise<SotkanetDataPoint[]> {
    const currentYear = year || new Date().getFullYear() - 1; // Käytä edellistä vuotta
    const regionsParam = regions.join(',');
    
    return this.fetchData<SotkanetDataPoint[]>(
      `/data?indicator=${indicator}&regions=${regionsParam}&year=${currentYear}&genders=total`
    );
  }

  async getComparisonData(
    indicator: number, 
    years: number[] = [2022, 2023]
  ): Promise<SotkanetDataPoint[]> {
    const yearsParam = years.join(',');
    
    return this.fetchData<SotkanetDataPoint[]>(
      `/data?indicator=${indicator}&regions=${PSHVA_CODE}&year=${yearsParam}&genders=total`
    );
  }

  async getMultipleIndicators(
    indicators: number[], 
    region: string = PSHVA_CODE
  ): Promise<SotkanetDataPoint[]> {
    const indicatorsParam = indicators.join(',');
    
    return this.fetchData<SotkanetDataPoint[]>(
      `/data?indicator=${indicatorsParam}&regions=${region}&genders=total`
    );
  }
}

export const sotkanetService = new SotkanetService();
