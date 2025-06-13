
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Legend } from 'recharts';
import { TrendingUp, TrendingDown, BarChart3 } from 'lucide-react';
import { useResearchTrends } from '@/hooks/useResearchData';

interface ResearchTrendChartProps {
  location: string;
}

export const ResearchTrendChart = ({ location }: ResearchTrendChartProps) => {
  const { data: trendData, isLoading, error } = useResearchTrends(location);

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Tutkimustoiminnan trendit 2024-2025
          </CardTitle>
          <CardDescription>Ladataan trenditietoja...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-80 flex items-center justify-center">
            <div className="animate-pulse text-muted-foreground">Ladataan kaaviotietoja...</div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error || !trendData) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Tutkimustoiminnan trendit 2024-2025
          </CardTitle>
          <CardDescription>Virhe ladattaessa trenditietoja</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-80 flex items-center justify-center text-muted-foreground">
            Ei trenditietoja saatavilla
          </div>
        </CardContent>
      </Card>
    );
  }

  // Prepare data for chart
  const chartData = trendData.map(item => ({
    period: `${item.month} ${item.year}`,
    year: item.year,
    month: item.month,
    julkaisut: item.publications,
    rahoitus: Math.round(item.fundingAmount / 1000), // Convert to thousands
    opiskelijat: item.students,
    valmistuneet: item.graduates
  }));

  const chartConfig = {
    julkaisut: {
      label: "Julkaisut",
      color: "hsl(var(--chart-1))",
    },
    rahoitus: {
      label: "Rahoitus (k€)",
      color: "hsl(var(--chart-2))",
    },
    opiskelijat: {
      label: "Opiskelijat",
      color: "hsl(var(--chart-3))",
    },
    valmistuneet: {
      label: "Valmistuneet",
      color: "hsl(var(--chart-4))",
    },
  };

  // Calculate trends
  const latestData = chartData[chartData.length - 1];
  const previousData = chartData[chartData.length - 2];
  
  const publicationsTrend = latestData && previousData ? 
    ((latestData.julkaisut - previousData.julkaisut) / previousData.julkaisut) * 100 : 0;
  
  const fundingTrend = latestData && previousData ? 
    ((latestData.rahoitus - previousData.rahoitus) / previousData.rahoitus) * 100 : 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BarChart3 className="h-5 w-5" />
          Tutkimustoiminnan trendit 2024-2025
        </CardTitle>
        <CardDescription>
          Kuukausittainen kehitys julkaisuissa, rahoituksessa ja opetuksessa
        </CardDescription>
        <div className="flex gap-4 text-sm">
          <div className="flex items-center gap-1">
            {publicationsTrend > 0 ? (
              <TrendingUp className="h-4 w-4 text-green-600" />
            ) : (
              <TrendingDown className="h-4 w-4 text-red-600" />
            )}
            <span className={publicationsTrend > 0 ? 'text-green-600' : 'text-red-600'}>
              Julkaisut {publicationsTrend > 0 ? '+' : ''}{publicationsTrend.toFixed(1)}%
            </span>
          </div>
          <div className="flex items-center gap-1">
            {fundingTrend > 0 ? (
              <TrendingUp className="h-4 w-4 text-green-600" />
            ) : (
              <TrendingDown className="h-4 w-4 text-red-600" />
            )}
            <span className={fundingTrend > 0 ? 'text-green-600' : 'text-red-600'}>
              Rahoitus {fundingTrend > 0 ? '+' : ''}{fundingTrend.toFixed(1)}%
            </span>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-80">
          <LineChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              dataKey="period" 
              angle={-45}
              textAnchor="end"
              height={80}
              interval={1}
              fontSize={10}
            />
            <YAxis yAxisId="left" />
            <YAxis yAxisId="right" orientation="right" />
            <ChartTooltip content={<ChartTooltipContent />} />
            <Legend />
            <Line 
              yAxisId="left"
              type="monotone" 
              dataKey="julkaisut" 
              stroke="var(--color-julkaisut)" 
              strokeWidth={2}
              dot={{ fill: "var(--color-julkaisut)" }}
            />
            <Line 
              yAxisId="right"
              type="monotone" 
              dataKey="rahoitus" 
              stroke="var(--color-rahoitus)" 
              strokeWidth={2}
              dot={{ fill: "var(--color-rahoitus)" }}
            />
            <Line 
              yAxisId="left"
              type="monotone" 
              dataKey="opiskelijat" 
              stroke="var(--color-opiskelijat)" 
              strokeWidth={2}
              dot={{ fill: "var(--color-opiskelijat)" }}
            />
            <Line 
              yAxisId="left"
              type="monotone" 
              dataKey="valmistuneet" 
              stroke="var(--color-valmistuneet)" 
              strokeWidth={2}
              dot={{ fill: "var(--color-valmistuneet)" }}
            />
          </LineChart>
        </ChartContainer>
        
        <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div className="text-center">
            <div className="font-semibold">{latestData?.julkaisut || 0}</div>
            <div className="text-muted-foreground">Julkaisut/kk</div>
          </div>
          <div className="text-center">
            <div className="font-semibold">{latestData?.rahoitus || 0}k€</div>
            <div className="text-muted-foreground">Rahoitus/kk</div>
          </div>
          <div className="text-center">
            <div className="font-semibold">{latestData?.opiskelijat || 0}</div>
            <div className="text-muted-foreground">Opiskelijat</div>
          </div>
          <div className="text-center">
            <div className="font-semibold">{latestData?.valmistuneet || 0}</div>
            <div className="text-muted-foreground">Valmistuneet</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
