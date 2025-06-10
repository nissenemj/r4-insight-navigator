
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { Loader2 } from 'lucide-react';
import { useSotkanetTrends } from '@/hooks/useSotkanetData';

interface TrendChartProps {
  area: string;
  location: string;
}

export const TrendChart = ({ area, location }: TrendChartProps) => {
  const { data, isLoading, error } = useSotkanetTrends(area, location);

  const chartConfig = {
    current: {
      label: "Toteutunut",
      color: "hsl(var(--primary))",
    },
    target: {
      label: "Tavoite",
      color: "hsl(var(--muted-foreground))",
    },
    costs: {
      label: "Kustannukset €",
      color: "hsl(var(--destructive))",
    },
  };

  const getChartTitle = () => {
    const titles = {
      avoterveydenhuolto: 'Käyntimäärät ja kustannukset (Sotkanet)',
      leikkaustoiminta: 'Leikkausmäärät ja kustannukset (Sotkanet)',
      paivystys: 'Päivystyskäynnit ja kustannukset (Sotkanet)',
      tutkimus: 'Tutkimushankkeet ja rahoitus (Sotkanet)'
    };
    return titles[area as keyof typeof titles] || 'Trendianalyysi (Sotkanet)';
  };

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {[1, 2].map((i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader>
              <div className="h-6 bg-gray-200 rounded w-3/4"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-center h-[300px]">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>{getChartTitle()}</CardTitle>
            <CardDescription className="text-destructive">
              Virhe tietojen haussa Sotkanetista
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-center h-[300px] text-muted-foreground">
              Ei voitu ladata trendidata
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <Card>
        <CardHeader>
          <CardTitle>{getChartTitle()}</CardTitle>
          <CardDescription>
            12 kuukauden kehitys - {location.charAt(0).toUpperCase() + location.slice(1)}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig}>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={data}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Line 
                  type="monotone" 
                  dataKey="current" 
                  stroke="var(--color-current)" 
                  strokeWidth={2}
                  dot={{ fill: "var(--color-current)" }}
                />
                <Line 
                  type="monotone" 
                  dataKey="target" 
                  stroke="var(--color-target)" 
                  strokeWidth={2}
                  strokeDasharray="5 5"
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Kustannuskehitys</CardTitle>
          <CardDescription>
            Kuukausittaiset kustannukset euroina (arvio Sotkanet-datan pohjalta)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig}>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={data}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar 
                  dataKey="costs" 
                  fill="var(--color-costs)"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>
    </div>
  );
};
