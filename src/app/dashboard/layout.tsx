import { DashboardSidebar } from "@/components/layout/dashboard-sidebar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-muted/30">
      <DashboardSidebar />
      <main className="lg:pl-64">
        <div className="container mx-auto px-4 py-8 pt-16 lg:pt-8">{children}</div>
      </main>
    </div>
  );
}
