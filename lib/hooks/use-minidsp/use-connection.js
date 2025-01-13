import { useState, useEffect, useRef } from 'react';
import { getConfig } from '@/lib/config';
import { createMiniDSPClient } from '@/lib/minidsp-api';

export function useConnection() {
  const isMockMode = process.env.NEXT_PUBLIC_USE_MOCK_MINIDSP === 'true';
  
  const defaultHost = isMockMode 
    ? 'mock'
    : (getConfig('minidsp.api_url', 'minidsp-host') || '192.168.0.67:5380');
  
  const [status, setStatus] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const [hostname, setHostname] = useState(defaultHost);
  const [lastStatus, setLastStatus] = useState(null);
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

  const connect = async () => {
    setStatus('');
    try {
      const devices = await clientRef.current.getDevices();
      if (!devices || devices.length === 0) {
        throw new Error('No devices found');
      }

      const deviceStatus = await clientRef.current.getStatus();
      setLastStatus(deviceStatus);
      setIsConnected(true);
      setStatus('connected');
      return deviceStatus;
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
  };

  return {
    isMockMode,
    hostname,
    status,
    isConnected,
    lastStatus,
    clientRef,
    setHostname,
    connect,
    disconnect
  };
} 