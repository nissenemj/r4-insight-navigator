
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown, Clock, Users, Calendar } from 'lucide-react';

interface HealthcareMetricsProps {
  area: string;
  location: string;
}

interface MetricData {
  value: number;
  target: number;
  trend: 'up' | 'down';
  unit?: string;
}

interface MetricsSet {
  [key: string]: MetricData;
}

export const HealthcareMetrics = ({ area, location }: HealthcareMetricsProps) => {
  // Simuloitu data eri osa-alueille ja toimipisteille
  const getMetricsData = (): MetricsSet => {
    const baseMetrics = {
      avoterveydenhuolto: {
        hoitotakuu: { value: 91, target: 95, trend: 'up' as const },
        kayntimaara: { value: 2847, target: 3000, trend: 'up' as const, unit: '/1000 as.' },
        digipalvelut: { value: 73, target: 80, trend: 'up' as const, unit: '%' },
      },
      leikkaustoiminta: {
        jonotusaika: { value: 42, target: 30, trend: 'down' as const, unit: 'päivää' },
        leikkaukset: { value: 156, target: 180, trend: 'up' as const, unit: 'kpl/kk' },
        peruutukset: { value: 8, target: 5, trend: 'down' as const, unit: '%' },
      },
      paivystys: {
        odotusaika: { value: 28, target: 20, trend: 'down' as const, unit: 'min' },
        kayntimaara: { value: 892, target: 800, trend: 'up' as const, unit: '/1000 as.' },
        uudelleenkaynnit: { value: 12, target: 10, trend: 'down' as const, unit: '%' },
      },
      tutkimus: {
        hankkeet: { value: 23, target: 25, trend: 'up' as const, unit: 'kpl' },
        palaute: { value: 4.2, target: 4.0, trend: 'up' as const, unit: '/5' },
        julkaisut: { value: 18, target: 20, trend: 'up' as const, unit: 'kpl/v' },
      }
    };

    return baseMetrics[area as keyof typeof baseMetrics] || baseMetrics.avoterveydenhuolto;
  };

  const metrics = getMetricsData();
  const locationName = location === 'all' ? 'Kaikki toimipisteet' : 
                      location.charAt(0).toUpperCase() + location.slice(1);

  const getAreaTitle = () => {
    const titles = {
      avoterveydenhuolto: 'Avoterveydenhuolto',
      leikkaustoiminta: 'Leikkaustoiminta',
      paivystys: 'Päivystys',
      tutkimus: 'Tutkimus & Opetus'
    };
    return titles[area as keyof typeof titles] || 'Mittarit';
  };

  const getMetricCards = () => {
    const cards = Object.entries(metrics).map(([key, data]) => {
      const percentage = Math.min((data.value / data.target) * 100, 100);
      const isOnTarget = data.value >= data.target;
      
      return (
        <Card key={key} className="relative">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium capitalize">
                {key.replace(/([A-Z])/g, ' $1').toLowerCase()}
              </CardTitle>
              <Badge variant={isOnTarget ? "default" : "destructive"}>
                {data.trend === 'up' ? (
                  <TrendingUp className="h-3 w-3 mr-1" />
                ) : (
                  <TrendingDown className="h-3 w-3 mr-1" />
                )}
                {data.trend === 'up' ? '+' : '-'}5%
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-2xl font-bold">
                  {data.value}{data.unit || '%'}
                </span>
                <span className="text-sm text-muted-foreground">
                  Tavoite: {data.target}{data.unit || '%'}
                </span>
              </div>
              <Progress value={percentage} className="h-2" />
              <div className="text-xs text-muted-foreground">
                {isOnTarget ? 'Tavoite saavutettu' : `${(data.target - data.value)} ${data.unit || '%'} tavoitteeseen`}
              </div>
            </div>
          </CardContent>
        </Card>
      );
    });

    return cards;
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">{getAreaTitle()} - {locationName}</h3>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Clock className="h-4 w-4" />
          Päivitetty: {new Date().toLocaleTimeString('fi-FI', { hour: '2-digit', minute: '2-digit' })}
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {getMetricCards()}
      </div>
    </div>
  );
};
