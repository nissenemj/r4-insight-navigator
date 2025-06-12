
import { useQuery } from '@tanstack/react-query';
import { supabaseService } from '@/services/supabaseService';
import { useToast } from '@/hooks/use-toast';

export const useSupabaseMetrics = (area: string, location: string) => {
  const { toast } = useToast();

  return useQuery({
    queryKey: ['supabase-metrics', area, location],
    queryFn: async () => {
      console.log(`📊 Fetching metrics from Supabase for area: ${area}, location: ${location}`);
      
      try {
        const regionCode = location === 'all' ? '974' : location;
        const data = await supabaseService.getHealthMetrics(area, regionCode);
        
        if (Object.keys(data).length === 0) {
          console.log('No data found in Supabase, showing empty state');
          toast({
            title: "Ei dataa saatavilla",
            description: "Valitulle alueelle ei löytynyt mittaritietoja.",
            variant: "default",
          });
        } else {
          toast({
            title: "Tiedot ladattu",
            description: "Supabase-data ladattu onnistuneesti.",
          });
        }
        
        return data;
      } catch (error) {
        console.error('Error fetching Supabase metrics:', error);
        toast({
          title: "Virhe tietojen haussa",
          description: `Supabase-virhe: ${error instanceof Error ? error.message : 'Tuntematon virhe'}`,
          variant: "destructive",
        });
        throw error;
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 2,
    retryDelay: 1000,
    refetchOnWindowFocus: false,
  });
};

export const useSupabaseTrends = (area: string, location: string) => {
  return useQuery({
    queryKey: ['supabase-trends', area, location],
    queryFn: async () => {
      console.log(`📈 Fetching trends from Supabase for area: ${area}, location: ${location}`);
      
      try {
        const regionCode = location === 'all' ? '974' : location;
        return await supabaseService.getTrendData(area, regionCode);
      } catch (error) {
        console.error('Error fetching Supabase trends:', error);
        throw error;
      }
    },
    staleTime: 10 * 60 * 1000, // 10 minutes
    retry: 1,
    refetchOnWindowFocus: false,
  });
};
