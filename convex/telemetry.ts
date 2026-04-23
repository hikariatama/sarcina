import type {
  DashboardMetrics,
  OccupancyBySize,
  TelemetryEventType,
} from "@/shared/contracts";
import { calculateDashboardMetrics } from "@/shared/observability";
import { LUGGAGE_SIZE_ORDER } from "@/shared/luggage-sizes";
import { query } from "./_generated/server";
import type { MutationCtx } from "./_generated/server";
import type { Doc, Id } from "./_generated/dataModel";

type RecordTelemetryEventArgs = {
  eventType: TelemetryEventType;
  timestamp: number;
  bookingId?: Id<"bookings">;
  bookingNumber?: string;
  cellId?: number;
  correlationId: string;
  route: string;
  requestedSize?: Doc<"bookings">["requestedSize"];
  allocatedSize?: Doc<"bookings">["allocatedSize"];
  paymentMethod?: Doc<"payments">["method"];
  paymentStatus?: Doc<"payments">["status"];
  bookingStatus?: Doc<"bookings">["status"];
  amountRub?: number;
};

export async function recordTelemetryEvent(
  ctx: MutationCtx,
  args: RecordTelemetryEventArgs,
) {
  const eventId = await ctx.db.insert("telemetryEvents", {
    timestamp: args.timestamp,
    eventType: args.eventType,
    bookingId: args.bookingId,
    bookingNumber: args.bookingNumber,
    cellId: args.cellId,
    correlationId: args.correlationId,
    route: args.route,
    requestedSize: args.requestedSize,
    allocatedSize: args.allocatedSize,
    paymentMethod: args.paymentMethod,
    paymentStatus: args.paymentStatus,
    bookingStatus: args.bookingStatus,
    amountRub: args.amountRub,
  });

  console.log(
    JSON.stringify({
      timestamp: new Date(args.timestamp).toISOString(),
      eventType: args.eventType,
      bookingNumber: args.bookingNumber ?? null,
      cellId: args.cellId ?? null,
      correlationId: args.correlationId,
      route: args.route,
      eventId,
    }),
  );
}

export const getRecentEvents = query({
  args: {},
  handler: async (ctx) => {
    const events = await ctx.db
      .query("telemetryEvents")
      .withIndex("by_timestamp")
      .order("desc")
      .take(20);

    return events.map((event) => ({
      id: event._id,
      timestamp: event.timestamp,
      eventType: event.eventType,
      bookingNumber: event.bookingNumber ?? null,
      cellId: event.cellId ?? null,
      correlationId: event.correlationId,
      route: event.route,
    }));
  },
});

export const getDashboardMetrics = query({
  args: {},
  handler: async (ctx): Promise<DashboardMetrics> => {
    const bookings = await ctx.db.query("bookings").collect();
    const payments = await ctx.db.query("payments").collect();
    const noFreeCellsCount = (
      await ctx.db
        .query("telemetryEvents")
        .withIndex("by_event_type_timestamp", (query) =>
          query.eq("eventType", "no_cells_available"),
        )
        .collect()
    ).length;
    return calculateDashboardMetrics({
      bookings,
      payments,
      noFreeCellsCount,
    });
  },
});

export const getOccupancyBySize = query({
  args: {},
  handler: async (ctx): Promise<OccupancyBySize[]> => {
    const cells = await ctx.db.query("cells").collect();

    return LUGGAGE_SIZE_ORDER.map((size) => {
      const matchingCells = cells.filter((cell) => cell.size === size);
      const available = matchingCells.filter(
        (cell) => cell.status === "available",
      ).length;
      const reserved = matchingCells.filter(
        (cell) => cell.status === "reserved",
      ).length;
      const occupied = matchingCells.filter(
        (cell) => cell.status === "occupied",
      ).length;

      return {
        size,
        occupied,
        reserved,
        available,
        total: matchingCells.length,
      };
    });
  },
});
