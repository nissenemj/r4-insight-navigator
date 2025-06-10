
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, CheckCircle, Info, Clock } from 'lucide-react';

interface AlertPanelProps {
  location: string;
}

export const AlertPanel = ({ location }: AlertPanelProps) => {
  // Simuloitu hälytysdata
  const getAlerts = () => {
    const alerts = [
      {
        id: 1,
        type: 'warning',
        title: 'Hoitotakuu vaarassa',
        description: 'Leikkaustoiminnan jonotusajat ylittävät tavoitteen Kuopiossa',
        location: 'kuopio',
        severity: 'high',
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2h sitten
      },
      {
        id: 2,
        type: 'success',
        title: 'Digipalvelut tavoitteessa',
        description: 'Digitaalisten palvelujen käyttöaste saavutti 80% tavoitteen Iisalmessa',
        location: 'iisalmi',
        severity: 'low',
        timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000), // 4h sitten
      },
      {
        id: 3,
        type: 'info',
        title: 'Päivystyksen ruuhka',
        description: 'Odotusajat hieman koholla iltapäivän aikana Varkauden päivystyksessä',
        location: 'varkaus',
        severity: 'medium',
        timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000), // 1h sitten
      },
    ];

    // Suodata hälytykset sijainnin mukaan
    if (location === 'all') {
      return alerts;
    }
    return alerts.filter(alert => alert.location === location);
  };

  const alerts = getAlerts();

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-destructive" />;
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'info':
        return <Info className="h-4 w-4 text-blue-600" />;
      default:
        return <Info className="h-4 w-4" />;
    }
  };

  const getSeverityBadge = (severity: string) => {
    const variants = {
      high: 'destructive',
      medium: 'secondary',
      low: 'default'
    } as const;
    
    return (
      <Badge variant={variants[severity as keyof typeof variants] || 'default'}>
        {severity === 'high' ? 'Kiireellinen' : 
         severity === 'medium' ? 'Keskitaso' : 'Matala'}
      </Badge>
    );
  };

  if (alerts.length === 0) {
    return (
      <Alert>
        <CheckCircle className="h-4 w-4 text-green-600" />
        <AlertDescription>
          Ei aktiivisia hälytyksiä. Kaikki mittarit ovat tavoitteiden mukaisesti.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-destructive" />
          Hälytykset ja ilmoitukset ({alerts.length})
        </CardTitle>
        <CardDescription>
          Automaattiset hälytykset poikkeamista ja tavoitteiden saavuttamisesta
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {alerts.map((alert) => (
            <Alert key={alert.id}>
              <div className="flex items-start justify-between w-full">
                <div className="flex items-start gap-3">
                  {getAlertIcon(alert.type)}
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-medium">{alert.title}</h4>
                      {getSeverityBadge(alert.severity)}
                    </div>
                    <AlertDescription>{alert.description}</AlertDescription>
                    <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      {alert.timestamp.toLocaleString('fi-FI')}
                      <span>•</span>
                      <span className="capitalize">{alert.location}</span>
                    </div>
                  </div>
                </div>
              </div>
            </Alert>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
