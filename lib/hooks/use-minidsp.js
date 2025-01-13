/* eslint-disable max-lines-per-function -- This hook manages all MiniDSP device state and interactions.
   While large, it keeps related state management together and splitting it would reduce cohesion. */
import { useState, useEffect } from 'react';
import { getConfig } from '@/lib/config';

export function useMinidsp() {
  const isMockMode = process.env.NEXT_PUBLIC_USE_MOCK_MINIDSP === 'true';
  
  const defaultHost = isMockMode 
    ? 'minidsp-mock:5380'
    : (getConfig('minidsp.api_url', 'minidsp-host') || '192.168.0.67:5380');
  
  const [masterVolume, setMasterVolume] = useState(-10);
  const [mute, setMute] = useState(false);
  const [status, setStatus] = useState('');
  const [inputSource, setInputSource] = useState('usb');
  const [isConnected, setIsConnected] = useState(false);
  const [lastStatus, setLastStatus] = useState(null);
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
      0: -10, 1: -10, 2: -10, 3: -10
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

  const updateConfig = async (config) => {
    await callApi('devices/0/config', 'POST', config);
    const newStatus = await callApi('devices/0');
    setLastStatus(newStatus);
    return newStatus;
  };

  const connect = async () => {
    setStatus('');
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
      console.error('Error connecting:', error);
      throw error;
    }
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

  const handleDiracToggle = async (enabled) => {
    setDiracEnabled(enabled);
    await updateConfig({
      master_status: {
        dirac: enabled
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

  return {
    // State
    isMockMode,
    hostname,
    masterVolume,
    mute,
    status,
    inputSource,
    isConnected,
    lastStatus,
    linkLR,
    diracEnabled,
    currentPreset,
    outputGains,

    // Actions
    setHostname,
    setLinkLR,
    connect,
    handleVolumeChange,
    handleMuteToggle,
    handleInputChange,
    handlePresetChange,
    handleDiracToggle,
    handleGainChange,
    handleInputGainChange,
    handleInputMuteChange,
    handleOutputDelayChange,
    handleOutputInvertedChange,
    handleOutputMuteChange
  };
} 