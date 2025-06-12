
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { sotkanetService } from '@/services/sotkanetService';
import { Loader2, CheckCircle, XCircle, RefreshCw } from 'lucide-react';

export const BackendDebug = () => {
  const [isChecking, setIsChecking] = useState(false);
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const testBackendConnection = async () => {
    setIsChecking(true);
    setStatus('idle');
    setResult(null);
    setError(null);
    
    console.log('🔧 Debug: Starting backend connection test...');
    
    try {
      console.log('🔧 Debug: Calling healthCheck...');
      const healthResult = await sotkanetService.healthCheck();
      console.log('🔧 Debug: Health check completed:', healthResult);
      
      setStatus('success');
      setResult(healthResult);
      setError(null);
    } catch (err) {
      console.error('🔧 Debug: Health check failed:', err);
      setStatus('error');
      setResult(null);
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setIsChecking(false);
    }
  };

  const getStatusIcon = () => {
    if (isChecking) return <Loader2 className="h-4 w-4 animate-spin" />;
    if (status === 'success') return <CheckCircle className="h-4 w-4 text-green-600" />;
    if (status === 'error') return <XCircle className="h-4 w-4 text-red-600" />;
    return <RefreshCw className="h-4 w-4" />;
  };

  const getStatusBadge = () => {
    if (status === 'success') return <Badge className="bg-green-100 text-green-800">Connected</Badge>;
    if (status === 'error') return <Badge variant="destructive">Failed</Badge>;
    return <Badge variant="secondary">Unknown</Badge>;
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          Backend Connection Debug
          {getStatusBadge()}
        </CardTitle>
        <CardDescription>
          Test connection to backend server at port 3001
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button 
          onClick={testBackendConnection} 
          disabled={isChecking}
          className="w-full"
        >
          {getStatusIcon()}
          {isChecking ? 'Testing Connection...' : 'Test Backend Connection'}
        </Button>
        
        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-md">
            <h4 className="font-medium text-red-800 mb-2">Connection Error:</h4>
            <p className="text-red-700 text-sm">{error}</p>
          </div>
        )}
        
        {result && (
          <div className="p-4 bg-green-50 border border-green-200 rounded-md">
            <h4 className="font-medium text-green-800 mb-2">Backend Response:</h4>
            <pre className="text-green-700 text-xs overflow-auto">
              {JSON.stringify(result, null, 2)}
            </pre>
          </div>
        )}
        
        <div className="text-xs text-muted-foreground">
          <p>Backend URL: https://tixdqgipsacxnfocsuxm.supabase.co/functions/v1/sotkanet-api</p>
          <p>Check browser console for detailed logs</p>
        </div>
      </CardContent>
    </Card>
  );
};
