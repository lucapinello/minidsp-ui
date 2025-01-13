import { useState } from 'react';
import { storage } from '@/lib/utils/storage';
import { validatePreset } from '@/lib/utils/validation';

/**
 * Hook for managing MiniDSP master controls.
 * 
 * Manages:
 * 1. Master volume and mute state
 * 2. Input source selection (USB/Toslink)
 * 3. Dirac Live processing state
 * 4. Preset selection with persistence
 * 
 * @param {Object} props
 * @param {Object} props.clientRef - Reference to MiniDSP client instance
 * @param {Function} props.setLastStatus - Callback to update last known device status
 */
export function useMaster({ clientRef, setLastStatus }) {
  const [masterVolume, setMasterVolume] = useState(-10);
  const [mute, setMute] = useState(false);
  const [inputSource, setInputSource] = useState('usb');
  const [diracEnabled, setDiracEnabled] = useState(false);
  const [currentPreset, setCurrentPreset] = useState(() => {
    return storage.get('minidsp-preset', 0);
  });

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
    const preset = validatePreset(value);
    setCurrentPreset(preset);
    storage.set('minidsp-preset', preset);
    const status = await clientRef.current.setPreset(preset);
    setLastStatus(status);
  };

  const handleDiracToggle = async (enabled) => {
    setDiracEnabled(enabled);
    const status = await clientRef.current.setDirac(enabled);
    setLastStatus(status);
  };

  const updateFromDeviceStatus = (deviceStatus) => {
    if (deviceStatus?.master) {
      const { master } = deviceStatus;
      setMasterVolume(master.volume);
      setMute(master.mute);
      setInputSource(master.source.toLowerCase());
      setDiracEnabled(master.dirac || false);
      if (typeof master.preset === 'number') {
        const preset = validatePreset(master.preset);
        setCurrentPreset(preset);
        storage.set('minidsp-preset', preset);
      }
    }
  };

  return {
    masterVolume,
    mute,
    inputSource,
    diracEnabled,
    currentPreset,
    handleVolumeChange,
    handleMuteToggle,
    handleInputChange,
    handlePresetChange,
    handleDiracToggle,
    updateFromDeviceStatus
  };
} 