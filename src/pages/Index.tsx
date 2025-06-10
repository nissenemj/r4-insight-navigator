
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { LocationSelector } from '@/components/LocationSelector';
import { HealthcareMetrics } from '@/components/HealthcareMetrics';
import { TrendChart } from '@/components/TrendChart';
import { AlertPanel } from '@/components/AlertPanel';
import { MapPin, TrendingUp, Activity, Users } from 'lucide-react';

const Index = () => {
  const [selectedLocation, setSelectedLocation] = useState('kuopio');
  const [activeTab, setActiveTab] = useState('avoterveydenhuolto');

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">R4-hanke Tiedolla Johtaminen</h1>
            <p className="text-muted-foreground">
              Terveydenhuollon mittarit ja analytiikka - Kuopio, Iisalmi, Varkaus
            </p>
          </div>
          <div className="flex items-center gap-2">
            <MapPin className="h-5 w-5 text-primary" />
            <LocationSelector 
              selectedLocation={selectedLocation}
              onLocationChange={setSelectedLocation}
            />
          </div>
        </div>

        {/* Alert Panel */}
        <AlertPanel location={selectedLocation} />

        {/* Main Dashboard */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Key Metrics Overview */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Avainmittarit
                </CardTitle>
                <CardDescription>
                  Päivitetty: {new Date().toLocaleDateString('fi-FI')}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-3 bg-primary/10 rounded-lg">
                    <div className="text-2xl font-bold text-primary">18.2M€</div>
                    <div className="text-sm text-muted-foreground">Saavutetut säästöt</div>
                  </div>
                  <div className="p-3 bg-green-100 rounded-lg">
                    <div className="text-2xl font-bold text-green-700">91%</div>
                    <div className="text-sm text-muted-foreground">Hoitotakuu toteutuma</div>
                  </div>
                  <div className="p-3 bg-blue-100 rounded-lg">
                    <div className="text-2xl font-bold text-blue-700">73%</div>
                    <div className="text-sm text-muted-foreground">Digipalvelujen käyttö</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content Area */}
          <div className="lg:col-span-3">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="avoterveydenhuolto">
                  <Activity className="h-4 w-4 mr-2" />
                  Avoterveydenhuolto
                </TabsTrigger>
                <TabsTrigger value="leikkaustoiminta">
                  <Users className="h-4 w-4 mr-2" />
                  Leikkaustoiminta
                </TabsTrigger>
                <TabsTrigger value="paivystys">
                  <Activity className="h-4 w-4 mr-2" />
                  Päivystys
                </TabsTrigger>
                <TabsTrigger value="tutkimus">
                  <TrendingUp className="h-4 w-4 mr-2" />
                  Tutkimus & Opetus
                </TabsTrigger>
              </TabsList>

              <TabsContent value="avoterveydenhuolto" className="space-y-4">
                <HealthcareMetrics 
                  area="avoterveydenhuolto" 
                  location={selectedLocation} 
                />
                <TrendChart 
                  area="avoterveydenhuolto" 
                  location={selectedLocation} 
                />
              </TabsContent>

              <TabsContent value="leikkaustoiminta" className="space-y-4">
                <HealthcareMetrics 
                  area="leikkaustoiminta" 
                  location={selectedLocation} 
                />
                <TrendChart 
                  area="leikkaustoiminta" 
                  location={selectedLocation} 
                />
              </TabsContent>

              <TabsContent value="paivystys" className="space-y-4">
                <HealthcareMetrics 
                  area="paivystys" 
                  location={selectedLocation} 
                />
                <TrendChart 
                  area="paivystys" 
                  location={selectedLocation} 
                />
              </TabsContent>

              <TabsContent value="tutkimus" className="space-y-4">
                <HealthcareMetrics 
                  area="tutkimus" 
                  location={selectedLocation} 
                />
                <TrendChart 
                  area="tutkimus" 
                  location={selectedLocation} 
                />
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
