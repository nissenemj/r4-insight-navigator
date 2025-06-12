
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2, RefreshCw, Database, Globe, AlertCircle, CheckCircle } from 'lucide-react';
import { supabaseService } from '@/services/supabaseService';
import { useToast } from '@/hooks/use-toast';

interface DataSyncPanelProps {
  area: string;
  location: string;
}

export const DataSyncPanel = ({ area, location }: DataSyncPanelProps) => {
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSyncResult, setLastSyncResult] = useState<any>(null);
  const { toast } = useToast();

  const handleSync = async () => {
    setIsSyncing(true);
    try {
      console.log(`🔄 Aloitetaan datan synkronointi alueelle: ${location}`);
      
      const regionCode = location === 'all' ? '974' : location;
      const currentYear = new Date().getFullYear();
      
      const result = await supabaseService.syncAllData(regionCode, currentYear);
      
      console.log('✅ Synkronointi valmis:', result);
      setLastSyncResult(result);
      
      toast({
        title: "Tiedot synkronoitu",
        description: `Synkronoitiin ${result.synced_count}/${result.total_indicators} indikaattoria onnistuneesti.`,
      });
      
      // Päivitä sivu automaattisesti näyttämään uudet tiedot
      window.location.reload();
      
    } catch (error) {
      console.error('❌ Synkronointivirhe:', error);
      toast({
        title: "Synkronointivirhe",
        description: `Virhe synkronoinnissa: ${error instanceof Error ? error.message : 'Tuntematon virhe'}`,
        variant: "destructive",
      });
    } finally {
      setIsSyncing(false);
    }
  };

  const getSyncStatusBadge = (status: string) => {
    switch (status) {
      case 'synced':
      case 'inserted':
        return (
          <Badge variant="default" className="text-xs">
            <Globe className="h-3 w-3 mr-1" />
            THL Sotkanet
          </Badge>
        );
      case 'fallback_created':
      case 'fallback_inserted':
        return (
          <Badge variant="outline" className="text-xs">
            <AlertCircle className="h-3 w-3 mr-1" />
            Simuloitu
          </Badge>
        );
      case 'error':
        return (
          <Badge variant="destructive" className="text-xs">
            Virhe
          </Badge>
        );
      default:
        return null;
    }
  };

  return (
    <Card>
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              Tietojen synkronointi
            </CardTitle>
            <CardDescription>
              Hae uusimmat tiedot THL Sotkanetista Supabase-tietokantaan
            </CardDescription>
          </div>
          <Button 
            onClick={handleSync}
            disabled={isSyncing}
            variant="outline"
            className="min-w-[140px]"
          >
            {isSyncing ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Synkronoidaan...
              </>
            ) : (
              <>
                <RefreshCw className="h-4 w-4 mr-2" />
                Synkronoi tiedot
              </>
            )}
          </Button>
        </div>
      </CardHeader>
      
      {lastSyncResult && (
        <CardContent className="pt-0">
          <div className="space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Viimeisin synkronointi:</span>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span>{new Date(lastSyncResult.timestamp).toLocaleString('fi-FI')}</span>
              </div>
            </div>
            
            <div className="text-sm">
              <span className="text-muted-foreground">Tulos: </span>
              <span className="font-medium">
                {lastSyncResult.synced_count}/{lastSyncResult.total_indicators} indikaattoria synkronoitu
              </span>
            </div>

            {lastSyncResult.results && lastSyncResult.results.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-sm font-medium text-muted-foreground">Indikaattorikohtaiset tulokset:</h4>
                <div className="max-h-32 overflow-y-auto space-y-1">
                  {lastSyncResult.results.map((result: any, index: number) => (
                    <div key={index} className="flex items-center justify-between text-xs p-2 bg-muted/50 rounded">
                      <span className="truncate flex-1">{result.title}</span>
                      <div className="flex items-center gap-2 ml-2">
                        {getSyncStatusBadge(result.status)}
                        {result.records && (
                          <span className="text-muted-foreground">
                            {result.records} tietuetta
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="text-xs text-muted-foreground bg-muted/30 p-2 rounded">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1">
                  <Globe className="h-3 w-3" />
                  <span>THL Sotkanet = Oikea data haettu</span>
                </div>
                <div className="flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  <span>Simuloitu = Varadat käytetty</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      )}
    </Card>
  );
};
