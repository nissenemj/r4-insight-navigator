
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface RealtimeDataHook {
  isConnected: boolean;
  lastUpdate: string | null;
  syncData: () => Promise<void>;
  isLoading: boolean;
}

export const useRealtimeData = (area: string, location: string): RealtimeDataHook => {
  const [isConnected, setIsConnected] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    console.log('🔗 Setting up realtime connection for health_metrics');
    
    const channel = supabase
      .channel('health_metrics_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'health_metrics'
        },
        (payload) => {
          console.log('📊 Real-time update received:', payload);
          setLastUpdate(new Date().toISOString());
          
          if (payload.eventType === 'INSERT' || payload.eventType === 'UPDATE') {
            toast({
              title: "Tiedot päivitetty",
              description: "Uutta terveysdata on saatavilla.",
            });
          }
        }
      )
      .on('subscribe', (status) => {
        console.log('📡 Realtime subscription status:', status);
        setIsConnected(status === 'SUBSCRIBED');
      })
      .subscribe();

    return () => {
      console.log('🔌 Cleaning up realtime connection');
      supabase.removeChannel(channel);
      setIsConnected(false);
    };
  }, [area, location, toast]);

  const syncData = async () => {
    setIsLoading(true);
    try {
      console.log('🔄 Triggering data sync via Edge Function');
      
      const regionCode = location === 'all' ? '974' : location;
      const currentYear = new Date().getFullYear();
      
      const { data, error } = await supabase.functions.invoke('sotkanet-api', {
        body: {
          path: '/sync',
          region: regionCode,
          year: currentYear.toString()
        }
      });

      if (error) {
        throw error;
      }

      console.log('✅ Data sync completed:', data);
      
      toast({
        title: "Tietojen synkronointi onnistui",
        description: `Synkronoitiin ${data?.synced_count || 0}/${data?.total_indicators || 0} indikaattoria.`,
      });
      
      setLastUpdate(new Date().toISOString());
    } catch (error) {
      console.error('❌ Data sync failed:', error);
      toast({
        title: "Synkronointi epäonnistui",
        description: "Tietojen päivitys epäonnistui. Yritä uudelleen.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isConnected,
    lastUpdate,
    syncData,
    isLoading
  };
};
