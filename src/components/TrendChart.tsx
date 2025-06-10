
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer, BarChart, Bar } from 'recharts';

interface TrendChartProps {
  area: string;
  location: string;
}

export const TrendChart = ({ area, location }: TrendChartProps) => {
  // Simuloitu trendidata
  const generateTrendData = () => {
    const months = ['Tam', 'Hel', 'Maa', 'Huh', 'Tou', 'Kes', 'Hei', 'Elo', 'Syy', 'Lok', 'Mar', 'Jou'];
    
    const baseData = months.map((month, index) => {
      const baseValue = area === 'avoterveydenhuolto' ? 2500 :
                       area === 'leikkaustoiminta' ? 150 :
                       area === 'paivystys' ? 800 : 20;
      
      const seasonalVariation = Math.sin((index / 12) * 2 * Math.PI) * (baseValue * 0.1);
      const trend = index * (baseValue * 0.02);
      const noise = (Math.random() - 0.5) * (baseValue * 0.1);
      
      return {
        month,
        current: Math.round(baseValue + seasonalVariation + trend + noise),
        target: baseValue + trend,
        costs: Math.round((baseValue + seasonalVariation + trend + noise) * 150), // Kustannukset euroina
      };
    });

    return baseData;
  };

  const data = generateTrendData();
  
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
      avoterveydenhuolto: 'Käyntimäärät ja kustannukset',
      leikkaustoiminta: 'Leikkausmäärät ja kustannukset',
      paivystys: 'Päivystyskäynnit ja kustannukset',
      tutkimus: 'Tutkimushankkeet ja rahoitus'
    };
    return titles[area as keyof typeof titles] || 'Trendianalyysi';
  };

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
            Kuukausittaiset kustannukset euroina
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
