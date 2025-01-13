import { useState, useRef } from 'react';

export function useMeters({ clientRef, isConnected, isMockMode }) {
  const [meterLevels, setMeterLevels] = useState(Array(6).fill({ rms: -60, peak: -60 }));
  const eventSourceRef = useRef(null);

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
      
      // Start polling interval
      eventSourceRef.current = setInterval(pollMeterLevels, 100);
    } else {
      // Real device implementation would go here
      // Using Server-Sent Events or WebSocket
    }
  };

  const stopMeterStream = () => {
    if (eventSourceRef.current) {
      if (isMockMode) {
        clearInterval(eventSourceRef.current);
      } else {
        // Cleanup real device connection
      }
      eventSourceRef.current = null;
    }
    setMeterLevels(Array(6).fill({ rms: -60, peak: -60 }));
  };

  return {
    meterLevels,
    startMeterStream,
    stopMeterStream
  };
} 