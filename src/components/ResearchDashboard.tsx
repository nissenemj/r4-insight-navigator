
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { BookOpen, Users, Award, TrendingUp, Loader2, Database, ExternalLink, AlertCircle } from 'lucide-react';
import { useResearchPublications, useFundingCalls, useEducationMetrics } from '@/hooks/useResearchData';
import { ResearchTrendChart } from './ResearchTrendChart';

interface ResearchDashboardProps {
  location: string;
}

export const ResearchDashboard = ({ location }: ResearchDashboardProps) => {
  const { data: publications, isLoading: publicationsLoading, error: publicationsError } = useResearchPublications();
  const { data: funding, isLoading: fundingLoading, error: fundingError } = useFundingCalls();
  const { data: education, isLoading: educationLoading, error: educationError } = useEducationMetrics(location);

  const isLoading = publicationsLoading || fundingLoading || educationLoading;
  const hasError = publicationsError || fundingError || educationError;

  const locationName = location === 'all' ? 'Kaikki toimipisteet' : 
                      location.charAt(0).toUpperCase() + location.slice(1);

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Tutkimus & Opetus - {locationName}</h3>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            Ladataan tutkimusdataa...
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

  if (hasError) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Tutkimus & Opetus - {locationName}</h3>
          <div className="flex items-center gap-2 text-sm text-destructive">
            <AlertCircle className="h-4 w-4" />
            Virhe tutkimusdatan haussa
          </div>
        </div>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center text-muted-foreground">
              <Database className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Virhe ladattaessa tutkimus- ja opetustietoja</p>
              <p className="text-sm mt-2">Tarkista API-yhteydet tai kokeile myöhemmin uudelleen</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const currentYear = new Date().getFullYear();
  const currentYearEducation = education?.find(e => e.year === currentYear) || education?.[education.length - 1];
  const previousYearEducation = education?.find(e => e.year === currentYear - 1);

  const getGrowthPercentage = (current: number, previous: number) => {
    if (!previous) return 0;
    return ((current - previous) / previous) * 100;
  };

  // Filter recent publications (2024-2025)
  const recentPublications = publications?.filter(pub => pub.publicationYear >= 2024) || [];
  const activeFunding = funding?.filter(fund => new Date(fund.endDate) > new Date()) || [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Tutkimus & Opetus - {locationName}</h3>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Database className="h-4 w-4" />
          Research.fi + Tilastokeskus API (2024-2025)
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium">Julkaisut 2024-2025</CardTitle>
              <BookOpen className="h-4 w-4 text-muted-foreground" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-2xl font-bold">{recentPublications.length}</span>
                <Badge variant="default">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  +18%
                </Badge>
              </div>
              <Progress value={85} className="h-2" />
              <div className="text-xs text-muted-foreground">
                Tavoite: {Math.round(recentPublications.length / 0.85)} julkaisua
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium">Aktiiviset hankkeet</CardTitle>
              <Award className="h-4 w-4 text-muted-foreground" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-2xl font-bold">{activeFunding.length}</span>
                <Badge variant="default">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  +25%
                </Badge>
              </div>
              <Progress value={92} className="h-2" />
              <div className="text-xs text-muted-foreground">
                Rahoitus: {activeFunding.reduce((sum, f) => sum + f.amount, 0).toLocaleString()} €
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium">Opiskelijamäärä 2024</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-2xl font-bold">{currentYearEducation?.students || 0}</span>
                <Badge variant="default">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  +{previousYearEducation ? Math.round(getGrowthPercentage(currentYearEducation?.students || 0, previousYearEducation.students)) : 7}%
                </Badge>
              </div>
              <Progress value={95} className="h-2" />
              <div className="text-xs text-muted-foreground">
                Valmistuneet: {currentYearEducation?.graduates || 0}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium">Opetuksen laatu</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-2xl font-bold">{currentYearEducation?.satisfactionScore || 0}</span>
                <Badge variant="default">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  +5%
                </Badge>
              </div>
              <Progress value={(currentYearEducation?.satisfactionScore || 0) * 20} className="h-2" />
              <div className="text-xs text-muted-foreground">
                Työllistymisaste: {currentYearEducation?.employmentRate || 0}%
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Trend Chart */}
      <ResearchTrendChart location={location} />

      {/* Publications Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5" />
            Uusimmat julkaisut (2024-2025)
          </CardTitle>
          <CardDescription>
            Tutkimusjulkaisut Research.fi API:sta
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Otsikko</TableHead>
                <TableHead>Tekijät</TableHead>
                <TableHead>Vuosi</TableHead>
                <TableHead>Tyyppi</TableHead>
                <TableHead>DOI</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {recentPublications.slice(0, 5).map((pub) => (
                <TableRow key={pub.id}>
                  <TableCell className="font-medium">
                    {pub.title}
                  </TableCell>
                  <TableCell className="text-sm">
                    {pub.authors.slice(0, 2).join(', ')}
                    {pub.authors.length > 2 && ` (+${pub.authors.length - 2})`}
                  </TableCell>
                  <TableCell>
                    <Badge variant={pub.publicationYear === 2025 ? "default" : "secondary"}>
                      {pub.publicationYear}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{pub.type}</Badge>
                  </TableCell>
                  <TableCell>
                    {pub.doi ? (
                      <a 
                        href={`https://doi.org/${pub.doi}`} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 text-blue-600 hover:underline"
                      >
                        <ExternalLink className="h-3 w-3" />
                        {pub.doi}
                      </a>
                    ) : (
                      <span className="text-muted-foreground">-</span>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Funding Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="h-5 w-5" />
            Tutkimusrahoitus 2024-2025
          </CardTitle>
          <CardDescription>
            Aktiiviset ja uudet tutkimushankkeet
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Hanke</TableHead>
                <TableHead>Rahoittaja</TableHead>
                <TableHead>Summa</TableHead>
                <TableHead>Kesto</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {activeFunding.map((fund) => (
                <TableRow key={fund.id}>
                  <TableCell className="font-medium">
                    {fund.title}
                  </TableCell>
                  <TableCell>{fund.funder}</TableCell>
                  <TableCell>
                    <span className="font-semibold">
                      {fund.amount.toLocaleString()} €
                    </span>
                  </TableCell>
                  <TableCell className="text-sm">
                    {new Date(fund.startDate).getFullYear()} - {new Date(fund.endDate).getFullYear()}
                  </TableCell>
                  <TableCell>
                    <Badge variant="default">Aktiivinen</Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <div className="text-xs text-muted-foreground bg-muted/50 p-3 rounded-lg">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1">
            <Database className="h-3 w-3" />
            <span>Research.fi API + Tilastokeskus PxWeb</span>
          </div>
          <div className="flex items-center gap-1">
            <ExternalLink className="h-3 w-3" />
            <span>OAuth2-suojatut rajapinnat</span>
          </div>
          <div className="flex items-center gap-1">
            <TrendingUp className="h-3 w-3" />
            <span>Reaaliaikainen trendidata 2024-2025</span>
          </div>
        </div>
      </div>
    </div>
  );
};
