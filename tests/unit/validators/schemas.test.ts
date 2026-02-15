import { describe, it, expect } from 'vitest';
import {
  loginSchema,
  changePasswordSchema,
  photoUpdateSchema,
  createUserSchema,
} from '@/lib/validators';

describe('validators', () => {
  describe('loginSchema', () => {
    it('should accept valid credentials', () => {
      const result = loginSchema.safeParse({
        username: 'testuser',
        password: 'password123',
      });
      expect(result.success).toBe(true);
    });

    it('should reject empty username', () => {
      const result = loginSchema.safeParse({
        username: '',
        password: 'password123',
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('用户名不能为空');
      }
    });

    it('should reject empty password', () => {
      const result = loginSchema.safeParse({
        username: 'testuser',
        password: '',
      });
      expect(result.success).toBe(false);
    });
  });

  describe('changePasswordSchema', () => {
    it('should accept valid password change', () => {
      const result = changePasswordSchema.safeParse({
        currentPassword: 'oldpassword',
        newPassword: 'newpassword123',
      });
      expect(result.success).toBe(true);
    });

    it('should reject short new password', () => {
      const result = changePasswordSchema.safeParse({
        currentPassword: 'oldpassword',
        newPassword: '123',
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('新密码至少需要 8 个字符');
      }
    });
  });

  describe('photoUpdateSchema', () => {
    it('should accept valid update', () => {
      const result = photoUpdateSchema.safeParse({
        title: 'New Title',
        description: 'New description',
        sortOrder: 5,
      });
      expect(result.success).toBe(true);
    });

    it('should accept partial update', () => {
      const result = photoUpdateSchema.safeParse({ title: 'Only Title' });
      expect(result.success).toBe(true);
    });

    it('should reject too long title', () => {
      const result = photoUpdateSchema.safeParse({
        title: 'a'.repeat(201),
      });
      expect(result.success).toBe(false);
    });
  });

  describe('createUserSchema', () => {
    it('should accept valid user', () => {
      const result = createUserSchema.safeParse({
        username: 'newuser',
        password: 'password123',
        role: 'user',
      });
      expect(result.success).toBe(true);
    });

    it('should reject invalid username characters', () => {
      const result = createUserSchema.safeParse({
        username: 'user@name',
        password: 'password123',
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe(
          '用户名只能包含字母、数字和下划线'
        );
      }
    });

    it('should reject invalid role', () => {
      const result = createUserSchema.safeParse({
        username: 'newuser',
        password: 'password123',
        role: 'superadmin',
      });
      expect(result.success).toBe(false);
    });
  });
});
