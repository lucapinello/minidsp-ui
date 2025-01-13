import { mockMinidsp } from '@/lib/mock-minidsp';

export default async function handler(req, res) {
  const { path } = req.query;
  const ipAddress = req.headers['minidsp-ip'];
  const isMockMode = process.env.NEXT_PUBLIC_USE_MOCK_MINIDSP === 'true';
  
  console.log('API Request:', { path, ipAddress, isMockMode, env: process.env.NEXT_PUBLIC_USE_MOCK_MINIDSP });
  
  if (!ipAddress) {
    res.status(400).json({ error: 'No IP address provided' });
    return;
  }

  try {
    // Use mock if NEXT_PUBLIC_USE_MOCK_MINIDSP is set
    if (isMockMode) {
      console.log('Using mock implementation');
      const cleanPath = path.filter(segment => segment !== 'api').join('/');
      
      // Route to appropriate mock function
      if (cleanPath === 'devices') {
        return res.status(200).json(mockMinidsp.getDevices());
      }
      if (cleanPath === 'devices/0') {
        return res.status(200).json(mockMinidsp.getDeviceStatus());
      }
      if (cleanPath === 'devices/0/config' && req.method === 'POST') {
        return res.status(200).json(mockMinidsp.updateConfig(req.body));
      }
      
      throw new Error(`Unknown mock endpoint: ${cleanPath}`);
    }

    // Real minidsp-rs proxy code
    console.log('Using real implementation');
    const cleanPath = path.filter(segment => segment !== 'api').join('/');
    const url = `http://${ipAddress}/${cleanPath}`;
    
    console.log('Proxying request to:', url);
    console.log('Method:', req.method);
    console.log('Body:', req.body);
    
    const response = await fetch(url, {
      method: req.method,
      headers: {
        'Content-Type': 'application/json',
      },
      body: req.method !== 'GET' ? JSON.stringify(req.body) : undefined,
    });

    // Get the raw text first
    const text = await response.text();
    console.log('Response:', text);

    // If the response is empty and status is OK, just send success
    if (!text && response.ok) {
      return res.status(200).json({ success: true });
    }

    // Try to parse as JSON if possible
    try {
      const data = JSON.parse(text);
      res.status(response.status).json(data);
    } catch {
      // If not JSON but we have content, send as text
      res.status(response.status).json({ success: true, text });
    }
  } catch (error) {
    console.error('API error:', error);
    res.status(500).json({ error: error.message });
  }
}
