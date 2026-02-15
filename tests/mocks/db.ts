import { vi } from 'vitest';

export const mockUser = {
  id: 'test-user-id',
  username: 'testuser',
  passwordHash: '', // Will be set in tests
  role: 'user' as const,
  displayName: 'Test User',
  mustChangePassword: false,
  createdAt: new Date(),
  updatedAt: new Date(),
};

export const mockAdmin = {
  ...mockUser,
  id: 'test-admin-id',
  username: 'admin',
  role: 'admin' as const,
};

export const mockPhoto = {
  id: 'test-photo-id',
  title: 'Test Photo',
  description: 'A test photo',
  imageUrl: '/uploads/photos/test/full.jpg',
  thumbnailUrl: '/uploads/photos/test/thumb.jpg',
  blurDataUrl: null,
  width: 1920,
  height: 1080,
  isLivePhoto: false,
  livePhotoVideoUrl: null,
  cameraMake: 'Apple',
  cameraModel: 'iPhone 15 Pro',
  lensModel: null,
  focalLength: 24,
  aperture: 1.8,
  shutterSpeed: '1/1000',
  iso: 100,
  takenAt: new Date(),
  latitude: null,
  longitude: null,
  altitude: null,
  originalFilename: 'IMG_001.jpg',
  fileSize: 1024000,
  mimeType: 'image/jpeg',
  sortOrder: 0,
  createdAt: new Date(),
  updatedAt: new Date(),
};

export function createMockDb() {
  return {
    select: vi.fn().mockReturnThis(),
    from: vi.fn().mockReturnThis(),
    where: vi.fn().mockReturnThis(),
    limit: vi.fn().mockReturnThis(),
    offset: vi.fn().mockReturnThis(),
    orderBy: vi.fn().mockReturnThis(),
    insert: vi.fn().mockReturnThis(),
    values: vi.fn().mockReturnThis(),
    returning: vi.fn(),
    update: vi.fn().mockReturnThis(),
    set: vi.fn().mockReturnThis(),
    delete: vi.fn().mockReturnThis(),
  };
}
