import { describe, expect, test } from "bun:test";

import {
  canCellFitLuggage,
  selectSmallestFittingCell,
} from "@/shared/luggage-sizes";

describe("luggage allocation", () => {
  test("matches an exact free cell first", () => {
    const result = selectSmallestFittingCell(
      [
        { cellId: 11, size: "L", status: "available" },
        { cellId: 12, size: "XL", status: "available" },
      ],
      "L",
    );

    expect(result?.cellId).toBe(11);
    expect(result?.size).toBe("L");
  });

  test("falls back to the smallest larger cell", () => {
    const result = selectSmallestFittingCell(
      [
        { cellId: 33, size: "XL", status: "available" },
        { cellId: 34, size: "OVS", status: "available" },
      ],
      "L",
    );

    expect(result?.cellId).toBe(33);
    expect(result?.size).toBe("XL");
  });

  test("skips reserved and occupied cells", () => {
    const result = selectSmallestFittingCell(
      [
        { cellId: 51, size: "M", status: "reserved" },
        { cellId: 52, size: "M", status: "occupied" },
        { cellId: 53, size: "L", status: "available" },
      ],
      "M",
    );

    expect(result?.cellId).toBe(53);
    expect(canCellFitLuggage("M", result!.size)).toBe(true);
  });

  test("returns null when nothing fits", () => {
    const result = selectSmallestFittingCell(
      [
        { cellId: 81, size: "S", status: "occupied" },
        { cellId: 82, size: "S", status: "reserved" },
      ],
      "S",
    );

    expect(result).toBeNull();
  });
});
