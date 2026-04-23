import { LUGGAGE_SIZES, type LuggageSizeName } from "@/shared/luggage-sizes";

export function getWidthForSize(size: LuggageSizeName) {
  const sizeInfo = LUGGAGE_SIZES.find((s) => s.name === size);
  if (!sizeInfo) return "0";
  const fullWidth = LUGGAGE_SIZES.reduce(
    (sum, s) => sum + s.realWidth * s.gridCols + (s.gridCols - 1) * 2,
    0,
  );
  const sizeRelativeWidth =
    (sizeInfo.realWidth * sizeInfo.gridCols + (sizeInfo.gridCols - 1) * 2) /
    fullWidth;
  return `calc(${sizeRelativeWidth} * 100%)`;
}
