
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown, Clock, Loader2, Database } from 'lucide-react';
import { useSupabaseMetrics } from '@/hooks/useSupabaseData';

interface SupabaseHealthcareMetricsProps {
  area: string;
  location: string;
}

export const SupabaseHealthcareMetrics = ({ area, location }: SupabaseHealthcareMetricsProps) => {
  const { data: metrics, isLoading, error } = useSupabaseMetrics(area, location);

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
            Ladataan Supabase-dataa...
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
            Virhe Supabase-tietojen haussa
          </div>
        </div>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center text-muted-foreground">
              <Database className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Virhe ladattaessa tietoja Supabasesta</p>
              <p className="text-sm mt-2">{error instanceof Error ? error.message : 'Tuntematon virhe'}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!metrics || Object.keys(metrics).length === 0) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">{getAreaTitle()} - {locationName}</h3>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Database className="h-4 w-4" />
            Supabase yhdistetty
          </div>
        </div>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center text-muted-foreground">
              <Database className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Ei mittaritietoja saatavilla valitulle alueelle</p>
              <p className="text-sm mt-2">Tarkista alueen asetukset tai ota yhteyttä ylläpitoon</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
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
          <Database className="h-4 w-4" />
          Supabase data päivitetty: {new Date().toLocaleTimeString('fi-FI', { hour: '2-digit', minute: '2-digit' })}
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {getMetricCards()}
      </div>
    </div>
  );
};
