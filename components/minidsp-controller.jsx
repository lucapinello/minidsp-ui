"use client"

import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Volume2 } from 'lucide-react';
import { cn } from "@/lib/utils";

export default function MiniDSPController() {
  const [masterVolume, setMasterVolume] = useState(-10);  // Default to -10 dB
  const [mute, setMute] = useState(false);
  const [status, setStatus] = useState('');
  const [inputSource, setInputSource] = useState('usb');  // Default to USB
  const [isConnected, setIsConnected] = useState(false);
  const [lastStatus, setLastStatus] = useState(null);  // Store the full status response
  const [linkLR, setLinkLR] = useState(() => {
    if (typeof window !== 'undefined') {
      return window.localStorage.getItem('minidsp-link-lr') === 'true';
    }
    return false;
  });
  const [diracEnabled, setDiracEnabled] = useState(false);
  const [currentPreset, setCurrentPreset] = useState(() => {
    if (typeof window !== 'undefined') {
      return parseInt(window.localStorage.getItem('minidsp-preset') || '0');
    }
    return 0;
  });
  const [outputGains, setOutputGains] = useState(() => {
    if (typeof window !== 'undefined') {
      const savedGains = window.localStorage.getItem('minidsp-gains');
      if (savedGains) {
        return JSON.parse(savedGains);
      }
    }
    return {
      0: 0,    // Left - default to 0 dB
      1: 0,    // Right - default to 0 dB
      2: -20   // Subwoofer - default to -20 dB
    };
  });
  const [ipAddress, setIpAddress] = useState('192.168.0.67:5380');

useEffect(() => {
    const savedIp = window.localStorage.getItem('minidsp-ip');
    if (savedIp) {
      setIpAddress(savedIp);
    }
  }, []);
  
  const callApi = async (endpoint, method = 'GET', body = null) => {
    try {
      const options = {
        method,
        headers: {
          'Content-Type': 'application/json',
          'minidsp-ip': ipAddress,
        },
        ...(body && { body: JSON.stringify(body) }),
      };
      
      const cleanEndpoint = endpoint.replace('/api/', '');
      const response = await fetch(`/api/minidsp/${cleanEndpoint}`, options);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.success && !data.text) {
        return null;
      }
      
      return data;
    } catch (error) {
      setStatus(`Error: ${error.message}`);
      console.error('API call failed:', error);
      throw error;
    }
  };

  const saveGainsToStorage = (gains) => {
    if (typeof window !== 'undefined') {
      window.localStorage.setItem('minidsp-gains', JSON.stringify(gains));
    }
  };

  const fetchInitialState = async () => {
    try {
      const devices = await callApi('devices');
      console.log('Available devices:', devices);
      
      if (!devices || devices.length === 0) {
        throw new Error('No devices found');
      }

      const deviceStatus = await callApi('devices/0');
      console.log('Device status:', deviceStatus);
      setLastStatus(deviceStatus);

      if (deviceStatus) {
        const { master } = deviceStatus;
        setMasterVolume(master.volume);
        setMute(master.mute);
        setInputSource(master.source.toLowerCase());
        setDiracEnabled(master.dirac || false);
        if (typeof master.preset === 'number') {
          setCurrentPreset(master.preset);
          localStorage.setItem('minidsp-preset', master.preset.toString());
        }
      }

      // Apply saved gain settings to device
      const currentGains = outputGains;
      for (const [output, gain] of Object.entries(currentGains)) {
        await callApi('devices/0/config', 'POST', {
          outputs: [{
            index: parseInt(output),
            gain: gain
          }]
        });
      }

      setIsConnected(true);
    } catch (error) {
      console.error('Error in fetchInitialState:', error);
      throw error;
    }
  };

  const handleDiracToggle = async (enabled) => {
    setDiracEnabled(enabled);
    await updateConfig({
      master_status: {
        dirac: enabled
      }
    });
  };

  const handlePresetChange = async (value) => {
    const preset = parseInt(value);
    setCurrentPreset(preset);
    localStorage.setItem('minidsp-preset', preset.toString());
    await updateConfig({
      master_status: {
        preset: preset
      }
    });
  };

  const updateConfig = async (config) => {
    await callApi('devices/0/config', 'POST', config);
    const newStatus = await callApi('devices/0');
    setLastStatus(newStatus);
    return newStatus;
  };

  const handleVolumeChange = async (newValue) => {
    setMasterVolume(newValue);
    await updateConfig({
      master_status: {
        volume: newValue
      }
    });
  };

  const handleMuteToggle = async () => {
    const newMuteState = !mute;
    setMute(newMuteState);
    await updateConfig({
      master_status: {
        mute: newMuteState
      }
    });
  };

  const handleInputChange = async (value) => {
    setInputSource(value);
    await updateConfig({
      master_status: {
        source: value.charAt(0).toUpperCase() + value.slice(1)
      }
    });
  };

  const handleGainChange = async (output, value) => {
    try {
      const newValue = Math.min(0, Math.max(-127, value));
      
      setOutputGains(prev => {
        const newGains = {
          ...prev,
          [output]: newValue,
          ...((linkLR && (output === 0 || output === 1)) ? {
            0: newValue,
            1: newValue
          } : {})
        };
        saveGainsToStorage(newGains);
        return newGains;
      });

      if (linkLR && (output === 0 || output === 1)) {
        await callApi('devices/0/config', 'POST', {
          outputs: [
            { index: 0, gain: newValue },
            { index: 1, gain: newValue }
          ]
        });
      } else {
        await callApi('devices/0/config', 'POST', {
          outputs: [{
            index: output,
            gain: newValue
          }]
        });
      }
    } catch (error) {
      console.error('Failed to update gain:', error);
    }
  };

