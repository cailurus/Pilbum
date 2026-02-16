"use client";

import { useState, useEffect, useRef, useCallback } from "react";

/**
 * Custom hook to handle image loading state with proper caching support
 * Fixes issues where onLoad doesn't fire for cached images
 */
export function useImageLoaded(src: string) {
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);
  const imgRef = useRef<HTMLImageElement | null>(null);

  // Reset state when src changes
  useEffect(() => {
    setLoaded(false);
    setError(false);
  }, [src]);

  // Check if image is already loaded (from cache)
  useEffect(() => {
    if (!src) return;

    // Create a new image element to check loading status
    const img = new Image();
    img.src = src;

    // If already complete (cached), mark as loaded immediately
    if (img.complete && img.naturalWidth > 0) {
      setLoaded(true);
      return;
    }

    // Otherwise, wait for load/error events
    const handleLoad = () => setLoaded(true);
    const handleError = () => {
      setError(true);
      setLoaded(true); // Still set loaded to remove blur
    };

    img.addEventListener("load", handleLoad);
    img.addEventListener("error", handleError);

    return () => {
      img.removeEventListener("load", handleLoad);
      img.removeEventListener("error", handleError);
    };
  }, [src]);

  // Callback for the actual img element's onLoad
  const onLoad = useCallback(() => {
    setLoaded(true);
  }, []);

  // Callback for error
  const onError = useCallback(() => {
    setError(true);
    setLoaded(true);
  }, []);

  // Ref callback to check if image is already complete
  const refCallback = useCallback((node: HTMLImageElement | null) => {
    imgRef.current = node;
    if (node?.complete && node.naturalWidth > 0) {
      setLoaded(true);
    }
  }, []);

  return { loaded, error, onLoad, onError, refCallback };
}
