
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { RefreshCw, Wifi, WifiOff, Database, Clock } from 'lucide-react';
import { useRealtimeData } from '@/hooks/useRealtimeData';

interface DataSyncPanelProps {
  area: string;
  location: string;
}

export const DataSyncPanel = ({ area, location }: DataSyncPanelProps) => {
  const { isConnected, lastUpdate, syncData, isLoading } = useRealtimeData(area, location);

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg flex items-center gap-2">
              <Database className="h-5 w-5" />
              Tietojen synkronointi
            </CardTitle>
            <CardDescription>
              Reaaliaikainen yhteys THL Sotkanet API:in
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant={isConnected ? "default" : "secondary"} className="flex items-center gap-1">
              {isConnected ? (
                <>
                  <Wifi className="h-3 w-3" />
                  Yhdistetty
                </>
              ) : (
                <>
                  <WifiOff className="h-3 w-3" />
                  Ei yhteyttä
                </>
              )}
            </Badge>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Clock className="h-4 w-4" />
            {lastUpdate ? (
              <span>
                Viimeksi päivitetty: {new Date(lastUpdate).toLocaleTimeString('fi-FI')}
              </span>
            ) : (
              <span>Ei päivityksiä</span>
            )}
          </div>
          
          <Button
            onClick={syncData}
            disabled={isLoading}
            variant="outline"
            size="sm"
            className="flex items-center gap-2"
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            {isLoading ? 'Synkronoidaan...' : 'Päivitä tiedot'}
          </Button>
        </div>
        
        <Separator />
        
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="font-medium">Alue:</span>
            <p className="text-muted-foreground capitalize">{area.replace(/([A-Z])/g, ' $1')}</p>
          </div>
          <div>
            <span className="font-medium">Sijainti:</span>
            <p className="text-muted-foreground capitalize">{location}</p>
          </div>
        </div>
        
        <div className="text-xs text-muted-foreground">
          <p>• Tiedot haetaan THL Sotkanet API:sta</p>
          <p>• Automaattiset päivitykset reaaliajassa</p>
          <p>• Välimuisti päivittyy tunnin välein</p>
        </div>
      </CardContent>
    </Card>
  );
};
