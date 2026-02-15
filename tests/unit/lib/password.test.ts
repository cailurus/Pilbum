import { describe, it, expect } from 'vitest';
import { hashPassword, verifyPassword } from '@/lib/password';

describe('password', () => {
  describe('hashPassword', () => {
    it('should return a hash containing salt and key', async () => {
      const hash = await hashPassword('testpassword');
      expect(hash).toContain(':');
      const [salt, key] = hash.split(':');
      expect(salt).toHaveLength(32); // 16 bytes = 32 hex chars
      expect(key).toHaveLength(128); // 64 bytes = 128 hex chars
    });

    it('should generate different hashes for same password', async () => {
      const hash1 = await hashPassword('samepassword');
      const hash2 = await hashPassword('samepassword');
      expect(hash1).not.toBe(hash2);
    });
  });

  describe('verifyPassword', () => {
    it('should return true for correct password', async () => {
      const password = 'correctpassword';
      const hash = await hashPassword(password);
      const result = await verifyPassword(password, hash);
      expect(result).toBe(true);
    });

    it('should return false for incorrect password', async () => {
      const hash = await hashPassword('correctpassword');
      const result = await verifyPassword('wrongpassword', hash);
      expect(result).toBe(false);
    });

    it('should handle empty password', async () => {
      const hash = await hashPassword('');
      const result = await verifyPassword('', hash);
      expect(result).toBe(true);
    });
  });
});
