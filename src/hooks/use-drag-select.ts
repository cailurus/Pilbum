"use client";

import { useState, useCallback, useRef, useEffect } from "react";

interface Point {
  x: number;
  y: number;
}

interface SelectionBox {
  startX: number;
  startY: number;
  endX: number;
  endY: number;
}

interface UseDragSelectOptions {
  containerRef: React.RefObject<HTMLElement | null>;
  itemSelector: string;
  getItemId: (element: Element) => string | null;
  onSelectionChange: (ids: Set<string>, isAdditive: boolean) => void;
  enabled?: boolean;
}

export function useDragSelect({
  containerRef,
  itemSelector,
  getItemId,
  onSelectionChange,
  enabled = true,
}: UseDragSelectOptions) {
  const [isDragging, setIsDragging] = useState(false);
  const [selectionBox, setSelectionBox] = useState<SelectionBox | null>(null);
  const startPointRef = useRef<Point | null>(null);
  const isAdditiveRef = useRef(false);
  const dragThreshold = 5; // Minimum pixels to start drag selection

  // Get normalized box coordinates (top-left to bottom-right)
  const getNormalizedBox = useCallback((box: SelectionBox) => {
    return {
      left: Math.min(box.startX, box.endX),
      top: Math.min(box.startY, box.endY),
      right: Math.max(box.startX, box.endX),
      bottom: Math.max(box.startY, box.endY),
    };
  }, []);

  // Check if two rectangles intersect
  const rectsIntersect = useCallback(
    (
      box: { left: number; top: number; right: number; bottom: number },
      rect: DOMRect,
      containerRect: DOMRect
    ) => {
      const itemLeft = rect.left - containerRect.left + containerRef.current!.scrollLeft;
      const itemTop = rect.top - containerRect.top + containerRef.current!.scrollTop;
      const itemRight = itemLeft + rect.width;
      const itemBottom = itemTop + rect.height;

      return !(
        box.right < itemLeft ||
        box.left > itemRight ||
        box.bottom < itemTop ||
        box.top > itemBottom
      );
    },
    [containerRef]
  );

  // Get all items that intersect with the selection box
  const getSelectedIds = useCallback(
    (box: SelectionBox) => {
      if (!containerRef.current) return new Set<string>();

      const normalizedBox = getNormalizedBox(box);
      const containerRect = containerRef.current.getBoundingClientRect();
      const items = containerRef.current.querySelectorAll(itemSelector);
      const selectedIds = new Set<string>();

      items.forEach((item) => {
        const rect = item.getBoundingClientRect();
        if (rectsIntersect(normalizedBox, rect, containerRect)) {
          const id = getItemId(item);
          if (id) selectedIds.add(id);
        }
      });

      return selectedIds;
    },
    [containerRef, itemSelector, getItemId, getNormalizedBox, rectsIntersect]
  );

  // Handle mouse down
  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      if (!enabled || !containerRef.current) return;

      // Only handle left click
      if (e.button !== 0) return;

      // Don't start drag if clicking on interactive elements
      const target = e.target as HTMLElement;
      if (
        target.closest("button") ||
        target.closest("input") ||
        target.closest("a") ||
        target.closest("[data-no-drag]")
      ) {
        return;
      }

      const containerRect = containerRef.current.getBoundingClientRect();
      const x = e.clientX - containerRect.left + containerRef.current.scrollLeft;
      const y = e.clientY - containerRect.top + containerRef.current.scrollTop;

      startPointRef.current = { x, y };
      isAdditiveRef.current = e.shiftKey || e.metaKey || e.ctrlKey;
    },
    [enabled, containerRef]
  );

  // Handle mouse move
  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (!startPointRef.current || !containerRef.current) return;

      const containerRect = containerRef.current.getBoundingClientRect();
      const x = e.clientX - containerRect.left + containerRef.current.scrollLeft;
      const y = e.clientY - containerRect.top + containerRef.current.scrollTop;

      const dx = Math.abs(x - startPointRef.current.x);
      const dy = Math.abs(y - startPointRef.current.y);

      // Start dragging if moved past threshold
      if (!isDragging && (dx > dragThreshold || dy > dragThreshold)) {
        setIsDragging(true);
      }

      if (isDragging || dx > dragThreshold || dy > dragThreshold) {
        const newBox = {
          startX: startPointRef.current.x,
          startY: startPointRef.current.y,
          endX: x,
          endY: y,
        };
        setSelectionBox(newBox);

        // Update selection in real-time
        const selectedIds = getSelectedIds(newBox);
        onSelectionChange(selectedIds, isAdditiveRef.current);
      }
    },
    [isDragging, containerRef, getSelectedIds, onSelectionChange]
  );

  // Handle mouse up
  const handleMouseUp = useCallback(() => {
    if (isDragging && selectionBox) {
      const selectedIds = getSelectedIds(selectionBox);
      onSelectionChange(selectedIds, isAdditiveRef.current);
    }

    setIsDragging(false);
    setSelectionBox(null);
    startPointRef.current = null;
  }, [isDragging, selectionBox, getSelectedIds, onSelectionChange]);

  // Handle touch events for mobile
  const touchStartRef = useRef<Point | null>(null);
  const touchStartTimeRef = useRef<number>(0);
  const longPressTimerRef = useRef<NodeJS.Timeout | null>(null);
  const [isLongPressMode, setIsLongPressMode] = useState(false);

  const handleTouchStart = useCallback(
    (e: React.TouchEvent) => {
      if (!enabled || !containerRef.current) return;

      const touch = e.touches[0];
      const target = touch.target as HTMLElement;

      // Don't start on interactive elements
      if (
        target.closest("button") ||
        target.closest("input") ||
        target.closest("a") ||
        target.closest("[data-no-drag]")
      ) {
        return;
      }

      const containerRect = containerRef.current.getBoundingClientRect();
      const x = touch.clientX - containerRect.left + containerRef.current.scrollLeft;
      const y = touch.clientY - containerRect.top + containerRef.current.scrollTop;

      touchStartRef.current = { x, y };
      touchStartTimeRef.current = Date.now();

      // Long press to enter selection mode
      longPressTimerRef.current = setTimeout(() => {
        setIsLongPressMode(true);
        startPointRef.current = { x, y };
        // Vibrate if supported
        if (navigator.vibrate) {
          navigator.vibrate(50);
        }
      }, 500);
    },
    [enabled, containerRef]
  );

  const handleTouchMove = useCallback(
    (e: React.TouchEvent) => {
      if (!containerRef.current) return;

      // Cancel long press if moving
      if (longPressTimerRef.current && !isLongPressMode) {
        const touch = e.touches[0];
        const containerRect = containerRef.current.getBoundingClientRect();
        const x = touch.clientX - containerRect.left + containerRef.current.scrollLeft;
        const y = touch.clientY - containerRect.top + containerRef.current.scrollTop;

        if (touchStartRef.current) {
          const dx = Math.abs(x - touchStartRef.current.x);
          const dy = Math.abs(y - touchStartRef.current.y);
          if (dx > 10 || dy > 10) {
            clearTimeout(longPressTimerRef.current);
            longPressTimerRef.current = null;
          }
        }
      }

      if (!isLongPressMode || !startPointRef.current) return;

      e.preventDefault();

      const touch = e.touches[0];
      const containerRect = containerRef.current.getBoundingClientRect();
      const x = touch.clientX - containerRect.left + containerRef.current.scrollLeft;
      const y = touch.clientY - containerRect.top + containerRef.current.scrollTop;

      const newBox = {
        startX: startPointRef.current.x,
        startY: startPointRef.current.y,
        endX: x,
        endY: y,
      };
      setSelectionBox(newBox);
      setIsDragging(true);

      const selectedIds = getSelectedIds(newBox);
      onSelectionChange(selectedIds, false);
    },
    [isLongPressMode, containerRef, getSelectedIds, onSelectionChange]
  );

  const handleTouchEnd = useCallback(() => {
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }

    if (isDragging && selectionBox) {
      const selectedIds = getSelectedIds(selectionBox);
      onSelectionChange(selectedIds, false);
    }

    setIsDragging(false);
    setSelectionBox(null);
    setIsLongPressMode(false);
    startPointRef.current = null;
    touchStartRef.current = null;
  }, [isDragging, selectionBox, getSelectedIds, onSelectionChange]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (longPressTimerRef.current) {
        clearTimeout(longPressTimerRef.current);
      }
    };
  }, []);

  // Global mouse up listener
  useEffect(() => {
    const handleGlobalMouseUp = () => {
      if (isDragging) {
        handleMouseUp();
      }
    };

    window.addEventListener("mouseup", handleGlobalMouseUp);
    return () => window.removeEventListener("mouseup", handleGlobalMouseUp);
  }, [isDragging, handleMouseUp]);

  return {
    isDragging,
    isLongPressMode,
    selectionBox: selectionBox ? getNormalizedBox(selectionBox) : null,
    handlers: {
      onMouseDown: handleMouseDown,
      onMouseMove: handleMouseMove,
      onMouseUp: handleMouseUp,
      onTouchStart: handleTouchStart,
      onTouchMove: handleTouchMove,
      onTouchEnd: handleTouchEnd,
    },
  };
}
