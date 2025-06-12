
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const url = new URL(req.url);
    const path = url.pathname;
    const params = url.searchParams;

    console.log(`🔍 Sotkanet API request: ${req.method} ${path}`);
    console.log('Query params:', Object.fromEntries(params.entries()));

    // Health check endpoint
    if (path.endsWith('/health')) {
      return new Response(
        JSON.stringify({
          status: 'OK',
          timestamp: new Date().toISOString(),
          service: 'Sotkanet API Integration',
          version: '1.0.0'
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Get cached data or fetch from THL Sotkanet
    if (path.includes('/data/')) {
      const indicatorId = path.split('/data/')[1].split('?')[0];
      const region = params.get('region') || '974';
      const year = params.get('year') || '2023';
      
      console.log(`Fetching data for indicator ${indicatorId}, region ${region}, year ${year}`);
      
      // Check cache first
      const cacheKey = `data_${indicatorId}_${region}_${year}`;
      const { data: cachedData } = await supabase
        .from('sotkanet_cache')
        .select('data')
        .eq('cache_key', cacheKey)
        .gt('expires_at', new Date().toISOString())
        .maybeSingle();

      if (cachedData) {
        console.log('✅ Returning cached data');
        return new Response(
          JSON.stringify(cachedData.data),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Fetch from THL Sotkanet API
      try {
        const sotkanetUrl = `https://sotkanet.fi/rest/1.1/json?indicator=${indicatorId}&years=${year}&genders=total&region=${region}`;
        console.log(`🌐 Fetching from Sotkanet: ${sotkanetUrl}`);
        
        const response = await fetch(sotkanetUrl);
        
        if (!response.ok) {
          throw new Error(`Sotkanet API error: ${response.status} ${response.statusText}`);
        }
        
        const data = await response.json();
        console.log(`📊 Received ${Array.isArray(data) ? data.length : 1} data points from Sotkanet`);

        // Cache the result for 1 hour
        const expiresAt = new Date(Date.now() + 60 * 60 * 1000).toISOString();
        await supabase
          .from('sotkanet_cache')
          .upsert({
            cache_key: cacheKey,
            data: data,
            expires_at: expiresAt
          });

        // Store data in health_metrics table
        if (Array.isArray(data) && data.length > 0) {
          const { data: indicator } = await supabase
            .from('indicators')
            .select('id')
            .eq('sotkanet_id', parseInt(indicatorId))
            .maybeSingle();

          if (indicator) {
            const metricsData = data.map(item => ({
              indicator_id: indicator.id,
              region_code: region,
              year: parseInt(year),
              value: item.value,
              absolute_value: item.absoluteValue || item.value,
              gender: item.gender || 'total',
              data_source: 'sotkanet'
            }));

            await supabase
              .from('health_metrics')
              .upsert(metricsData, { 
                onConflict: 'indicator_id,region_code,year,gender',
                ignoreDuplicates: false 
              });
          }
        }

        return new Response(
          JSON.stringify(data),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      } catch (error) {
        console.error('❌ Sotkanet API error:', error);
        return new Response(
          JSON.stringify({ 
            error: 'Failed to fetch from Sotkanet API',
            message: error.message,
            timestamp: new Date().toISOString()
          }),
          { 
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        );
      }
    }

    // Get multiple indicators
    if (path.includes('/multiple')) {
      const indicators = params.get('indicators')?.split(',') || [];
      const region = params.get('region') || '974';
      const year = params.get('year') || '2023';
      
      console.log(`Fetching multiple indicators: ${indicators.join(', ')}`);
      
      const results = {};
      
      for (const indicatorId of indicators) {
        try {
          const cacheKey = `data_${indicatorId}_${region}_${year}`;
          const { data: cachedData } = await supabase
            .from('sotkanet_cache')
            .select('data')
            .eq('cache_key', cacheKey)
            .gt('expires_at', new Date().toISOString())
            .maybeSingle();

          if (cachedData) {
            results[indicatorId] = cachedData.data;
          } else {
            // Fetch from Sotkanet if not cached
            const sotkanetUrl = `https://sotkanet.fi/rest/1.1/json?indicator=${indicatorId}&years=${year}&genders=total&region=${region}`;
            const response = await fetch(sotkanetUrl);
            
            if (response.ok) {
              const data = await response.json();
              results[indicatorId] = data;
              
              // Cache result
              const expiresAt = new Date(Date.now() + 60 * 60 * 1000).toISOString();
              await supabase
                .from('sotkanet_cache')
                .upsert({
                  cache_key: cacheKey,
                  data: data,
                  expires_at: expiresAt
                });
            }
          }
        } catch (error) {
          console.error(`Error fetching indicator ${indicatorId}:`, error);
          results[indicatorId] = [];
        }
      }
      
      return new Response(
        JSON.stringify(results),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get indicators list
    if (path.endsWith('/indicators')) {
      const { data: indicators, error } = await supabase
        .from('indicators')
        .select('*')
        .order('title');

      if (error) {
        throw error;
      }

      return new Response(
        JSON.stringify(indicators),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get regions list
    if (path.endsWith('/regions')) {
      const { data: regions, error } = await supabase
        .from('regions')
        .select('*')
        .order('name');

      if (error) {
        throw error;
      }

      return new Response(
        JSON.stringify(regions),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ error: 'Not found' }),
      { 
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('❌ Function error:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error',
        message: error.message,
        timestamp: new Date().toISOString()
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
})
