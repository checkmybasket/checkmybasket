"use client";
import { useMemo } from "react";
import { qrMatrix, qrSvgPath } from "@/lib/qr";

export function QRCodeSvg({ value, size = 128, className }: { value: string; size?: number; className?: string }) {
  const { path, modules } = useMemo(() => {
    const matrix = qrMatrix(value);
    return { path: qrSvgPath(matrix), modules: matrix.length };
  }, [value]);
  // 2-module quiet zone on a white field; dark modules in brand forest green
  return (
    <svg width={size} height={size} viewBox={`-2 -2 ${modules + 4} ${modules + 4}`} className={className}
      role="img" aria-label={`QR code for ${value}`} shapeRendering="crispEdges">
      <rect x={-2} y={-2} width={modules + 4} height={modules + 4} fill="#FFFFFF" />
      <path d={path} fill="#1B4332" />
    </svg>
  );
}
