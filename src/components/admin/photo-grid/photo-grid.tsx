"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { useTranslations, useLocale } from "next-intl";
import type { Photo } from "@/lib/db/schema";
import { PhotoEditModal } from "../photo-edit-modal";
import { useDragSelect } from "@/hooks/use-drag-select";
import { getStoredValue } from "@/lib/local-storage";

import { GridPhotoItem } from "./grid-photo-item";
import { ListPhotoItem } from "./list-photo-item";
import { PreviewModal } from "./preview-modal";
import { SelectionBoxOverlay } from "./selection-box-overlay";
import { usePhotoFilters } from "./use-photo-filters";
import type { PhotoGridProps, FilterType, SortType, ViewMode, GridSize } from "./types";
import { gridSizeConfig } from "./types";

export function PhotoGrid({ photos, onUpdate }: PhotoGridProps) {
  const t = useTranslations();
  const locale = useLocale();
  const [editingPhoto, setEditingPhoto] = useState<Photo | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [batchDeleting, setBatchDeleting] = useState(false);
  const [filterType, setFilterType] = useState<FilterType>("all");
  const [filterValue, setFilterValue] = useState("");
  const [sortType, setSortType] = useState<SortType>(() => getStoredValue("photoGridSortType", "created-desc"));
  const [viewMode, setViewMode] = useState<ViewMode>(() => getStoredValue("photoGridViewMode", "grid"));
  const [gridSize, setGridSize] = useState<GridSize>(() => getStoredValue("photoGridSize", "medium"));
  const [previewPhoto, setPreviewPhoto] = useState<Photo | null>(null);
  const [dragSelectEnabled] = useState(true);

  // Refs for drag selection
  const gridContainerRef = useRef<HTMLDivElement>(null);
  const listContainerRef = useRef<HTMLDivElement>(null);

  // Filter and sort photos
  const { filterOptions, filteredPhotos } = usePhotoFilters(
    photos,
    filterType,
    filterValue,
    sortType,
    locale
  );

  // Drag selection handler
  const handleDragSelectionChange = useCallback((newIds: Set<string>, isAdditive: boolean) => {
    if (isAdditive) {
      setSelectedIds(prev => {
        const combined = new Set(prev);
        newIds.forEach(id => combined.add(id));
        return combined;
      });
    } else {
      setSelectedIds(newIds);
    }
  }, []);

  // Drag select for grid
  const gridDragSelect = useDragSelect({
    containerRef: gridContainerRef,
    itemSelector: "[data-photo-id]",
    getItemId: (el) => el.getAttribute("data-photo-id"),
    onSelectionChange: handleDragSelectionChange,
    enabled: dragSelectEnabled && viewMode === "grid",
  });

  // Drag select for list
  const listDragSelect = useDragSelect({
    containerRef: listContainerRef,
    itemSelector: "[data-photo-id]",
    getItemId: (el) => el.getAttribute("data-photo-id"),
    onSelectionChange: handleDragSelectionChange,
    enabled: dragSelectEnabled && viewMode === "list",
  });

  // Persist view mode, grid size, and sort type to localStorage
  useEffect(() => {
    localStorage.setItem("photoGridViewMode", JSON.stringify(viewMode));
  }, [viewMode]);

  useEffect(() => {
    localStorage.setItem("photoGridSize", JSON.stringify(gridSize));
  }, [gridSize]);

  useEffect(() => {
    localStorage.setItem("photoGridSortType", JSON.stringify(sortType));
  }, [sortType]);

  // Toggle photo visibility
  const toggleVisibility = useCallback(async (id: string, currentVisible: boolean) => {
    try {
      const res = await fetch(`/api/photos/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isVisible: !currentVisible }),
      });
      if (res.ok) {
        onUpdate();
      }
    } catch {
      // Silently fail
    }
  }, [onUpdate]);

  // Selection handlers
  const toggleSelect = useCallback((id: string, e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }, []);

  const toggleSelectAll = () => {
    if (selectedIds.size === filteredPhotos.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredPhotos.map((p) => p.id)));
    }
  };

  const clearSelection = () => setSelectedIds(new Set());

  // Batch delete
  async function handleBatchDelete() {
    if (selectedIds.size === 0) return;
    if (!confirm(t("admin.deleteConfirm", { count: selectedIds.size }))) return;

    setBatchDeleting(true);
    try {
      const res = await fetch("/api/photos/batch-delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids: Array.from(selectedIds) }),
      });

      if (res.ok) {
        setSelectedIds(new Set());
        onUpdate();
      } else {
        const data = await res.json();
        alert(data.error || t("admin.deleteFailed"));
      }
    } catch {
      alert(t("admin.deleteFailed"));
    } finally {
      setBatchDeleting(false);
    }
  }

  // Single delete
  async function handleDelete(id: string) {
    if (!confirm(t("admin.deleteSingleConfirm"))) return;

    try {
      await fetch(`/api/photos/${id}`, { method: "DELETE" });
      onUpdate();
    } catch {
      // Silently fail
    }
  }

  if (photos.length === 0) {
    return (
      <div className="text-center text-neutral-500 py-20">
        <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-neutral-100 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 flex items-center justify-center">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-neutral-400 dark:text-neutral-600">
            <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
            <circle cx="8.5" cy="8.5" r="1.5" />
            <polyline points="21 15 16 10 5 21" />
          </svg>
        </div>
        <p className="text-lg mb-2">{t("admin.noPhotos")}</p>
        <p className="text-sm">{t("admin.uploadFirst")}</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 p-3">
        <div className="flex flex-wrap items-center gap-3">
          {/* Selection controls */}
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={selectedIds.size === filteredPhotos.length && filteredPhotos.length > 0}
              onChange={toggleSelectAll}
              className="w-4 h-4 rounded border-neutral-300 dark:border-neutral-600 bg-white dark:bg-neutral-800 text-blue-600 dark:text-white focus:ring-0 focus:ring-offset-0 cursor-pointer"
            />
            <span className="text-sm text-neutral-600 dark:text-neutral-400">
              {selectedIds.size > 0 ? t("common.selected", { count: selectedIds.size }) : t("common.selectAll")}
            </span>
          </label>

          {selectedIds.size > 0 && (
            <>
              <button
                onClick={clearSelection}
                className="text-sm text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white transition-colors cursor-pointer"
              >
                {t("common.cancel")}
              </button>
              <button
                onClick={handleBatchDelete}
                disabled={batchDeleting}
                className="px-3 py-1.5 bg-red-600 hover:bg-red-500 text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed"
              >
                {batchDeleting ? t("common.deleting") : t("common.delete")}
              </button>
            </>
          )}

          <div className="flex-1" />

          {/* Filter */}
          <select
            value={filterType}
            onChange={(e) => {
              setFilterType(e.target.value as FilterType);
              setFilterValue("");
            }}
            className="px-3 py-1.5 bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg text-neutral-900 dark:text-white text-sm focus:outline-none"
          >
            <option value="all">{t("filter.all")} ({photos.length})</option>
            <option value="visibility">{t("filter.byVisibility")}</option>
            <option value="upload-date">{t("filter.byUploadDate")}</option>
            <option value="taken-date">{t("filter.byTakenDate")}</option>
            <option value="live-photo">{t("filter.byType")}</option>
            <option value="camera">{t("filter.byCamera")}</option>
            <option value="iso">{t("filter.byISO")}</option>
            <option value="aperture">{t("filter.byAperture")}</option>
            <option value="focal-length">{t("filter.byFocalLength")}</option>
          </select>

          {filterType === "visibility" && (
            <select
              value={filterValue}
              onChange={(e) => setFilterValue(e.target.value)}
              className="px-3 py-1.5 bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg text-neutral-900 dark:text-white text-sm focus:outline-none"
            >
              <option value="">{t("filter.selectStatus")}</option>
              <option value="visible">{t("filter.visible")} ({filterOptions.visibleCount})</option>
              <option value="hidden">{t("filter.hiddenItems")} ({filterOptions.hiddenCount})</option>
            </select>
          )}

          {filterType === "upload-date" && (
            <select
              value={filterValue}
              onChange={(e) => setFilterValue(e.target.value)}
              className="px-3 py-1.5 bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg text-neutral-900 dark:text-white text-sm focus:outline-none"
            >
              <option value="">{t("filter.selectDate")}</option>
              {filterOptions.uploadDates.map(([date, count]) => (
                <option key={date} value={date}>{date} ({count})</option>
              ))}
            </select>
          )}

          {filterType === "taken-date" && (
            <select
              value={filterValue}
              onChange={(e) => setFilterValue(e.target.value)}
              className="px-3 py-1.5 bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg text-neutral-900 dark:text-white text-sm focus:outline-none"
            >
              <option value="">{t("filter.selectDate")}</option>
              {filterOptions.takenDates.map(([date, count]) => (
                <option key={date} value={date}>{date} ({count})</option>
              ))}
            </select>
          )}

          {filterType === "live-photo" && (
            <select
              value={filterValue}
              onChange={(e) => setFilterValue(e.target.value)}
              className="px-3 py-1.5 bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg text-neutral-900 dark:text-white text-sm focus:outline-none"
            >
              <option value="">{t("filter.selectType")}</option>
              <option value="live">{t("filter.livePhoto")} ({filterOptions.livePhotoCount})</option>
              <option value="static">{t("filter.staticPhoto")} ({filterOptions.staticPhotoCount})</option>
            </select>
          )}

          {filterType === "camera" && (
            <select
              value={filterValue}
              onChange={(e) => setFilterValue(e.target.value)}
              className="px-3 py-1.5 bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg text-neutral-900 dark:text-white text-sm focus:outline-none"
            >
              <option value="">{t("filter.selectCamera")}</option>
              {filterOptions.cameras.map(([camera, count]) => (
                <option key={camera} value={camera}>{camera} ({count})</option>
              ))}
            </select>
          )}

          {filterType === "iso" && (
            <select
              value={filterValue}
              onChange={(e) => setFilterValue(e.target.value)}
              className="px-3 py-1.5 bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg text-neutral-900 dark:text-white text-sm focus:outline-none"
            >
              <option value="">{t("filter.selectISO")}</option>
              {filterOptions.isoValues.map(([iso, count]) => (
                <option key={iso} value={iso}>ISO {iso} ({count})</option>
              ))}
            </select>
          )}

          {filterType === "aperture" && (
            <select
              value={filterValue}
              onChange={(e) => setFilterValue(e.target.value)}
              className="px-3 py-1.5 bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg text-neutral-900 dark:text-white text-sm focus:outline-none"
            >
              <option value="">{t("filter.selectAperture")}</option>
              {filterOptions.apertureValues.map(([aperture, count]) => (
                <option key={aperture} value={aperture}>f/{aperture} ({count})</option>
              ))}
            </select>
          )}

          {filterType === "focal-length" && (
            <select
              value={filterValue}
              onChange={(e) => setFilterValue(e.target.value)}
              className="px-3 py-1.5 bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg text-neutral-900 dark:text-white text-sm focus:outline-none"
            >
              <option value="">{t("filter.selectFocalLength")}</option>
              {filterOptions.focalLengths.map(([fl, count]) => (
                <option key={fl} value={fl}>{fl}mm ({count})</option>
              ))}
            </select>
          )}

          {filterValue && (
            <button
              onClick={() => {
                setFilterType("all");
                setFilterValue("");
              }}
              className="text-sm text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white cursor-pointer"
            >
              {t("common.clear")}
            </button>
          )}

          {/* Sort */}
          <select
            value={sortType}
            onChange={(e) => setSortType(e.target.value as SortType)}
            className="px-3 py-1.5 bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg text-neutral-900 dark:text-white text-sm focus:outline-none"
          >
            <option value="created-desc">{t("sort.uploadTimeDesc")}</option>
            <option value="created-asc">{t("sort.uploadTimeAsc")}</option>
            <option value="taken-desc">{t("sort.takenTimeDesc")}</option>
            <option value="taken-asc">{t("sort.takenTimeAsc")}</option>
            <option value="title-asc">{t("sort.titleAZ")}</option>
            <option value="title-desc">{t("sort.titleZA")}</option>
          </select>

          {/* Grid size control (only in grid mode) */}
          {viewMode === "grid" && (
            <div className="flex items-center gap-2">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-neutral-400 dark:text-neutral-500">
                <rect x="3" y="3" width="7" height="7" />
                <rect x="14" y="3" width="7" height="7" />
                <rect x="3" y="14" width="7" height="7" />
                <rect x="14" y="14" width="7" height="7" />
              </svg>
              <input
                type="range"
                min="0"
                max="2"
                value={gridSize === "small" ? 0 : gridSize === "medium" ? 1 : 2}
                onChange={(e) => {
                  const val = parseInt(e.target.value);
                  setGridSize(val === 0 ? "small" : val === 1 ? "medium" : "large");
                }}
                className="w-20 h-1 bg-neutral-300 dark:bg-neutral-700 rounded-lg appearance-none cursor-pointer accent-neutral-900 dark:accent-white"
              />
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-neutral-400 dark:text-neutral-500">
                <rect x="3" y="3" width="7" height="7" />
                <rect x="14" y="3" width="7" height="7" />
                <rect x="3" y="14" width="7" height="7" />
                <rect x="14" y="14" width="7" height="7" />
              </svg>
            </div>
          )}

          {/* View mode toggle */}
          <div className="flex items-center bg-neutral-100 dark:bg-neutral-800 rounded-lg p-0.5">
            <button
              onClick={() => setViewMode("grid")}
              className={`p-1.5 rounded transition-colors cursor-pointer ${viewMode === "grid" ? "bg-white dark:bg-neutral-700 shadow-sm text-neutral-900 dark:text-white" : "text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white"}`}
              title={t("view.gridView")}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="3" width="7" height="7" />
                <rect x="14" y="3" width="7" height="7" />
                <rect x="3" y="14" width="7" height="7" />
                <rect x="14" y="14" width="7" height="7" />
              </svg>
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={`p-1.5 rounded transition-colors cursor-pointer ${viewMode === "list" ? "bg-white dark:bg-neutral-700 shadow-sm text-neutral-900 dark:text-white" : "text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white"}`}
              title={t("view.listView")}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="8" y1="6" x2="21" y2="6" />
                <line x1="8" y1="12" x2="21" y2="12" />
                <line x1="8" y1="18" x2="21" y2="18" />
                <line x1="3" y1="6" x2="3.01" y2="6" />
                <line x1="3" y1="12" x2="3.01" y2="12" />
                <line x1="3" y1="18" x2="3.01" y2="18" />
              </svg>
            </button>
          </div>

          {/* Filter status - inline */}
          {filterValue && (
            <span className="text-sm text-neutral-500 dark:text-neutral-400">
              · {t("common.showing", { count: filteredPhotos.length })}
            </span>
          )}
        </div>
      </div>

      {/* Grid View */}
      {viewMode === "grid" ? (
        <div
          ref={gridContainerRef}
          className={`relative grid ${gridSizeConfig[gridSize]} gap-1`}
          {...gridDragSelect.handlers}
        >
          {filteredPhotos.map((photo) => (
            <GridPhotoItem
              key={photo.id}
              photo={photo}
              isSelected={selectedIds.has(photo.id)}
              onSelect={(e) => toggleSelect(photo.id, e)}
              onPreview={() => !gridDragSelect.isDragging && setPreviewPhoto(photo)}
              onEdit={() => setEditingPhoto(photo)}
              onDelete={() => handleDelete(photo.id)}
              onToggleVisibility={() => toggleVisibility(photo.id, photo.isVisible !== false)}
              translations={{
                hidden: t("common.hidden"),
                hide: t("common.hide"),
                show: t("common.show"),
                edit: t("common.edit"),
                delete: t("common.delete"),
              }}
            />
          ))}
          <SelectionBoxOverlay
            box={gridDragSelect.selectionBox}
            isLongPressMode={gridDragSelect.isLongPressMode}
            dragToSelectText={t("view.dragToSelect")}
          />
        </div>
      ) : (
        /* List View - Compact with Live Photo support */
        <div
          ref={listContainerRef}
          className="relative space-y-2"
          {...listDragSelect.handlers}
        >
          {filteredPhotos.map((photo) => (
            <ListPhotoItem
              key={photo.id}
              photo={photo}
              isSelected={selectedIds.has(photo.id)}
              onSelect={() => toggleSelect(photo.id)}
              onPreview={() => !listDragSelect.isDragging && setPreviewPhoto(photo)}
              onEdit={() => setEditingPhoto(photo)}
              onDelete={() => handleDelete(photo.id)}
              onToggleVisibility={() => toggleVisibility(photo.id, photo.isVisible !== false)}
              translations={{
                hidden: t("common.hidden"),
                hide: t("common.hide"),
                show: t("common.show"),
                edit: t("common.edit"),
                delete: t("common.delete"),
                noTitle: t("common.noTitle"),
                dimensions: t("photo.dimensions"),
                fileSize: t("photo.fileSize"),
                device: t("photo.device"),
                aperture: t("photo.aperture"),
                shutterSpeed: t("photo.shutterSpeed"),
                iso: t("photo.iso"),
                focalLength: t("photo.focalLength"),
              }}
              locale={locale}
            />
          ))}
          <SelectionBoxOverlay
            box={listDragSelect.selectionBox}
            isLongPressMode={listDragSelect.isLongPressMode}
            dragToSelectText={t("view.dragToSelect")}
          />
        </div>
      )}

      {/* Preview Modal - photo only */}
      {previewPhoto && (
        <PreviewModal
          photo={previewPhoto}
          onClose={() => setPreviewPhoto(null)}
          playingText={t("photo.playing")}
        />
      )}

      {/* Edit Modal */}
      <PhotoEditModal
        photo={editingPhoto}
        onClose={() => setEditingPhoto(null)}
        onSave={onUpdate}
      />
    </div>
  );
}
