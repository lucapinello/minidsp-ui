import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export const ConnectionHeader = ({ 
  hostname, 
  onHostnameChange, 
  onConnect,
  isMockMode,
  status 
}) => {
  const handleConnectionClick = () => {
    if (status === 'connected') {
      onConnect();
    } else {
      onConnect();
    }
  };

  return (
    <div className="w-[400px] mx-auto mb-8">
      <div className="space-y-4 p-4 border rounded-lg">
        <div className="space-y-2">
          <Label htmlFor="hostname">Hostname</Label>
          <Input
            id="hostname"
            data-testid="hostname-input"
            value={hostname}
            onChange={(e) => onHostnameChange(e.target.value)}
            placeholder={isMockMode ? "Using mock implementation" : "Enter hostname or IP"}
          />
        </div>
        <Button 
          className="w-full" 
          onClick={handleConnectionClick}
          variant={status === 'connected' ? 'destructive' : 'default'}
          data-testid="connect-button"
        >
          {status === 'connected' ? 'Disconnect' : 'Connect'}
        </Button>
        {status === 'error' && (
          <p className="text-sm text-red-500">Failed to connect. Please check the hostname and try again.</p>
        )}
      </div>
    </div>
  );
}; 