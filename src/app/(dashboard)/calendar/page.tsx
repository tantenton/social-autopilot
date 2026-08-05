import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

const events = [
  { date: "05 Aug", title: "Year-End Promo", platform: "X", time: "14:00" },
  { date: "06 Aug", title: "Threads Tips", platform: "Threads", time: "09:00" },
  { date: "07 Aug", title: "Customer Review", platform: "Instagram", time: "18:00" },
  { date: "08 Aug", title: "Year-End Promo", platform: "X", time: "14:00" },
  { date: "10 Aug", title: "Product Launch", platform: "Instagram", time: "11:00" },
];

export default function CalendarPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">Calendar</h1>
        <p className="mt-2 text-[rgb(var(--color-text-muted))]">Upcoming post schedule.</p>
      </div>

      <div className="grid gap-3">
        {events.map((e, i) => (
          <Card key={i} className="rounded-xl shadow-sm border-[rgb(var(--color-border))]">
            <CardContent className="p-4 flex items-center gap-4">
              <div className="w-14 shrink-0 text-center rounded-lg bg-[rgb(var(--color-bg))] border border-[rgb(var(--color-border))] py-2">
                <div className="text-[10px] uppercase tracking-wider text-[rgb(var(--color-text-muted))]">Aug</div>
                <div className="text-lg font-extrabold leading-none mt-0.5">{e.date.split(" ")[1]}</div>
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="font-semibold truncate">{e.title}</h3>
                <p className="text-sm text-[rgb(var(--color-text-muted))]">{e.time} · {e.platform}</p>
              </div>
              <Badge variant="outline" className="shrink-0 text-xs font-medium">{e.platform}</Badge>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
