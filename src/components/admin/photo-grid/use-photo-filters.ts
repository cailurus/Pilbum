"use client";

import { useMemo } from "react";
import type { Photo } from "@/lib/db/schema";
import type { FilterType, SortType } from "./types";

interface FilterOptions {
  uploadDates: [string, number][];
  takenDates: [string, number][];
  cameras: [string, number][];
  isoValues: [number, number][];
  apertureValues: [number, number][];
  focalLengths: [number, number][];
  livePhotoCount: number;
  staticPhotoCount: number;
  visibleCount: number;
  hiddenCount: number;
}

export function usePhotoFilters(
  photos: Photo[],
  filterType: FilterType,
  filterValue: string,
  sortType: SortType,
  locale: string
) {
  // Get unique filter options
  const filterOptions = useMemo<FilterOptions>(() => {
    const uploadDates = new Map<string, number>();
    const takenDates = new Map<string, number>();
    const cameras = new Map<string, number>();
    const isoValues = new Map<number, number>();
    const apertureValues = new Map<number, number>();
    const focalLengths = new Map<number, number>();

    photos.forEach((photo) => {
      const uploadDate = new Date(photo.createdAt).toLocaleDateString(locale);
      uploadDates.set(uploadDate, (uploadDates.get(uploadDate) || 0) + 1);

      if (photo.takenAt) {
        const takenDate = new Date(photo.takenAt).toLocaleDateString(locale);
        takenDates.set(takenDate, (takenDates.get(takenDate) || 0) + 1);
      }
      if (photo.cameraModel) {
        cameras.set(photo.cameraModel, (cameras.get(photo.cameraModel) || 0) + 1);
      }
      if (photo.iso) {
        isoValues.set(photo.iso, (isoValues.get(photo.iso) || 0) + 1);
      }
      if (photo.aperture) {
        const rounded = Math.round(photo.aperture * 10) / 10;
        apertureValues.set(rounded, (apertureValues.get(rounded) || 0) + 1);
      }
      if (photo.focalLength) {
        const rounded = Math.round(photo.focalLength);
        focalLengths.set(rounded, (focalLengths.get(rounded) || 0) + 1);
      }
    });

    return {
      uploadDates: Array.from(uploadDates.entries()).sort((a, b) => b[0].localeCompare(a[0])),
      takenDates: Array.from(takenDates.entries()).sort((a, b) => b[0].localeCompare(a[0])),
      cameras: Array.from(cameras.entries()).sort((a, b) => a[0].localeCompare(b[0])),
      isoValues: Array.from(isoValues.entries()).sort((a, b) => a[0] - b[0]),
      apertureValues: Array.from(apertureValues.entries()).sort((a, b) => a[0] - b[0]),
      focalLengths: Array.from(focalLengths.entries()).sort((a, b) => a[0] - b[0]),
      livePhotoCount: photos.filter(p => p.isLivePhoto).length,
      staticPhotoCount: photos.filter(p => !p.isLivePhoto).length,
      visibleCount: photos.filter(p => p.isVisible !== false).length,
      hiddenCount: photos.filter(p => p.isVisible === false).length,
    };
  }, [photos, locale]);

  // Filter and sort photos
  const filteredPhotos = useMemo(() => {
    let result = photos;

    // Apply filter
    if (filterType !== "all" && filterValue) {
      result = result.filter((photo) => {
        switch (filterType) {
          case "upload-date":
            return new Date(photo.createdAt).toLocaleDateString(locale) === filterValue;
          case "taken-date":
            return photo.takenAt && new Date(photo.takenAt).toLocaleDateString(locale) === filterValue;
          case "live-photo":
            return filterValue === "live" ? photo.isLivePhoto : !photo.isLivePhoto;
          case "camera":
            return photo.cameraModel === filterValue;
          case "visibility":
            return filterValue === "visible" ? photo.isVisible !== false : photo.isVisible === false;
          case "iso":
            return photo.iso === parseInt(filterValue);
          case "aperture":
            return photo.aperture && Math.round(photo.aperture * 10) / 10 === parseFloat(filterValue);
          case "focal-length":
            return photo.focalLength && Math.round(photo.focalLength) === parseInt(filterValue);
          default:
            return true;
        }
      });
    }

    // Apply sort
    result = [...result].sort((a, b) => {
      switch (sortType) {
        case "created-desc":
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        case "created-asc":
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        case "taken-desc":
          if (!a.takenAt && !b.takenAt) return 0;
          if (!a.takenAt) return 1;
          if (!b.takenAt) return -1;
          return new Date(b.takenAt).getTime() - new Date(a.takenAt).getTime();
        case "taken-asc":
          if (!a.takenAt && !b.takenAt) return 0;
          if (!a.takenAt) return 1;
          if (!b.takenAt) return -1;
          return new Date(a.takenAt).getTime() - new Date(b.takenAt).getTime();
        case "title-asc":
          return (a.title || "").localeCompare(b.title || "");
        case "title-desc":
          return (b.title || "").localeCompare(a.title || "");
        default:
          return 0;
      }
    });

    return result;
  }, [photos, filterType, filterValue, sortType, locale]);

  return { filterOptions, filteredPhotos };
}
