import { createMiniDSPClient } from '@/lib/minidsp-api';

export default async function handler(req, res) {
  const hostname = req.query.hostname;
  const isMockMode = process.env.NEXT_PUBLIC_USE_MOCK_MINIDSP === 'true';
  console.log('Meter stream requested:', { hostname, isMockMode });
  
  if (!hostname) {
    console.error('No hostname provided');
    return res.status(400).json({ error: 'No hostname provided' });
  }

  // Set headers for SSE
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');

  // Create appropriate client based on mock mode
  const client = isMockMode ? createMiniDSPClient('mock') : createMiniDSPClient(hostname);

  // Send initial connection message
  console.log('Sending initial connection message');
  res.write('event: connected\ndata: true\n\n');

  // Function to fetch meter data
  const fetchMeterData = async () => {
    try {
      const levels = await client.getMeterLevels();
      console.log('Sending meter data:', levels);
      res.write(`data: ${JSON.stringify(levels)}\n\n`);
    } catch (error) {
      console.error('Error fetching meter data:', error);
      res.write(`data: ${JSON.stringify({ error: error.message })}\n\n`);
    }
  };

  // Send updates every 33ms (30Hz)
  const interval = setInterval(() => fetchMeterData(), 33);

  // Clean up on client disconnect
  res.on('close', () => {
    console.log('Meter stream closed for hostname:', hostname);
    clearInterval(interval);
    res.end();
  });
} 