import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Volume2 } from 'lucide-react';
import { cn } from "@/lib/utils";

export const VolumeControls = ({
  masterVolume,
  onVolumeChange,
  mute,
  onMuteToggle
}) => {
  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <Label>Master Volume</Label>
        <div className="flex items-center gap-2 bg-blue-50 rounded-lg px-3 py-1.5">
          <Label htmlFor="master-mute" className="text-sm cursor-pointer select-none">Mute</Label>
          <Switch
            id="master-mute"
            checked={mute}
            onCheckedChange={onMuteToggle}
            className="data-[state=checked]:bg-blue-500 data-[state=unchecked]:bg-blue-200"
          />
        </div>
      </div>
      <div className="flex items-center space-x-4">
        <Volume2 className={cn("h-5 w-5", mute && "opacity-50")} />
        <div className="flex-1">
          <Slider
            value={[masterVolume]}
            onValueChange={([value]) => onVolumeChange(value)}
            min={-127}
            max={0}
            step={0.5}
            className="w-full bg-blue-50"
            dir="ltr"
          />
        </div>
        <span className="w-16 text-right">{masterVolume.toFixed(1)} dB</span>
      </div>
    </div>
  );
}; 