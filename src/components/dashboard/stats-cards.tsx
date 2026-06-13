import { Users, Calendar, CalendarDays, CalendarRange } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface StatsCardsProps {
  today: number;
  week: number;
  month: number;
  total: number;
}

const stats = [
  { key: "today" as const, label: "Hari Ini", icon: Calendar },
  { key: "week" as const, label: "Minggu Ini", icon: CalendarDays },
  { key: "month" as const, label: "Bulan Ini", icon: CalendarRange },
  { key: "total" as const, label: "Total Semua", icon: Users },
];

export function StatsCards({ today, week, month, total }: StatsCardsProps) {
  const values = { today, week, month, total };

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat) => {
        const Icon = stat.icon;
        return (
          <Card key={stat.key}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.label}
              </CardTitle>
              <Icon className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-primary">{values[stat.key]}</div>
              <p className="text-xs text-muted-foreground">pengunjung</p>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
