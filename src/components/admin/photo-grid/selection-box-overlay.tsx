import type { SelectionBoxOverlayProps } from "./types";

export function SelectionBoxOverlay({
  box,
  isLongPressMode,
  dragToSelectText,
}: SelectionBoxOverlayProps) {
  if (!box) return null;

  return (
    <>
      {/* Selection box */}
      <div
        className="absolute pointer-events-none border-2 border-blue-500 bg-blue-500/20 z-20"
        style={{
          left: box.left,
          top: box.top,
          width: box.right - box.left,
          height: box.bottom - box.top,
        }}
      />
      {/* Long press mode indicator */}
      {isLongPressMode && (
        <div className="fixed bottom-20 left-1/2 -translate-x-1/2 px-4 py-2 bg-blue-600 text-white rounded-full text-sm font-medium shadow-lg z-50">
          {dragToSelectText}
        </div>
      )}
    </>
  );
}
