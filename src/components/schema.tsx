import type { CellStatus } from "@/shared/contracts";
import { cn } from "@/lib/utils";
import { LUGGAGE_SIZES } from "@/shared/luggage-sizes";

export function Schema({
  highlightCell,
  cells,
}: {
  highlightCell?: number;
  cells?: Array<{ cellId: number; status: CellStatus }>;
}) {
  return (
    <div className="flex h-24 items-center justify-start gap-0.5">
      {LUGGAGE_SIZES.map((s) => (
        <div
          key={s.name}
          className="grid h-full gap-0.5"
          style={{
            gridTemplateColumns: `repeat(${s.gridCols}, minmax(0, 1fr))`,
            gridTemplateRows: `repeat(${s.gridRows}, minmax(0, 1fr))`,
            flexGrow: s.realWidth * s.gridCols,
          }}
        >
          {s.ids.map((id) => {
            const cellState = cells?.find((cell) => cell.cellId === id)?.status;

            return (
              <div
                key={id}
                className={cn(
                  "min-h-0 rounded-[1px]",
                  id === highlightCell
                    ? "bg-brand"
                    : cellState === "occupied"
                      ? "bg-[#35322d]"
                      : cellState === "reserved"
                        ? "bg-[#8d7d67]"
                        : "bg-black/20",
                )}
              />
            );
          })}
        </div>
      ))}
    </div>
  );
}
