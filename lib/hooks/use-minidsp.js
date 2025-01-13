/* eslint-disable max-lines-per-function -- This hook manages all MiniDSP device state and interactions.
   While large, it keeps related state management together and splitting it would reduce cohesion. */
import { useState, useEffect, useRef } from 'react';
import { getConfig } from '@/lib/config';
import { createMiniDSPClient } from '@/lib/minidsp-api';

export function useMinidsp() {
  const isMockMode = process.env.NEXT_PUBLIC_USE_MOCK_MINIDSP === 'true';
  
  const defaultHost = isMockMode 
    ? 'mock'
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
  const [meterLevels, setMeterLevels] = useState(Array(4).fill({ rms: -60, peak: -60 }));
  const eventSourceRef = useRef(null);
  const clientRef = useRef(null);

  useEffect(() => {
    if (isMockMode) {
      setHostname('mock');
    }
  }, [isMockMode]);

  useEffect(() => {
    // Create new client when hostname changes
    clientRef.current = createMiniDSPClient(hostname);
  }, [hostname]);

  const saveGainsToStorage = (gains) => {
    if (typeof window !== 'undefined') {
      window.localStorage.setItem('minidsp-gains', JSON.stringify(gains));
    }
  };

  const connect = async () => {
    setStatus('');
    try {
      const devices = await clientRef.current.getDevices();
      if (!devices || devices.length === 0) {
        throw new Error('No devices found');
      }

      const deviceStatus = await clientRef.current.getStatus();
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
      const gains = Object.entries(currentGains).map(([index, gain]) => ({
        index: parseInt(index),
        gain
      }));
      await clientRef.current.setOutputGains(gains);

      setIsConnected(true);
      setStatus('connected');
    } catch (error) {
      console.error('Error connecting:', error);
      setStatus('error');
      throw error;
    }
  };

  const disconnect = () => {
    setIsConnected(false);
    setStatus('');
    setLastStatus(null);
    setMeterLevels(Array(4).fill({ rms: -60, peak: -60 }));
  };

  const handleVolumeChange = async (newValue) => {
    setMasterVolume(newValue);
    const status = await clientRef.current.setMasterVolume(newValue);
    setLastStatus(status);
  };

  const handleMuteToggle = async () => {
    const newMuteState = !mute;
    setMute(newMuteState);
    const status = await clientRef.current.setMasterMute(newMuteState);
    setLastStatus(status);
  };

  const handleInputChange = async (value) => {
    setInputSource(value);
    const status = await clientRef.current.setInputSource(value);
    setLastStatus(status);
  };

  const handlePresetChange = async (value) => {
    const preset = parseInt(value);
    setCurrentPreset(preset);
    localStorage.setItem('minidsp-preset', preset.toString());
    const status = await clientRef.current.setPreset(preset);
    setLastStatus(status);
  };

  const handleDiracToggle = async (enabled) => {
    setDiracEnabled(enabled);
    const status = await clientRef.current.setDirac(enabled);
    setLastStatus(status);
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

      let status;
      if (linkLR && (output === 0 || output === 1)) {
        status = await clientRef.current.setOutputGains([
          { index: 0, gain: newValue },
          { index: 1, gain: newValue }
        ]);
      } else {
        status = await clientRef.current.setOutputGain(output, newValue);
      }
      setLastStatus(status);
    } catch (error) {
      console.error('Failed to update gain:', error);
    }
  };

  const handleInputGainChange = async (index, value) => {
    try {
      const status = await clientRef.current.setInputGain(index, value);
      setLastStatus(status);
    } catch (error) {
      console.error('Failed to update input gain:', error);
    }
  };

  const handleInputMuteChange = async (index, value) => {
    try {
      const status = await clientRef.current.setInputMute(index, value);
      setLastStatus(status);
    } catch (error) {
      console.error('Failed to update input mute:', error);
    }
  };

  const handleOutputDelayChange = async (index, value) => {
    try {
      const status = await clientRef.current.setOutputDelay(index, value);
      setLastStatus(status);
    } catch (error) {
      console.error('Failed to update output delay:', error);
    }
  };

  const handleOutputInvertedChange = async (index, value) => {
    try {
      const status = await clientRef.current.setOutputInverted(index, value);
      setLastStatus(status);
    } catch (error) {
      console.error('Failed to update output invert:', error);
    }
  };

  const handleOutputMuteChange = async (index, value) => {
    try {
      const status = await clientRef.current.setOutputMute(index, value);
      setLastStatus(status);
    } catch (error) {
      console.error('Failed to update output mute:', error);
    }
  };

  // Start meter data streaming
  const startMeterStream = async () => {
    if (isMockMode) {
      let isPolling = false;
      
      // Function to poll meter levels
      const pollMeterLevels = async () => {
        if (isPolling) return; // Don't overlap requests
        
        isPolling = true;
        try {
          const levels = await clientRef.current.getMeterLevels();
          setMeterLevels(levels);
        } catch (error) {
          console.error('Error getting mock meter levels:', error);
          // On error, check if we're still connected
          if (isConnected) {
            console.error('Connection error, stopping meter stream');
            stopMeterStream();
          }
        } finally {
          isPolling = false;
        }
      };
      
      // Get initial data immediately
      await pollMeterLevels();
      
      // Then start polling at 10Hz
      const intervalId = setInterval(pollMeterLevels, 100);
      
      // Store interval ID for cleanup
      eventSourceRef.current = intervalId;
      return;
    }
    
    // Real hardware uses SSE
    console.log('Starting meter stream for hostname:', hostname);
    const url = `/api/minidsp/meters?hostname=${encodeURIComponent(hostname)}`;
    eventSourceRef.current = new EventSource(url);

    eventSourceRef.current.onopen = () => {
      console.log('Meter stream connected');
    };

    eventSourceRef.current.onmessage = (event) => {
      console.log('Received meter data:', event.data);
      const data = JSON.parse(event.data);
      if (data.error) {
        console.error('Meter stream error:', data.error);
      } else {
        setMeterLevels(data);
      }
    };

    eventSourceRef.current.onerror = (error) => {
      console.error('Meter stream error:', error);
      stopMeterStream();
    };
  };

  // Stop meter data streaming
  const stopMeterStream = () => {
    console.log('Stopping meter stream');
    if (eventSourceRef.current) {
      if (isMockMode) {
        clearInterval(eventSourceRef.current);
      } else {
        eventSourceRef.current.close();
      }
      eventSourceRef.current = null;
    }
  };

  // Start/stop meter stream based on connection status
  useEffect(() => {
    if (isConnected) {
      startMeterStream();
    } else {
      stopMeterStream();
    }
    return () => stopMeterStream();
  }, [isConnected, hostname]);

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
    meterLevels,

    // Actions
    setHostname,
    setLinkLR,
    connect,
    disconnect,
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