import { createClient } from "@/lib/supabase/server";
import { StatsCards } from "@/components/dashboard/stats-cards";
import { VisitChart } from "@/components/dashboard/visit-chart";
import { RecentVisitors } from "@/components/dashboard/recent-visitors";
import { computeVisitorStats } from "@/lib/stats";

export default async function DashboardPage() {
  const supabase = await createClient();

  const { data: visitors } = await supabase
    .from("visitors")
    .select("*")
    .order("waktu_kedatangan", { ascending: false });

  const allVisitors = visitors || [];
  const stats = computeVisitorStats(allVisitors);
  const recent = allVisitors.slice(0, 5);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-primary">Dashboard Overview</h1>
        <p className="text-muted-foreground">
          Ringkasan data pengunjung LPP RRI Kendari
        </p>
      </div>

      <StatsCards
        today={stats.today}
        week={stats.week}
        month={stats.month}
        total={stats.total}
      />

      <div className="grid gap-6 lg:grid-cols-2">
        <VisitChart data={stats.chartData} />
        <RecentVisitors visitors={recent} />
      </div>
    </div>
  );
}
