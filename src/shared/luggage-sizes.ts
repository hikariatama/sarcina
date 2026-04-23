export const LUGGAGE_SIZE_ORDER = ["S", "M", "L", "XL", "OVS"] as const;

export type LuggageSizeName = (typeof LUGGAGE_SIZE_ORDER)[number];

export type CellSelectionInput = {
  cellId: number;
  size: LuggageSizeName;
  status: "available" | "reserved" | "occupied";
};

const rankBySize = Object.fromEntries(
  LUGGAGE_SIZE_ORDER.map((size, index) => [size, index]),
) as Record<LuggageSizeName, number>;

export const LUGGAGE_SIZES = [
  {
    name: "OVS",
    dimensions: "25x220 cm",
    price: 3500,
    ids: Array.from({ length: 2 }, (_, index) => index + 1),
    gridRows: 1,
    gridCols: 2,
    realWidth: 250,
    rank: rankBySize.OVS,
  },
  {
    name: "XL",
    dimensions: "65x110 cm",
    price: 2000,
    ids: Array.from({ length: 10 }, (_, index) => index + 3),
    gridRows: 2,
    gridCols: 5,
    realWidth: 650,
    rank: rankBySize.XL,
  },
  {
    name: "L",
    dimensions: "65x75 cm",
    price: 1500,
    ids: Array.from({ length: 21 }, (_, index) => index + 13),
    gridRows: 3,
    gridCols: 7,
    realWidth: 650,
    rank: rankBySize.L,
  },
  {
    name: "M",
    dimensions: "55x44 cm",
    price: 1000,
    ids: Array.from({ length: 45 }, (_, index) => index + 34),
    gridRows: 5,
    gridCols: 9,
    realWidth: 550,
    rank: rankBySize.M,
  },
  {
    name: "S",
    dimensions: "45x37 cm",
    price: 700,
    ids: Array.from({ length: 54 }, (_, index) => index + 79),
    gridRows: 6,
    gridCols: 9,
    realWidth: 450,
    rank: rankBySize.S,
  },
] as const;

export function getLuggageSize(size: LuggageSizeName) {
  const luggageSize = LUGGAGE_SIZES.find((item) => item.name === size);

  if (!luggageSize) {
    throw new Error(`Unsupported luggage size: ${size}`);
  }

  return luggageSize;
}

export function getSizeRank(size: LuggageSizeName) {
  return rankBySize[size];
}

export function canCellFitLuggage(
  requestedSize: LuggageSizeName,
  cellSize: LuggageSizeName,
) {
  return getSizeRank(cellSize) >= getSizeRank(requestedSize);
}

export function getBillableRate(size: LuggageSizeName) {
  return getLuggageSize(size).price;
}

export function selectSmallestFittingCell(
  cells: readonly CellSelectionInput[],
  requestedSize: LuggageSizeName,
) {
  return (
    [...cells]
      .filter(
        (cell) =>
          cell.status === "available" &&
          canCellFitLuggage(requestedSize, cell.size),
      )
      .sort((left, right) => {
        const sizeDelta = getSizeRank(left.size) - getSizeRank(right.size);

        if (sizeDelta !== 0) {
          return sizeDelta;
        }

        return left.cellId - right.cellId;
      })[0] ?? null
  );
}

export function formatStorageWindow(durationMs: number) {
  const totalHours = Math.max(1, Math.ceil(durationMs / (1000 * 60 * 60)));
  const days = Math.floor(totalHours / 24);
  const hours = totalHours % 24;

  if (days === 0) {
    return `${hours} h`;
  }

  if (hours === 0) {
    return `${days} d`;
  }

  return `${days} d ${hours} h`;
}
