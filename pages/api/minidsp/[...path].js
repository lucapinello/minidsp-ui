export default async function handler(req, res) {
  const { path } = req.query;
  const ipAddress = req.headers['minidsp-ip'];
  
  if (!ipAddress) {
    res.status(400).json({ error: 'No IP address provided' });
    return;
  }

  try {
    // Remove any '/api/' prefix from the path if present
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
    console.error('Proxy error:', error);
    res.status(500).json({ error: error.message });
  }
}
