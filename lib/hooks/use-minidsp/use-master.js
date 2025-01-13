import { useState } from 'react';

export function useMaster({ clientRef, setLastStatus }) {
  const [masterVolume, setMasterVolume] = useState(-10);
  const [mute, setMute] = useState(false);
  const [inputSource, setInputSource] = useState('usb');
  const [diracEnabled, setDiracEnabled] = useState(false);
  const [currentPreset, setCurrentPreset] = useState(() => {
    if (typeof window !== 'undefined') {
      return parseInt(window.localStorage.getItem('minidsp-preset') || '0');
    }
    return 0;
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

  const updateFromDeviceStatus = (deviceStatus) => {
    if (deviceStatus?.master) {
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