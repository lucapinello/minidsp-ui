import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Meter } from "@/components/ui/meter";
import { formatGain, formatDelay } from '@/lib/utils/formatting';
import { validateGain, validateDelay } from '@/lib/utils/validation';

export const OutputChannel = ({ 
  label, 
  gain = -127,
  delay = 0,
  inverted = false,
  mute = false,
  meterLevels = { rms: -60, peak: -60 },
  onGainChange,
  onDelayChange,
  onInvertedChange,
  onMuteChange,
  testId
}) => {
  return (
    <div className="border rounded-lg p-4 flex flex-col h-[400px]">
      <div className="text-base font-medium mb-4">{label}</div>
      
      {/* Meter section */}
      <div className="mb-8 h-[120px]">
        <Meter
          testId={`output-${label}-meter`}
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
            data-testid={`output-${label}-gain`}
            value={[gain ?? -127]}
            onValueChange={([value]) => onGainChange(validateGain(value))}
            min={-127}
            max={0}
            step={0.5}
            dir="ltr"
          />
          <div className="text-right text-sm text-muted-foreground">
            {formatGain(gain ?? -127)}
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor={`${label}-delay`} className="text-sm text-muted-foreground">
            Delay
          </Label>
          <Slider
            id={`${label}-delay`}
            value={[delay ?? 0]}
            onValueChange={([value]) => onDelayChange(validateDelay(value))}
            min={0}
            max={80}
            step={0.02}
            dir="ltr"
          />
          <div className="text-right text-sm text-muted-foreground">
            {formatDelay(delay ?? 0)}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <Button
            variant="secondary"
            onClick={() => onMuteChange(!mute)}
          >
            {mute ? "Unmute" : "Mute"}
          </Button>
          <Button
            variant="secondary"
            onClick={() => onInvertedChange(!inverted)}
          >
            {inverted ? "Normal" : "Invert"}
          </Button>
        </div>
      </div>
    </div>
  );
}; 