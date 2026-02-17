import type { Photo } from "@/lib/db/schema";

export type FilterType = "all" | "upload-date" | "taken-date" | "live-photo" | "camera" | "visibility" | "iso" | "aperture" | "focal-length";
export type SortType = "created-desc" | "created-asc" | "taken-desc" | "taken-asc" | "title-asc" | "title-desc";
export type ViewMode = "grid" | "list";
export type GridSize = "small" | "medium" | "large";

export interface PhotoGridProps {
  photos: Photo[];
  onUpdate: () => void;
}

export interface GridPhotoItemTranslations {
  hidden: string;
  hide: string;
  show: string;
  edit: string;
  delete: string;
}

export interface ListPhotoItemTranslations extends GridPhotoItemTranslations {
  noTitle: string;
  dimensions: string;
  fileSize: string;
  device: string;
  aperture: string;
  shutterSpeed: string;
  iso: string;
  focalLength: string;
}

export interface GridPhotoItemProps {
  photo: Photo;
  isSelected: boolean;
  onSelect: (e?: React.MouseEvent) => void;
  onPreview: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onToggleVisibility: () => void;
  translations: GridPhotoItemTranslations;
}

export interface ListPhotoItemProps {
  photo: Photo;
  isSelected: boolean;
  onSelect: () => void;
  onPreview: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onToggleVisibility: () => void;
  translations: ListPhotoItemTranslations;
  locale: string;
}

export interface PreviewModalProps {
  photo: Photo;
  onClose: () => void;
  playingText: string;
}

export interface SelectionBoxOverlayProps {
  box: { left: number; top: number; right: number; bottom: number } | null;
  isLongPressMode: boolean;
  dragToSelectText: string;
}

// Grid size configurations
export const gridSizeConfig = {
  small: "grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10",
  medium: "grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6",
  large: "grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4",
} as const;
