"use client"

import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Volume2 } from 'lucide-react';
import { cn } from "@/lib/utils";
import { getConfig } from '@/lib/config';

const ChannelController = ({ label, gain, onGainChange }) => {
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

const InputChannel = ({ label, gain, mute, onGainChange, onMuteChange }) => {
  return (
    <div className="space-y-2 p-4 border rounded-lg">
      <div className="flex justify-between items-center">
        <Label className="text-lg font-semibold">{label}</Label>
        <Button 
          variant={mute ? "destructive" : "secondary"}
          size="sm"
          onClick={() => onMuteChange(!mute)}
        >
          {mute ? "Muted" : "Mute"}
        </Button>
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
      </div>
    </div>
  );
};

const OutputChannel = ({ label, gain, delay, inverted, mute, onGainChange, onDelayChange, onInvertedChange, onMuteChange }) => {
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

export default function MiniDSPController() {
  const isMockMode = process.env.NEXT_PUBLIC_USE_MOCK_MINIDSP === 'true';
  
  // Log environment setup once on mount
  useEffect(() => {
    console.log('Environment setup:', {
      NEXT_PUBLIC_USE_MOCK_MINIDSP: process.env.NEXT_PUBLIC_USE_MOCK_MINIDSP,
      isMockMode,
      defaultHost: isMockMode ? 'minidsp-mock:5380' : (getConfig('minidsp.api_url', 'minidsp-host') || '192.168.0.67:5380')
    });
  }, []);
  
  const defaultHost = isMockMode 
    ? 'minidsp-mock:5380'  // Mock mode - fixed value
    : (getConfig('minidsp.api_url', 'minidsp-host') || '192.168.0.67:5380');
  
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
      0: -10,    // Output 1 (Mono)
      1: -10,    // Output 2 (Mono)
      2: -10,    // Output 3 (Mono)
      3: -10     // Output 4 (Mono)
    };
  });
  const [hostname, setHostname] = useState(defaultHost);

  useEffect(() => {
    if (isMockMode) {
      setHostname('minidsp-mock:5380');
    }
  }, [isMockMode]);
  
  const callApi = async (endpoint, method = 'GET', body = null) => {
    try {
      const options = {
        method,
        headers: {
          'Content-Type': 'application/json',
          'minidsp-ip': hostname,
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
      if (!devices || devices.length === 0) {
        throw new Error('No devices found');
      }

      const deviceStatus = await callApi('devices/0');
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

  const handleInputGainChange = async (index, value) => {
    try {
      await callApi('devices/0/config', 'POST', {
        inputs: [{
          index,
          gain: value
        }]
      });
    } catch (error) {
      console.error('Failed to update input gain:', error);
    }
  };

  const handleInputMuteChange = async (index, value) => {
    try {
      await updateConfig({
        inputs: [{
          index,
          mute: value
        }]
      });
    } catch (error) {
      console.error('Failed to update input mute:', error);
    }
  };

  const handleOutputDelayChange = async (index, value) => {
    try {
      await updateConfig({
        outputs: [{
          index,
          delay: value
        }]
      });
    } catch (error) {
      console.error('Failed to update output delay:', error);
    }
  };

  const handleOutputInvertedChange = async (index, value) => {
    try {
      await updateConfig({
        outputs: [{
          index,
          inverted: value
        }]
      });
    } catch (error) {
      console.error('Failed to update output invert:', error);
    }
  };

  const handleOutputMuteChange = async (index, value) => {
    try {
      await updateConfig({
        outputs: [{
          index,
          mute: value
        }]
      });
    } catch (error) {
      console.error('Failed to update output mute:', error);
    }
  };

  return (
    <Card className="w-full max-w-xl">
      <CardHeader>
        <CardTitle>
          <span>MiniDSP Controller</span>
        </CardTitle>
        <div className="mt-4">
          <Label htmlFor="minidsp-host">MiniDSP Host</Label>
          <div className="flex gap-2 mt-1">
            <Input
              id="minidsp-host"
              type="text"
              value={hostname}
              onChange={(e) => {
                setHostname(e.target.value);
                if (!isMockMode) {
                  localStorage.setItem('minidsp-host', e.target.value);
                }
              }}
              placeholder={isMockMode ? "Development mock mode - any value works" : "Enter hostname or IP (e.g., minidsp.local:5380)"}
              className="flex-1"
            />
            <Button 
              onClick={async () => {
                setStatus('');
                try {
                  await fetchInitialState();
                  setIsConnected(true);
                } catch (error) {
                  setStatus('Failed to connect. Please check the hostname/IP.');
                }
              }}
              size="sm"
            >
              Connect
            </Button>
          </div>
          {isMockMode && (
            <div className="text-sm text-muted-foreground mt-2">
              Running in development mock mode. Any hostname will work - just click Connect.
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {isConnected ? (
          <div className="space-y-8">
            <div className="space-y-4">
              <div>
                <Label>Input Source</Label>
                <Select value={inputSource} onValueChange={handleInputChange}>
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
                  <Select value={currentPreset.toString()} onValueChange={handlePresetChange}>
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
                      onCheckedChange={handleMuteToggle}
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
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-4">Inputs</h3>
              <div className="grid gap-4 md:grid-cols-2">
                {lastStatus?.inputs?.map((input) => (
                  <InputChannel
                    key={input.index}
                    label={input.label}
                    gain={input.gain}
                    mute={input.mute}
                    onGainChange={(value) => handleInputGainChange(input.index, value)}
                    onMuteChange={(value) => handleInputMuteChange(input.index, value)}
                  />
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-4">Outputs</h3>
              <div className="grid gap-4 md:grid-cols-2">
                {lastStatus?.outputs?.map((output) => (
                  <OutputChannel
                    key={output.index}
                    label={output.label}
                    gain={output.gain}
                    delay={output.delay}
                    inverted={output.inverted}
                    mute={output.mute}
                    onGainChange={(value) => handleGainChange(output.index, value)}
                    onDelayChange={(value) => handleOutputDelayChange(output.index, value)}
                    onInvertedChange={(value) => handleOutputInvertedChange(output.index, value)}
                    onMuteChange={(value) => handleOutputMuteChange(output.index, value)}
                  />
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            Please enter your MiniDSP&apos;s hostname and click Connect
          </div>
        )}
        {status && (
          <div className="text-sm text-red-500 mt-4">
            {status}
          </div>
        )}
      </CardContent>
      <CardFooter className="text-sm text-muted-foreground">
        Mode: {isMockMode ? 'Development (Mock)' : 'Production'} 
        {isMockMode && ' - No real MiniDSP device required'}
      </CardFooter>
    </Card>
  );
}
