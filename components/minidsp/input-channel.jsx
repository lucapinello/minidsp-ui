import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Meter } from "@/components/ui/meter";

export const InputChannel = ({
  label,
  gain = -127,
  mute = false,
  meterLevels = { rms: -60, peak: -60 },
  onGainChange,
  onMuteChange,
  testId
}) => {
  return (
    <div className="border rounded-lg p-4 flex flex-col h-[400px]">
      <div className="text-base font-medium mb-4">{label}</div>
      
      {/* Meter section */}
      <div className="mb-8 h-[120px]">
        <Meter
          testId={`input-${label}-meter`}
          rmsLevel={meterLevels?.rms ?? -60}
          peakLevel={meterLevels?.peak ?? -60}
        />
      </div>

      {/* Controls section */}
      <div className="space-y-6 flex-1">
        <div className="space-y-2">
          <Label htmlFor={`${label}-gain`} className="text-sm text-muted-foreground">
            Gain
          </Label>
          <Slider
            id={`${label}-gain`}
            data-testid={`input-${label}-gain`}
            value={[gain ?? -127]}
            onValueChange={([value]) => onGainChange(Math.min(0, Math.max(-127, value)))}
            min={-127}
            max={0}
            step={0.5}
            dir="ltr"
          />
          <div className="text-right text-sm text-muted-foreground">
            {(gain ?? -127).toFixed(1)} dB
          </div>
        </div>

        <Button
          variant="secondary"
          onClick={() => onMuteChange(!mute)}
        >
          {mute ? "Unmute" : "Mute"}
        </Button>
      </div>
    </div>
  );
}; 