import { z } from 'zod';

export const photoUpdateSchema = z.object({
  title: z.string().max(200, '标题不能超过 200 个字符').optional(),
  description: z.string().max(2000, '描述不能超过 2000 个字符').optional(),
  sortOrder: z.number().int('排序必须是整数').optional(),
});

export const photoQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
});

export type PhotoUpdateInput = z.infer<typeof photoUpdateSchema>;
export type PhotoQueryInput = z.infer<typeof photoQuerySchema>;
