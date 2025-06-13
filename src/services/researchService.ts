
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
            year: new Date().getFullYear() - 1,
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
          years: [2020, 2021, 2022, 2023]
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

  private getFallbackPublications(): ResearchPublication[] {
    return [
      {
        id: '1',
        title: 'Terveydenhuollon digitaalisten palvelujen vaikuttavuus',
        publicationYear: 2023,
        authors: ['Tutkija A', 'Tutkija B'],
        organization: 'Pohjois-Savon hyvinvointialue',
        type: 'Artikkeli',
        doi: '10.1000/example.2023.001'
      },
      {
        id: '2',
        title: 'Päivystyksen resurssiohjaus ja potilasvirrat',
        publicationYear: 2023,
        authors: ['Tutkija C', 'Tutkija D'],
        organization: 'Pohjois-Savon hyvinvointialue',
        type: 'Tutkimusraportti'
      }
    ];
  }

  private getFallbackFunding(): FundingCall[] {
    return [
      {
        id: '1',
        title: 'Digitaalisten terveyspalvelujen kehittäminen',
        funder: 'Business Finland',
        amount: 250000,
        startDate: '2023-01-01',
        endDate: '2024-12-31',
        organization: 'Pohjois-Savon hyvinvointialue'
      },
      {
        id: '2',
        title: 'Tekoäly terveydenhuollon päätöksentuessa',
        funder: 'Suomen Akatemia',
        amount: 180000,
        startDate: '2023-09-01',
        endDate: '2025-08-31',
        organization: 'Pohjois-Savon hyvinvointialue'
      }
    ];
  }

  private getFallbackEducation(): EducationMetrics[] {
    return [
      { year: 2020, students: 245, graduates: 58, satisfactionScore: 4.1, employmentRate: 92 },
      { year: 2021, students: 267, graduates: 62, satisfactionScore: 4.2, employmentRate: 94 },
      { year: 2022, students: 289, graduates: 71, satisfactionScore: 4.3, employmentRate: 96 },
      { year: 2023, students: 312, graduates: 79, satisfactionScore: 4.4, employmentRate: 97 }
    ];
  }
}

export const researchService = new ResearchService();
