import { storage } from '@/lib/utils/storage';

describe('storage utility', () => {
  let mockLocalStorage;

  beforeEach(() => {
    mockLocalStorage = {
      getItem: jest.fn(),
      setItem: jest.fn(),
      removeItem: jest.fn()
    };
    global.window = {
      localStorage: mockLocalStorage
    };
  });

  afterEach(() => {
    delete global.window;
    jest.clearAllMocks();
  });

  describe('get', () => {
    it('returns default value when key does not exist', () => {
      mockLocalStorage.getItem.mockReturnValue(null);
      expect(storage.get('test-key', 'default')).toBe('default');
    });

    it('returns parsed value when key exists', () => {
      mockLocalStorage.getItem.mockReturnValue(JSON.stringify({ test: true }));
      expect(storage.get('test-key')).toEqual({ test: true });
    });

    it('returns default value on parse error', () => {
      mockLocalStorage.getItem.mockReturnValue('invalid json');
      expect(storage.get('test-key', 'default')).toBe('default');
    });
  });

  describe('set', () => {
    it('stores stringified value', () => {
      const value = { test: true };
      storage.set('test-key', value);
      expect(mockLocalStorage.setItem).toHaveBeenCalledWith('test-key', JSON.stringify(value));
    });

    it('returns true on success', () => {
      expect(storage.set('test-key', 'value')).toBe(true);
    });

    it('returns false on error', () => {
      mockLocalStorage.setItem.mockImplementation(() => {
        throw new Error('Storage full');
      });
      expect(storage.set('test-key', 'value')).toBe(false);
    });
  });

  describe('remove', () => {
    it('removes item from storage', () => {
      storage.remove('test-key');
      expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('test-key');
    });

    it('returns true on success', () => {
      expect(storage.remove('test-key')).toBe(true);
    });

    it('returns false on error', () => {
      mockLocalStorage.removeItem.mockImplementation(() => {
        throw new Error('Storage error');
      });
      expect(storage.remove('test-key')).toBe(false);
    });
  });
}); 