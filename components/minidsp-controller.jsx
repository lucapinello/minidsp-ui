"use client"

/**
 * Main controller component for the MiniDSP interface.
 * 
 * Provides:
 * 1. Connection management and status display
 * 2. Master volume and mute controls
 * 3. Input channel controls (gain, mute)
 * 4. Output channel controls (gain, delay, invert, mute)
 * 5. Real-time meter visualization
 */

import React from 'react';
import { useMinidsp } from '@/lib/hooks/use-minidsp';
import { ConnectionHeader } from '@/components/minidsp/connection';
import { MasterControls, VolumeControls } from '@/components/minidsp/controls';
import { InputChannel, OutputChannel } from '@/components/minidsp/channels';
import { Card, CardContent, CardFooter } from '@/components/ui/card';

export function MiniDSPController() {
  const {
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
  } = useMinidsp();

  const handleConnect = async () => {
    if (status === 'connected') {
      disconnect();
    } else {
      try {
        await connect();
      } catch (error) {
        console.error('Connection error:', error);
      }
    }
  };

  return (
    <Card>
      <CardContent className="space-y-4">
        <ConnectionHeader 
          hostname={hostname}
          onHostnameChange={setHostname}
          onConnect={handleConnect}
          isMockMode={isMockMode}
          status={status}
        />

        {isConnected && (
          <div className="space-y-4">
            <MasterControls
              inputSource={inputSource}
              onInputSourceChange={handleInputChange}
              currentPreset={currentPreset}
              onPresetChange={handlePresetChange}
              diracEnabled={diracEnabled}
              onDiracToggle={handleDiracToggle}
            />

            <VolumeControls
              masterVolume={masterVolume}
              onVolumeChange={handleVolumeChange}
              mute={mute}
              onMuteToggle={handleMuteToggle}
            />

            <div className="grid grid-cols-1 auto-rows-fr gap-4 mb-8" style={{ 
              gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))'
            }}>
              {lastStatus?.inputs.map((input, index) => (
                <InputChannel
                  key={index}
                  label={input.label}
                  gain={input.gain}
                  mute={input.mute}
                  meterLevels={meterLevels[index]}
                  onGainChange={(value) => handleInputGainChange(index, value)}
                  onMuteChange={(value) => handleInputMuteChange(index, value)}
                />
              ))}
              </div>

            <div className="grid grid-cols-1 auto-rows-fr gap-4" style={{ 
              gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))'
            }}>
              {lastStatus?.outputs.map((output, index) => (
                <OutputChannel
                  key={index}
                  label={output.label}
                  gain={output.gain}
                  delay={output.delay}
                  inverted={output.inverted}
                  mute={output.mute}
                  meterLevels={meterLevels[index + lastStatus.inputs.length]}
                  onGainChange={(value) => handleOutputGainChange(index, value)}
                  onDelayChange={(value) => handleOutputDelayChange(index, value)}
                  onInvertedChange={(value) => handleOutputInvertedChange(index, value)}
                  onMuteChange={(value) => handleOutputMuteChange(index, value)}
                />
              ))}
            </div>
          </div>
        )}
      </CardContent>
      <CardFooter>
        <p className="text-sm text-muted-foreground">
          {isMockMode ? 'Development Mode' : 'Production Mode'}
        </p>
      </CardFooter>
    </Card>
  );
}
