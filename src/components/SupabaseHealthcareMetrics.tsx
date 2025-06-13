
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { TrendingUp, TrendingDown, Clock, Loader2, Database, Globe, AlertCircle } from 'lucide-react';
import { useSupabaseMetrics } from '@/hooks/useSupabaseData';
import { MetricData } from '@/services/supabaseService';

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

  const getMetricDisplayName = (key: string) => {
    const displayNames: { [key: string]: string } = {
      // Avoterveydenhuolto
      hoitotakuu_3kk: 'Hoitotakuu: Odotusaika yli 3 kk',
      hoitotakuu_7pv: 'Hoitotakuu: Odotusaika yli 7 pv',
      kayntimaara_kaikki: 'Kaikki lääkärikäynnit',
      kayntimaara_avosairaanhoito: 'Avosairaanhoidon käynnit',
      digipalvelut_asioinut: 'Digitaalinen asiointi',
      digipalvelut_korvasi: 'Digi korvasi perinteisen',
      digipalvelut_esteet: 'Esteitä digi-palveluissa (65+)',
      // Leikkaustoiminta
      odotusaika_mediaani: 'Erikoissairaanhoidon odotusaika',
      hoitojakso_pituus: 'Hoitojaksojen pituus',
      odotusaika_yli6kk: 'Yli 6 kk odottaneet',
      hoitopaivat_18_64: 'Hoitopäivät 18-64v',
      // Päivystys
      paivystys_perusterveydenhuolto: 'Päivystys: Perusterveydenhuolto',
      paivystys_erikoissairaanhoito: 'Päivystys: Erikoissairaanhoito',
      palanneet_48h_aikuiset: 'Palanneet 48h (aikuiset)',
      palanneet_48h_lapset: 'Palanneet 48h (lapset)',
      // Tutkimus
      hankkeet: 'Tutkimushankkeet',
      palaute: 'Opetuspalaute',
      julkaisut: 'Tieteelliset julkaisut'
    };
    return displayNames[key] || key.replace(/_/g, ' ');
  };

  const getVariableName = (key: string) => {
    const variableNames: { [key: string]: string } = {
      // Avoterveydenhuolto  
      hoitotakuu_3kk: 'odotusaika_yli_3kk_prosentti',
      hoitotakuu_7pv: 'odotusaika_yli_7pv_prosentti',
      kayntimaara_kaikki: 'kaikki_laakarикaynnit_1000',
      kayntimaara_avosairaanhoito: 'avosairaanhoito_kaynnit_1000',
      digipalvelut_asioinut: 'digitaalinen_asiointi_prosentti',
      digipalvelut_korvasi: 'digi_korvasi_perinteisen_prosentti',
      digipalvelut_esteet: 'digi_esteet_65plus_prosentti',
      // Leikkaustoiminta
      odotusaika_mediaani: 'erikoissairaanhoito_odotusaika_mediaani',
      hoitojakso_pituus: 'toimenpiteellinen_hoitojakso_pituus',
      odotusaika_yli6kk: 'yli_6kk_odottaneet_10000',
      hoitopaivat_18_64: 'toimenpiteelliset_hoitopaivat_18_64_1000',
      // Päivystys
      paivystys_perusterveydenhuolto: 'paivystys_pth_kaynnit_1000',
      paivystys_erikoissairaanhoito: 'paivystys_esh_kaynnit_1000',
      palanneet_48h_aikuiset: 'paivystys_palanneet_48h_aikuiset_prosentti',
      palanneet_48h_lapset: 'paivystys_palanneet_48h_lapset_prosentti',
      // Tutkimus
      hankkeet: 'tutkimushankkeiden_maara',
      palaute: 'opetuksen_arviointi_keskiarvo',
      julkaisut: 'tieteellisten_julkaisujen_maara'
    };
    return variableNames[key] || `muuttuja_${key}`;
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
            <AlertCircle className="h-4 w-4" />
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

  const getDataSourceBadge = (lastUpdated: string) => {
    const isRecentData = new Date(lastUpdated).getTime() > Date.now() - 24 * 60 * 60 * 1000;
    const isRealData = !lastUpdated.includes('fallback');
    
    if (isRealData && isRecentData) {
      return (
        <Badge variant="default" className="text-xs">
          <Globe className="h-3 w-3 mr-1" />
          THL Sotkanet
        </Badge>
      );
    } else if (isRealData) {
      return (
        <Badge variant="secondary" className="text-xs">
          <Globe className="h-3 w-3 mr-1" />
          THL (vanha)
        </Badge>
      );
    } else {
      return (
        <Badge variant="outline" className="text-xs">
          <AlertCircle className="h-3 w-3 mr-1" />
          Simuloitu
        </Badge>
      );
    }
  };

  const getMetricCards = () => {
    return Object.entries(metrics).map(([key, data]: [string, MetricData]) => {
      const percentage = Math.min((data.value / data.target) * 100, 100);
      const isOnTarget = data.value >= data.target;
      const variableName = getVariableName(key);
      const displayName = getMetricDisplayName(key);
      
      return (
        <Card key={key} className="relative">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-sm font-medium">
                  {displayName}
                </CardTitle>
                <div className="text-xs text-muted-foreground mt-1">
                  Muuttuja: {variableName}
                </div>
              </div>
              <div className="flex flex-col items-end gap-1">
                {getDataSourceBadge(data.lastUpdated)}
                <Badge variant={isOnTarget ? "default" : "destructive"}>
                  {data.trend === 'up' ? (
                    <TrendingUp className="h-3 w-3 mr-1" />
                  ) : (
                    <TrendingDown className="h-3 w-3 mr-1" />
                  )}
                  {data.trend === 'up' ? '+' : '-'}5%
                </Badge>
              </div>
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
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">{getAreaTitle()} - {locationName}</h3>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Database className="h-4 w-4" />
          Supabase data päivitetty: {new Date().toLocaleTimeString('fi-FI', { hour: '2-digit', minute: '2-digit' })}
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {getMetricCards()}
      </div>

      {/* Data Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Haetut tiedot - Taulukkomuoto
          </CardTitle>
          <CardDescription>
            Yksityiskohtainen näkymä kaikista haetuista mittareista uusilla Sotkanet-indikaattoreilla
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Mittari</TableHead>
                <TableHead>Muuttuja</TableHead>
                <TableHead>Sotkanet ID</TableHead>
                <TableHead>Arvo</TableHead>
                <TableHead>Tavoite</TableHead>
                <TableHead>Yksikkö</TableHead>
                <TableHead>Trendi</TableHead>
                <TableHead>Tietolähde</TableHead>
                <TableHead>Päivitetty</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {Object.entries(metrics).map(([key, data]: [string, MetricData]) => {
                const variableName = getVariableName(key);
                const displayName = getMetricDisplayName(key);
                const isRealData = !data.lastUpdated.includes('fallback');
                
                return (
                  <TableRow key={key}>
                    <TableCell className="font-medium">
                      {displayName}
                    </TableCell>
                    <TableCell className="text-xs font-mono">
                      {variableName}
                    </TableCell>
                    <TableCell className="text-xs">
                      ID: {data.name}
                    </TableCell>
                    <TableCell>
                      <span className="font-semibold">
                        {data.value.toFixed(1)}
                      </span>
                    </TableCell>
                    <TableCell>{data.target}</TableCell>
                    <TableCell>{data.unit || '%'}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        {data.trend === 'up' ? (
                          <TrendingUp className="h-3 w-3 text-green-500" />
                        ) : (
                          <TrendingDown className="h-3 w-3 text-red-500" />
                        )}
                        <span className="text-xs">
                          {data.trend === 'up' ? '+5%' : '-5%'}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      {isRealData ? (
                        <Badge variant="default" className="text-xs">
                          <Globe className="h-3 w-3 mr-1" />
                          THL
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="text-xs">
                          <AlertCircle className="h-3 w-3 mr-1" />
                          Sim
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {new Date(data.lastUpdated).toLocaleDateString('fi-FI')}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <div className="text-xs text-muted-foreground bg-muted/50 p-3 rounded-lg">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1">
            <Globe className="h-3 w-3" />
            <span>THL Sotkanet = Päivitetyt indikaattorit</span>
          </div>
          <div className="flex items-center gap-1">
            <AlertCircle className="h-3 w-3" />
            <span>Simuloitu = Fallback-data</span>
          </div>
        </div>
      </div>
    </div>
  );
};
