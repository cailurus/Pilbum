import { z } from 'zod';

export const createUserSchema = z.object({
  username: z
    .string()
    .min(2, '用户名至少需要 2 个字符')
    .max(50, '用户名不能超过 50 个字符')
    .regex(/^[a-zA-Z0-9_]+$/, '用户名只能包含字母、数字和下划线'),
  password: z.string().min(6, '密码至少需要 6 个字符'),
  role: z.enum(['admin', 'user']).default('user'),
  displayName: z.string().max(100, '显示名称不能超过 100 个字符').optional(),
});

export const updateUserSchema = z.object({
  role: z.enum(['admin', 'user']).optional(),
  displayName: z.string().max(100).optional(),
  password: z.string().min(6, '密码至少需要 6 个字符').optional(),
  mustChangePassword: z.boolean().optional(),
});

export type CreateUserInput = z.infer<typeof createUserSchema>;
export type UpdateUserInput = z.infer<typeof updateUserSchema>;
