
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown, Clock, Loader2 } from 'lucide-react';
import { useSotkanetMetrics } from '@/hooks/useSotkanetData';

interface HealthcareMetricsProps {
  area: string;
  location: string;
}

export const HealthcareMetrics = ({ area, location }: HealthcareMetricsProps) => {
  const { data: metrics, isLoading, error } = useSotkanetMetrics(area, location);

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

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">{getAreaTitle()} - {locationName}</h3>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            Ladataan dataa Sotkanetista...
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader className="pb-2">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="h-8 bg-gray-200 rounded w-1/2"></div>
                  <div className="h-2 bg-gray-200 rounded"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">{getAreaTitle()} - {locationName}</h3>
          <div className="flex items-center gap-2 text-sm text-destructive">
            <Clock className="h-4 w-4" />
            Virhe tietojen haussa (käytetään simuloitua dataa)
          </div>
        </div>
      </div>
    );
  }

  if (!metrics) {
    return null;
  }

  const getMetricCards = () => {
    return Object.entries(metrics).map(([key, data]) => {
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
                  {data.value.toFixed(1)}{data.unit || '%'}
                </span>
                <span className="text-sm text-muted-foreground">
                  Tavoite: {data.target}{data.unit || '%'}
                </span>
              </div>
              <Progress value={percentage} className="h-2" />
              <div className="text-xs text-muted-foreground">
                {isOnTarget ? 'Tavoite saavutettu' : `${(data.target - data.value).toFixed(1)} ${data.unit || '%'} tavoitteeseen`}
              </div>
            </div>
          </CardContent>
        </Card>
      );
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">{getAreaTitle()} - {locationName}</h3>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Clock className="h-4 w-4" />
          Sotkanet data päivitetty: {new Date().toLocaleTimeString('fi-FI', { hour: '2-digit', minute: '2-digit' })}
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {getMetricCards()}
      </div>
    </div>
  );
};
