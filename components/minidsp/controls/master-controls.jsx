import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';

export const MasterControls = ({
  inputSource,
  onInputSourceChange,
  currentPreset,
  onPresetChange,
  diracEnabled,
  onDiracToggle
}) => {
  return (
    <div className="space-y-4">
      <div>
        <Label>Input Source</Label>
        <Select value={inputSource} onValueChange={onInputSourceChange}>
          <SelectTrigger className="w-full hover:border-blue-200 transition-colors">
            <SelectValue placeholder="Select input source" />
          </SelectTrigger>
          <SelectContent className="bg-white">
            <SelectItem value="analog">Analog</SelectItem>
            <SelectItem value="toslink">TOSLINK</SelectItem>
            <SelectItem value="usb">USB</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="flex items-center justify-between mb-2 gap-4">
          <Label>Preset: </Label>
          <Select value={currentPreset.toString()} onValueChange={onPresetChange}>
            <SelectTrigger className="w-full hover:border-blue-200 transition-colors">
              <SelectValue placeholder="Select preset" />
            </SelectTrigger>
            <SelectContent className="bg-white">
              <SelectItem value="0">Preset 1</SelectItem>
              <SelectItem value="1">Preset 2</SelectItem>
              <SelectItem value="2">Preset 3</SelectItem>
              <SelectItem value="3">Preset 4</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex justify-end">
          <div className="flex items-center gap-2 bg-blue-50 rounded-lg px-3 py-1.5">
            <Label htmlFor="dirac-live" className="text-sm cursor-pointer select-none">Dirac Live</Label>
            <Switch
              id="dirac-live"
              checked={diracEnabled}
              onCheckedChange={onDiracToggle}
              className="data-[state=checked]:bg-blue-500 data-[state=unchecked]:bg-blue-200"
            />
          </div>
        </div>
      </div>
    </div>
  );
}; 