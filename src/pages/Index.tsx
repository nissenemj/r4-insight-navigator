
import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LocationSelector } from '@/components/LocationSelector';
import { HealthcareMetrics } from '@/components/HealthcareMetrics';
import { TrendChart } from '@/components/TrendChart';
import { AlertPanel } from '@/components/AlertPanel';
import { BackendDebug } from '@/components/BackendDebug';

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
              <h1 className="text-3xl font-bold text-gray-900">
                R4 Insight Navigator
              </h1>
              <p className="text-gray-600 mt-1">
                Pohjois-Savon hyvinvointialueen terveydenhuollon tunnusluvut ja analytiikka
              </p>
            </div>
            <LocationSelector 
              selectedLocation={selectedLocation}
              onLocationChange={setSelectedLocation}
            />
          </div>
        </div>

        {/* Backend Debug Panel - Temporary for debugging */}
        <BackendDebug />

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
              <HealthcareMetrics area={area.id} location={selectedLocation} />
              <TrendChart area={area.id} location={selectedLocation} />
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
