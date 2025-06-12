
import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LocationSelector } from '@/components/LocationSelector';
import { SupabaseHealthcareMetrics } from '@/components/SupabaseHealthcareMetrics';
import { SupabaseTrendChart } from '@/components/SupabaseTrendChart';
import { AlertPanel } from '@/components/AlertPanel';
import { Badge } from '@/components/ui/badge';
import { Database, Server } from 'lucide-react';

const Index = () => {
  const [selectedLocation, setSelectedLocation] = useState('kuopio');
  const [selectedArea, setSelectedArea] = useState('avoterveydenhuolto');

  const areas = [
    { id: 'avoterveydenhuolto', label: 'Avoterveydenhuolto' },
    { id: 'leikkaustoiminta', label: 'Leikkaustoiminta' },
    { id: 'paivystys', label: 'Päivystys' },
    { id: 'tutkimus', label: 'Tutkimus & Opetus' }
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-3xl font-bold text-gray-900">
                  R4 Insight Navigator
                </h1>
                <Badge variant="secondary" className="flex items-center gap-1">
                  <Database className="h-3 w-3" />
                  Supabase
                </Badge>
              </div>
              <p className="text-gray-600">
                Pohjois-Savon hyvinvointialueen terveydenhuollon tunnusluvut ja analytiikka
              </p>
              <div className="flex items-center gap-2 mt-2 text-sm text-muted-foreground">
                <Server className="h-4 w-4" />
                Backend: Supabase + THL Sotkanet API integraatio
              </div>
            </div>
            <LocationSelector 
              selectedLocation={selectedLocation}
              onLocationChange={setSelectedLocation}
            />
          </div>
        </div>

        {/* Area Selection */}
        <Tabs value={selectedArea} onValueChange={setSelectedArea} className="w-full">
          <TabsList className="grid w-full grid-cols-2 md:grid-cols-4">
            {areas.map((area) => (
              <TabsTrigger key={area.id} value={area.id} className="text-xs md:text-sm">
                {area.label}
              </TabsTrigger>
            ))}
          </TabsList>

          {areas.map((area) => (
            <TabsContent key={area.id} value={area.id} className="space-y-6">
              <SupabaseHealthcareMetrics area={area.id} location={selectedLocation} />
              <SupabaseTrendChart area={area.id} location={selectedLocation} />
            </TabsContent>
          ))}
        </Tabs>

        {/* Alerts Panel */}
        <AlertPanel location={selectedLocation} />
      </div>
    </div>
  );
};

export default Index;
