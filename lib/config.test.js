import { getConfig } from '@/lib/config';

describe('Configuration System', () => {
  beforeEach(() => {
    // Clear any environment variables
    delete process.env.NEXT_PUBLIC_MINIDSP_API_URL;
    
    // Mock localStorage
    Object.defineProperty(window, 'localStorage', {
      value: {
        getItem: jest.fn(),
        setItem: jest.fn(),
        clear: jest.fn()
      },
      writable: true
    });
  });

  it('should read from config.default.json', () => {
    const url = getConfig('minidsp.api_url');
    expect(url).toBe('http://minidsp-rs:5380');
  });

  it('should prefer environment variables over config files', () => {
    process.env.NEXT_PUBLIC_MINIDSP_API_URL = 'http://env-test:5380';
    const url = getConfig('minidsp.api_url');
    expect(url).toBe('http://env-test:5380');
  });

  it('should return undefined (Optional.none) for missing configuration paths', () => {
    const value = getConfig('nonexistent.path');
    expect(value).toBeUndefined();
  });

  it('demonstrates Swift-like Optional behavior', () => {
    // Missing value returns undefined (Optional.none)
    expect(getConfig('nonexistent.path')).toBeUndefined();
    
    // Existing value is returned as-is (Optional.some)
    process.env.NEXT_PUBLIC_TEST = 'value';
    expect(getConfig('test')).toBe('value');
    
    // Optional chaining with missing value
    const result = getConfig('missing.path')?.toLowerCase();
    expect(result).toBeUndefined();
  });

  it('allows localStorage to override minidsp IP configuration', () => {
    // Default from config
    expect(getConfig('minidsp.api_url')).toBe('http://minidsp-rs:5380');
    
    // Environment variable takes precedence
    process.env.NEXT_PUBLIC_MINIDSP_API_URL = 'http://env-test:5380';
    expect(getConfig('minidsp.api_url')).toBe('http://env-test:5380');
    
    // localStorage can override when explicitly requested with key
    window.localStorage.getItem.mockReturnValue('192.168.1.100:5380');
    expect(getConfig('minidsp.api_url', 'minidsp-ip')).toBe('192.168.1.100:5380');
  });
}); 