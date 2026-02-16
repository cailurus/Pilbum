import { z } from 'zod';

export const photoUpdateSchema = z.object({
  // Content
  title: z.string().max(200, '标题不能超过 200 个字符').optional(),
  description: z.string().max(2000, '描述不能超过 2000 个字符').optional(),
  sortOrder: z.number().int('排序必须是整数').optional(),
  // Camera info
  cameraMake: z.string().max(100).nullable().optional(),
  cameraModel: z.string().max(100).nullable().optional(),
  lensModel: z.string().max(200).nullable().optional(),
  lensMake: z.string().max(100).nullable().optional(),
  // Shooting parameters
  focalLength: z.number().nullable().optional(),
  aperture: z.number().nullable().optional(),
  shutterSpeed: z.string().max(50).nullable().optional(),
  iso: z.number().int().nullable().optional(),
  // Date and location
  takenAt: z.string().nullable().optional(),
  latitude: z.number().min(-90).max(90).nullable().optional(),
  longitude: z.number().min(-180).max(180).nullable().optional(),
  altitude: z.number().nullable().optional(),
});

export const photoQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
});

export type PhotoUpdateInput = z.infer<typeof photoUpdateSchema>;
export type PhotoQueryInput = z.infer<typeof photoQuerySchema>;
