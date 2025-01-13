import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';

export const OutputChannel = ({ 
  label, 
  gain, 
  delay, 
  inverted, 
  mute, 
  onGainChange, 
  onDelayChange, 
  onInvertedChange, 
  onMuteChange 
}) => {
  return (
    <div className="space-y-2 p-4 border rounded-lg">
      <div className="flex justify-between items-center">
        <Label className="text-lg font-semibold">{label}</Label>
        <div className="space-x-2">
          <Button 
            variant={inverted ? "default" : "secondary"}
            size="sm"
            onClick={() => onInvertedChange(!inverted)}
          >
            {inverted ? "Inverted" : "Invert"}
          </Button>
          <Button 
            variant={mute ? "destructive" : "secondary"}
            size="sm"
            onClick={() => onMuteChange(!mute)}
          >
            {mute ? "Muted" : "Mute"}
          </Button>
        </div>
      </div>
      <div className="space-y-4">
        <div>
          <div className="flex justify-between mb-2">
            <Label className="text-sm text-muted-foreground">Gain</Label>
            <span className="text-sm">{gain.toFixed(1)} dB</span>
          </div>
          <Slider
            value={[gain]}
            onValueChange={([value]) => onGainChange(Math.min(0, Math.max(-127, value)))}
            min={-127}
            max={0}
            step={0.5}
            className="w-full bg-blue-50"
          />
        </div>
        <div>
          <div className="flex justify-between mb-2">
            <Label className="text-sm text-muted-foreground">Delay</Label>
            <span className="text-sm">{delay.toFixed(1)} ms</span>
          </div>
          <Slider
            value={[delay]}
            onValueChange={([value]) => onDelayChange(value)}
            min={0}
            max={100}
            step={0.1}
            className="w-full bg-blue-50"
          />
        </div>
      </div>
    </div>
  );
}; 