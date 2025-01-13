import { useState } from 'react';
import { storage } from '@/lib/utils/storage';
import { validateGain, validateDelay } from '@/lib/utils/validation';

/**
 * Hook for managing MiniDSP channel states and operations.
 * 
 * Manages:
 * 1. Input/output gain levels with optional L/R channel linking
 * 2. Channel mute states
 * 3. Output delay and invert settings
 * 4. Persistent storage of channel settings
 * 
 * @param {Object} props
 * @param {Object} props.clientRef - Reference to MiniDSP client instance
 * @param {Function} props.setLastStatus - Callback to update last known device status
 */
export function useChannels({ clientRef, setLastStatus }) {
  const [linkLR, setLinkLR] = useState(() => {
    return storage.get('minidsp-link-lr', false);
  });

  const [outputGains, setOutputGains] = useState(() => {
    return storage.get('minidsp-gains', {
      0: -10, 1: -10, 2: -10, 3: -10
    });
  });

  const saveGainsToStorage = (gains) => {
    storage.set('minidsp-gains', gains);
  };

  const handleGainChange = async (output, value) => {
    try {
      const newValue = validateGain(value);
      
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
      const newValue = validateGain(value);
      const status = await clientRef.current.setInputGain(index, newValue);
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
      const newValue = validateDelay(value);
      const status = await clientRef.current.setOutputDelay(index, newValue);
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