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
  return (
    <div className="mt-4">
      <Label htmlFor="minidsp-host">MiniDSP Host</Label>
      <div className="flex gap-2 mt-1">
        <Input
          id="minidsp-host"
          type="text"
          value={hostname}
          onChange={(e) => onHostnameChange(e.target.value)}
          placeholder={isMockMode ? "Development mock mode - any value works" : "Enter hostname or IP (e.g., minidsp.local:5380)"}
          className="flex-1"
        />
        <Button onClick={onConnect} size="sm">
          Connect
        </Button>
      </div>
      {isMockMode && (
        <div className="text-sm text-muted-foreground mt-2">
          Running in development mock mode. Any hostname will work - just click Connect.
        </div>
      )}
      {status && (
        <div className="text-sm text-red-500 mt-4">
          {status}
        </div>
      )}
    </div>
  );
}; 