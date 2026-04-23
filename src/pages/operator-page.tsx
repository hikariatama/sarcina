import { useMutation, useQuery } from "convex/react";

import { Button } from "@/components/button";
import { Card } from "@/components/card";
import { Footer } from "@/components/footer";
import { Header } from "@/components/header";
import { Schema } from "@/components/schema";
import { env } from "@/lib/env";
import { useStateStore } from "@/store/state-store";
import { api } from "../../convex/_generated/api";

export default function OperatorPage() {
  const setCurrentBooking = useStateStore((state) => state.setCurrentBooking);
  const resetSession = useStateStore((state) => state.resetSession);
  const correlationId = useStateStore((state) => state.correlationId);
  const startClaim = useMutation(api.bookings.startClaim);
  const resetDemoData = useMutation(api.cells.resetDemoData);
  const metrics = useQuery(api.telemetry.getDashboardMetrics);
  const occupancyBySize = useQuery(api.telemetry.getOccupancyBySize);
  const recentEvents = useQuery(api.telemetry.getRecentEvents);
  const activeBookings = useQuery(api.bookings.listActiveBookings);
  const cellStatuses = useQuery(api.cells.getCellStatuses);
  const kioskUrl = env.basePath === "/" ? "/" : env.basePath;
  const paymentUrl =
    env.basePath === "/"
      ? "/?screen=payment"
      : `${env.basePath}?screen=payment`;

  const navigateWithinApp = (nextUrl: string) => {
    window.history.pushState(null, "", nextUrl);
    window.dispatchEvent(new PopStateEvent("popstate"));
  };

  return (
    <div className="min-h-screen bg-white p-8">
      <div className="flex min-h-[calc(100vh-4rem)] w-full flex-col p-12">
        <Header>
          <Button variant="system" onClick={() => navigateWithinApp(kioskUrl)}>
            Open kiosk
          </Button>
        </Header>
        <div className="flex flex-1 flex-col gap-8 py-8">
          <Card className="items-start gap-3">
            <div className="text-3xl font-black">Operator dashboard</div>
            <div className="text-xl font-semibold text-black/50">
              Booking attempts: {metrics?.totalBookingAttempts ?? "—"}
            </div>
            <div className="text-xl font-semibold text-black/50">
              Active bookings: {metrics?.activeBookingsCount ?? "—"}
            </div>
            <div className="text-xl font-semibold text-black/50">
              Payment success rate: {metrics?.paymentSuccessRate ?? "—"}%
            </div>
            <Button
              variant="system"
              onClick={() => {
                resetSession();
                void resetDemoData({});
              }}
            >
              Reset demo data
            </Button>
          </Card>
          <Card className="items-start">
            <div className="text-3xl font-black">Terminal map</div>
            <Schema cells={cellStatuses ?? undefined} />
          </Card>
          <div className="grid flex-1 grid-cols-[1.1fr_0.9fr] gap-8">
            <div className="flex flex-col gap-8">
              <Card className="items-start">
                <div className="text-3xl font-black">Live bookings</div>
                <div className="flex w-full flex-col gap-4">
                  {activeBookings?.length ? (
                    activeBookings.map((booking) => (
                      <div
                        key={booking.bookingId}
                        className="outline-brand flex w-full items-center justify-between gap-6 rounded-3xl bg-white px-6 py-4 outline-2"
                      >
                        <div className="flex flex-col gap-1">
                          <div className="text-2xl font-black">
                            {booking.bookingNumber}
                          </div>
                          <div className="text-lg font-semibold text-black/50">
                            Claim code {booking.claimCode}, cell{" "}
                            {booking.cellId}, {booking.currentAmountRub} ₽
                          </div>
                          <div className="text-lg font-semibold text-black/50">
                            {booking.statusLabel}, duration{" "}
                            {booking.durationLabel}
                          </div>
                        </div>
                        <Button
                          variant="system"
                          onClick={() => {
                            void startClaim({
                              bookingId: booking.bookingId,
                              correlationId,
                              route: "support-claim",
                            }).then((result) => {
                              setCurrentBooking(result);
                              navigateWithinApp(paymentUrl);
                            });
                          }}
                        >
                          Open claim flow
                        </Button>
                      </div>
                    ))
                  ) : (
                    <div className="text-xl font-semibold text-black/50">
                      No active bookings
                    </div>
                  )}
                </div>
              </Card>
              <Card className="items-start">
                <div className="text-3xl font-black">Recent events</div>
                <div className="flex w-full flex-col gap-3">
                  {recentEvents?.map((event) => (
                    <div
                      key={event.id}
                      className="outline-brand grid w-full grid-cols-[1fr_auto] gap-4 rounded-3xl bg-white px-6 py-4 outline-2"
                    >
                      <div>
                        <div className="text-xl font-black">
                          {event.eventType}
                        </div>
                        <div className="text-lg font-semibold text-black/50">
                          {event.bookingNumber ?? "no-booking"} / cell{" "}
                          {event.cellId ?? "—"} / {event.route}
                        </div>
                      </div>
                      <div className="text-right text-lg font-semibold text-black/50">
                        <div>
                          {new Date(event.timestamp).toLocaleTimeString()}
                        </div>
                        <div>{event.correlationId.slice(0, 12)}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            </div>
            <div className="flex flex-col gap-8">
              <Card className="items-start">
                <div className="text-3xl font-black">Occupancy by size</div>
                <div className="flex w-full flex-col gap-3">
                  {occupancyBySize?.map((item) => (
                    <div
                      key={item.size}
                      className="outline-brand grid w-full grid-cols-[auto_1fr] gap-4 rounded-3xl bg-white px-6 py-4 outline-2"
                    >
                      <div className="text-2xl font-black">{item.size}</div>
                      <div className="flex justify-between text-lg font-semibold text-black/50">
                        <span>{item.occupied} occupied</span>
                        <span>{item.reserved} reserved</span>
                        <span>{item.available} free</span>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
              <Card className="items-start">
                <div className="text-2xl font-black">Metrics summary</div>
                <div className="text-lg font-semibold text-black/50">
                  Successful bookings: {metrics?.successfulBookings ?? "—"}
                </div>
                <div className="text-lg font-semibold text-black/50">
                  Payment cancellation rate:{" "}
                  {metrics?.paymentCancellationRate ?? "—"}%
                </div>
                <div className="text-lg font-semibold text-black/50">
                  No-free-cells count: {metrics?.noFreeCellsCount ?? "—"}
                </div>
                <div className="text-lg font-semibold text-black/50">
                  Average minutes to payment success:{" "}
                  {metrics?.averageMinutesToPaymentSuccess ?? "—"}
                </div>
              </Card>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    </div>
  );
}
