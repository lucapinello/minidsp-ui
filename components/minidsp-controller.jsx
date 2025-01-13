"use client"

import React from 'react';
import { useMinidsp } from '@/lib/hooks/use-minidsp';
import { ConnectionHeader } from '@/components/minidsp/connection-header';
import { MasterControls } from '@/components/minidsp/master-controls';
import { VolumeControls } from '@/components/minidsp/volume-controls';
import { InputChannel } from '@/components/minidsp/input-channel';
import { OutputChannel } from '@/components/minidsp/output-channel';
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
  } = useMinidsp();

  return (
    <Card>
      <CardContent className="space-y-4">
        <ConnectionHeader 
          hostname={hostname}
          onHostnameChange={setHostname}
          onConnect={connect}
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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {lastStatus?.inputs?.map((input, index) => (
                <InputChannel
                  key={index}
                  label={input.label || `Input ${index + 1}`}
                  gain={input.gain}
                  mute={input.mute}
                  onGainChange={(value) => handleInputGainChange(index, value)}
                  onMuteChange={(value) => handleInputMuteChange(index, value)}
                />
              ))}
              </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {lastStatus?.outputs?.map((output, index) => (
                <OutputChannel
                  key={index}
                  label={output.label || `Output ${index + 1}`}
                  gain={output.gain}
                  delay={output.delay}
                  inverted={output.inverted}
                  mute={output.mute}
                  onGainChange={(value) => handleGainChange(index, value)}
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