return (
    <Card className="w-full max-w-xl">
      <CardHeader>
        <CardTitle>
          <span>MiniDSP Controller</span>
        </CardTitle>
        <div className="mt-4">
          <Label htmlFor="ip-address">MiniDSP IP Address</Label>
          <div className="flex gap-2 mt-1">
            <Input
              id="ip-address"
              type="text"
              value={ipAddress}
              onChange={(e) => {
                setIpAddress(e.target.value);
                localStorage.setItem('minidsp-ip', e.target.value);
              }}
              placeholder="Enter IP address (e.g., 192.168.0.67:5380)"
              className="flex-1"
            />
            <Button 
              onClick={async () => {
                setStatus('');
                try {
                  await fetchInitialState();
                  setIsConnected(true);
                } catch (error) {
                  setStatus('Failed to connect. Please check the IP address.');
                }
              }}
              size="sm"
            >
              Connect
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {isConnected ? (
          <div className="space-y-6">
            <div className="space-y-4">
            <div>
                <Label>Input Source</Label>
                <Select value={inputSource} onValueChange={handleInputChange}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select input source" />
                  </SelectTrigger>
                  <SelectContent className="bg-white">
                    <SelectItem value="analog">Analog</SelectItem>
                    <SelectItem value="toslink">TOSLINK</SelectItem>
                    <SelectItem value="usb">USB</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Add this section right after Input Source and before Master Volume */}
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center justify-between mb-2 gap-4">
                  <Label>Preset: </Label>
                  <Select value={currentPreset.toString()} onValueChange={handlePresetChange}>
                    <SelectTrigger className="w-full">
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
                  <div className="flex items-center gap-2 bg-blue-50 rounded-lg px-3 py-1.5 h-10">
                    <Label htmlFor="dirac-live" className="text-sm cursor-pointer select-none">Dirac Live</Label>
                    <Switch
                      id="dirac-live"
                      checked={diracEnabled}
                      onCheckedChange={handleDiracToggle}
                      className="data-[state=checked]:bg-blue-500 data-[state=unchecked]:bg-blue-200"
                    />
                  </div>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <Label>Master Volume</Label>
                  <div className="flex items-center gap-2 bg-blue-50 rounded-lg px-3 py-1.5">
                    <Label htmlFor="master-mute" className="text-sm cursor-pointer select-none">Mute</Label>
                    <Switch
                      id="master-mute"
                      checked={mute}
                      onCheckedChange={(checked) => handleMuteToggle()}
                      className="data-[state=checked]:bg-blue-500 data-[state=unchecked]:bg-blue-200"
                    />
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <Volume2 className={cn("h-5 w-5", mute && "opacity-50")} />
                  <div className="flex-1">
                    <Slider
                      value={[masterVolume]}
                      onValueChange={([value]) => handleVolumeChange(value)}
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

              <div className="space-y-4">
                <div className="flex items-center justify-between mb-2">
                  <Label>Output Gains</Label>
                  <div className="flex items-center gap-2 bg-blue-50 rounded-lg px-3 py-1.5">
                    <Label htmlFor="link-lr" className="text-sm cursor-pointer select-none">Link L/R</Label>
                    <Switch
                      id="link-lr"
                      checked={linkLR}
                      onCheckedChange={(checked) => {
                        setLinkLR(checked);
                        localStorage.setItem('minidsp-link-lr', checked.toString());
                      }}
                      className="data-[state=checked]:bg-blue-500 data-[state=unchecked]:bg-blue-200"
                    />
                  </div>
                </div>
                <div className="grid gap-4">
                  <div className="space-y-2">
                    <Label className="text-sm text-muted-foreground">Left Channel</Label>
                    <div className="flex items-center space-x-4">
                      <div className="flex-1">
                        <Slider
                          value={[outputGains[0] ?? -127]}
                          onValueChange={([value]) => handleGainChange(0, Math.min(0, Math.max(-127, value)))}
                          min={-127}
                          max={0}
                          step={0.5}
                          className="w-full bg-blue-50"
                          dir="ltr"
                        />
                      </div>
                      <span className="w-16 text-right">{(outputGains[0] ?? -127).toFixed(1)} dB</span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm text-muted-foreground">Right Channel</Label>
                    <div className="flex items-center space-x-4">
                      <div className="flex-1">
                        <Slider
                          value={[outputGains[1] ?? -127]}
                          onValueChange={([value]) => handleGainChange(1, Math.min(0, Math.max(-127, value)))}
                          min={-127}
                          max={0}
                          step={0.5}
                          className="w-full bg-blue-50"
                          dir="ltr"
                        />
                      </div>
                      <span className="w-16 text-right">{(outputGains[1] ?? -127).toFixed(1)} dB</span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm text-muted-foreground">Subwoofer</Label>
                    <div className="flex items-center space-x-4">
                      <div className="flex-1">
                        <Slider
                          value={[outputGains[2] ?? -127]}
                          onValueChange={([value]) => handleGainChange(2, Math.min(0, Math.max(-127, value)))}
                          min={-127}
                          max={0}
                          step={0.5}
                          className="w-full bg-blue-50"
                          dir="ltr"
                        />
                      </div>
                      <span className="w-16 text-right">{(outputGains[2] ?? -127).toFixed(1)} dB</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            Please enter your MiniDSP's IP address and click Connect
          </div>
        )}
        {status && (
          <div className="text-sm text-red-500 mt-4">
            {status}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
