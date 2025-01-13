import { useConnection } from './use-connection';
import { useMaster } from './use-master';
import { useChannels } from './use-channels';
import { useMeters } from './use-meters';

export function useMinidsp() {
  const {
    isMockMode,
    hostname,
    status,
    isConnected,
    lastStatus,
    clientRef,
    setHostname,
    connect: baseConnect,
    disconnect: baseDisconnect,
    setLastStatus
  } = useConnection();

  const {
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
  } = useMaster({ clientRef, setLastStatus });

  const {
    linkLR,
    outputGains,
    setLinkLR,
    handleGainChange,
    handleInputGainChange,
    handleInputMuteChange,
    handleOutputDelayChange,
    handleOutputInvertedChange,
    handleOutputMuteChange
  } = useChannels({ clientRef, setLastStatus });

  const {
    meterLevels,
    startMeterStream,
    stopMeterStream
  } = useMeters({ clientRef, isConnected, isMockMode });

  // Enhanced connect that updates master controls
  const connect = async () => {
    const deviceStatus = await baseConnect();
    updateFromDeviceStatus(deviceStatus);
    await startMeterStream();
  };

  // Enhanced disconnect that stops meter stream
  const disconnect = () => {
    baseDisconnect();
    stopMeterStream();
  };

  return {
    // Connection
    isMockMode,
    hostname,
    status,
    isConnected,
    lastStatus,
    setHostname,
    connect,
    disconnect,

    // Master
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

    // Channels
    linkLR,
    outputGains,
    setLinkLR,
    handleGainChange,
    handleInputGainChange,
    handleInputMuteChange,
    handleOutputDelayChange,
    handleOutputInvertedChange,
    handleOutputMuteChange,

    // Meters
    meterLevels
  };
} 