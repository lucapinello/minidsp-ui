import { useState } from 'react';

export function useChannels({ clientRef, setLastStatus }) {
  const [linkLR, setLinkLR] = useState(() => {
    if (typeof window !== 'undefined') {
      return window.localStorage.getItem('minidsp-link-lr') === 'true';
    }
    return false;
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

  const saveGainsToStorage = (gains) => {
    if (typeof window !== 'undefined') {
      window.localStorage.setItem('minidsp-gains', JSON.stringify(gains));
    }
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

  return {
    linkLR,
    outputGains,
    setLinkLR,
    handleGainChange,
    handleInputGainChange,
    handleInputMuteChange,
    handleOutputDelayChange,
    handleOutputInvertedChange,
    handleOutputMuteChange
  };
} 