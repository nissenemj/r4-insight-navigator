
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
      .subscribe((status) => {
        console.log('📡 Realtime subscription status:', status);
        setIsConnected(status === 'SUBSCRIBED');
      });

    return () => {
      console.log('🔌 Cleaning up realtime connection');
      channel.unsubscribe();
      setIsConnected(false);
    };
  }, [area, location, toast]);

  const syncData = async () => {
    setIsLoading(true);
    try {
      console.log('🔄 Triggering data sync via Edge Function');
      
      const regionCode = location === 'all' ? '974' : location;
      const currentYear = new Date().getFullYear();
      
      const response = await fetch(`https://tixdqgipsacxnfocsuxm.supabase.co/functions/v1/sotkanet-api/sync?region=${regionCode}&year=${currentYear}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRpeGRxZ2lwc2FjeG5mb2NzdXhtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk3NDQwNTQsImV4cCI6MjA2NTMyMDA1NH0.OzR4sGXoL2fCMnEbDbyNslgpkDGM_d5LSArAOs84MfA`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

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
