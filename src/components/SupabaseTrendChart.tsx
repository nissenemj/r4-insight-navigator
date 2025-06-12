
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { TrendingUp, Loader2, Database, Globe, AlertCircle } from 'lucide-react';
import { useSupabaseTrends } from '@/hooks/useSupabaseData';

interface SupabaseTrendChartProps {
  area: string;
  location: string;
}

export const SupabaseTrendChart = ({ area, location }: SupabaseTrendChartProps) => {
  const { data: trends, isLoading, error } = useSupabaseTrends(area, location);

  const locationName = location === 'all' ? 'Kaikki toimipisteet' : 
                      location.charAt(0).toUpperCase() + location.slice(1);

  const getAreaTitle = () => {
    const titles = {
      avoterveydenhuolto: 'Avoterveydenhuolto',
      leikkaustoiminta: 'Leikkaustoiminta', 
      paivystys: 'Päivystys',
      tutkimus: 'Tutkimus & Opetus'
    };
    return titles[area as keyof typeof titles] || 'Trendit';
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            {getAreaTitle()} - Trendianalyysi
          </CardTitle>
          <CardDescription>{locationName}</CardDescription>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-64">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            Ladataan trenditietoja...
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error || !trends) {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                {getAreaTitle()} - Trendianalyysi
              </CardTitle>
              <CardDescription>{locationName}</CardDescription>
            </div>
            <Badge variant="outline" className="text-xs">
              <AlertCircle className="h-3 w-3 mr-1" />
              Simuloitu data
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-64">
          <div className="text-center text-muted-foreground">
            <AlertCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Virhe ladattaessa trenditietoja</p>
            <p className="text-sm mt-2">Käytetään simuloitua dataa</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              {getAreaTitle()} - Trendianalyysi (12kk)
            </CardTitle>
            <CardDescription>{locationName}</CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-xs">
              <AlertCircle className="h-3 w-3 mr-1" />
              Simuloitu data
            </Badge>
            <Badge variant="secondary" className="text-xs">
              <Database className="h-3 w-3 mr-1" />
              Supabase
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={trends}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip 
                formatter={(value, name) => [value, name === 'current' ? 'Nykyinen' : name === 'target' ? 'Tavoite' : 'Kustannukset']}
                labelFormatter={(label) => `Kuukausi: ${label}`}
              />
              <Legend 
                formatter={(value) => value === 'current' ? 'Nykyinen' : value === 'target' ? 'Tavoite' : 'Kustannukset (€)'}
              />
              <Line 
                type="monotone" 
                dataKey="current" 
                stroke="#8884d8" 
                strokeWidth={2}
                dot={{ fill: '#8884d8' }}
              />
              <Line 
                type="monotone" 
                dataKey="target" 
                stroke="#82ca9d" 
                strokeWidth={2}
                strokeDasharray="5 5"
                dot={{ fill: '#82ca9d' }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
        
        <div className="mt-4 text-xs text-muted-foreground bg-muted/30 p-2 rounded">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1">
              <AlertCircle className="h-3 w-3" />
              <span>Trendidata on simuloitua - perustuu vuositietoihin</span>
            </div>
            <div className="flex items-center gap-1">
              <Database className="h-3 w-3" />
              <span>Tallennettu Supabaseen</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
