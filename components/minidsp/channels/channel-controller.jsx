import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';

export const ChannelController = ({ label, gain, onGainChange }) => {
  return (
    <div className="space-y-2">
      <Label className="text-sm text-muted-foreground">{label}</Label>
      <div className="flex items-center space-x-4">
        <div className="flex-1">
          <Slider
            value={[gain ?? -127]}
            onValueChange={([value]) => onGainChange(Math.min(0, Math.max(-127, value)))}
            min={-127}
            max={0}
            step={0.5}
            className="w-full bg-blue-50"
            dir="ltr"
          />
        </div>
        <span className="w-16 text-right">{(gain ?? -127).toFixed(1)} dB</span>
      </div>
    </div>
  );
}; 