
export interface ResearchPublication {
  id: string;
  title: string;
  publicationYear: number;
  authors: string[];
  organization: string;
  type: string;
  doi?: string;
}

export interface FundingCall {
  id: string;
  title: string;
  funder: string;
  amount: number;
  startDate: string;
  endDate: string;
  organization: string;
}

export interface EducationMetrics {
  year: number;
  students: number;
  graduates: number;
  satisfactionScore: number;
  employmentRate: number;
}

export interface ResearchTrendData {
  year: number;
  month: string;
  publications: number;
  fundingAmount: number;
  students: number;
  graduates: number;
}

class ResearchService {
  private baseUrl = 'https://research.fi/api/rest/v1';
  private statsUrl = 'https://pxdata.stat.fi/PXWeb/api/v1/fi';

  async getPublications(organizationId?: string): Promise<ResearchPublication[]> {
    try {
      const { supabase } = await import('@/integrations/supabase/client');
      
      const { data, error } = await supabase.functions.invoke('research-data', {
        body: {
          type: 'publications',
          organizationId,
          filters: {
            year: [2023, 2024, 2025],
            limit: 50
          }
        }
      });

      if (error) {
        console.error('Error fetching publications:', error);
        return this.getFallbackPublications();
      }

      return data?.publications || this.getFallbackPublications();
    } catch (error) {
      console.error('Research service error:', error);
      return this.getFallbackPublications();
    }
  }

  async getFundingCalls(organizationId?: string): Promise<FundingCall[]> {
    try {
      const { supabase } = await import('@/integrations/supabase/client');
      
      const { data, error } = await supabase.functions.invoke('research-data', {
        body: {
          type: 'funding',
          organizationId,
          filters: {
            status: 'active',
            years: [2024, 2025],
            limit: 20
          }
        }
      });

      if (error) {
        console.error('Error fetching funding calls:', error);
        return this.getFallbackFunding();
      }

      return data?.funding || this.getFallbackFunding();
    } catch (error) {
      console.error('Research service error:', error);
      return this.getFallbackFunding();
    }
  }

  async getEducationMetrics(region?: string): Promise<EducationMetrics[]> {
    try {
      const { supabase } = await import('@/integrations/supabase/client');
      
      const { data, error } = await supabase.functions.invoke('statistics-data', {
        body: {
          type: 'education',
          region: region || 'pshva',
          years: [2020, 2021, 2022, 2023, 2024]
        }
      });

      if (error) {
        console.error('Error fetching education metrics:', error);
        return this.getFallbackEducation();
      }

      return data?.education || this.getFallbackEducation();
    } catch (error) {
      console.error('Statistics service error:', error);
      return this.getFallbackEducation();
    }
  }

  async getResearchTrends(region?: string): Promise<ResearchTrendData[]> {
    try {
      const { supabase } = await import('@/integrations/supabase/client');
      
      const { data, error } = await supabase.functions.invoke('research-data', {
        body: {
          type: 'trends',
          region: region || 'pshva',
          timeframe: '2024-2025'
        }
      });

      if (error) {
        console.error('Error fetching research trends:', error);
        return this.getFallbackTrendData();
      }

      return data?.trends || this.getFallbackTrendData();
    } catch (error) {
      console.error('Research trends service error:', error);
      return this.getFallbackTrendData();
    }
  }

  private getFallbackPublications(): ResearchPublication[] {
    return [
      {
        id: '1',
        title: 'Terveydenhuollon digitaalisten palvelujen vaikuttavuus 2024',
        publicationYear: 2024,
        authors: ['Tutkija A', 'Tutkija B'],
        organization: 'Pohjois-Savon hyvinvointialue',
        type: 'Artikkeli',
        doi: '10.1000/example.2024.001'
      },
      {
        id: '2',
        title: 'Päivystyksen resurssiohjaus ja potilasvirrat - päivitys 2024',
        publicationYear: 2024,
        authors: ['Tutkija C', 'Tutkija D'],
        organization: 'Pohjois-Savon hyvinvointialue',
        type: 'Tutkimusraportti'
      },
      {
        id: '3',
        title: 'Tekoäly terveydenhuollon päätöksentuessa - pilottihanke',
        publicationYear: 2024,
        authors: ['Tutkija E', 'Tutkija F'],
        organization: 'Pohjois-Savon hyvinvointialue',
        type: 'Konferenssijulkaisu'
      },
      {
        id: '4',
        title: 'Etäkuntoutuksen vaikuttavuus neurologisessa kuntoutuksessa',
        publicationYear: 2025,
        authors: ['Tutkija G'],
        organization: 'Pohjois-Savon hyvinvointialue',
        type: 'Artikkeli'
      }
    ];
  }

  private getFallbackFunding(): FundingCall[] {
    return [
      {
        id: '1',
        title: 'Digitaalisten terveyspalvelujen kehittäminen 2024-2026',
        funder: 'Business Finland',
        amount: 350000,
        startDate: '2024-01-01',
        endDate: '2026-12-31',
        organization: 'Pohjois-Savon hyvinvointialue'
      },
      {
        id: '2',
        title: 'Tekoäly terveydenhuollon päätöksentuessa',
        funder: 'Suomen Akatemia',
        amount: 280000,
        startDate: '2024-09-01',
        endDate: '2026-08-31',
        organization: 'Pohjois-Savon hyvinvointialue'
      },
      {
        id: '3',
        title: 'Kestävä terveydenhuolto - vihreä siirtymä',
        funder: 'EU Horizon Europe',
        amount: 450000,
        startDate: '2024-06-01',
        endDate: '2027-05-31',
        organization: 'Pohjois-Savon hyvinvointialue'
      }
    ];
  }

  private getFallbackEducation(): EducationMetrics[] {
    return [
      { year: 2020, students: 245, graduates: 58, satisfactionScore: 4.1, employmentRate: 92 },
      { year: 2021, students: 267, graduates: 62, satisfactionScore: 4.2, employmentRate: 94 },
      { year: 2022, students: 289, graduates: 71, satisfactionScore: 4.3, employmentRate: 96 },
      { year: 2023, students: 312, graduates: 79, satisfactionScore: 4.4, employmentRate: 97 },
      { year: 2024, students: 334, graduates: 87, satisfactionScore: 4.5, employmentRate: 98 }
    ];
  }

  private getFallbackTrendData(): ResearchTrendData[] {
    const months = ['Tammi', 'Helmi', 'Maalis', 'Huhti', 'Touko', 'Kesä', 
                   'Heinä', 'Elo', 'Syys', 'Loka', 'Marras', 'Joulu'];
    
    return [
      // 2024 data
      ...months.map((month, index) => ({
        year: 2024,
        month,
        publications: 15 + Math.floor(Math.random() * 8),
        fundingAmount: 180000 + Math.floor(Math.random() * 50000),
        students: 300 + Math.floor(Math.random() * 40),
        graduates: Math.floor((300 + Math.random() * 40) * 0.25)
      })),
      // 2025 data (first quarter)
      ...months.slice(0, 3).map((month, index) => ({
        year: 2025,
        month,
        publications: 18 + Math.floor(Math.random() * 10),
        fundingAmount: 220000 + Math.floor(Math.random() * 60000),
        students: 340 + Math.floor(Math.random() * 50),
        graduates: Math.floor((340 + Math.random() * 50) * 0.25)
      }))
    ];
  }
}

export const researchService = new ResearchService();
