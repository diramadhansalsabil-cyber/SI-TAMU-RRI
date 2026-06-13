"use client";

import { useEffect, useState, useCallback } from "react";
import { Users } from "lucide-react";
import { VisitorsTable } from "@/components/visitors/visitors-table";
import { EmptyState } from "@/components/layout/empty-state";
import { Skeleton } from "@/components/ui/skeleton";
import { Visitor } from "@/types";
import { toast } from "sonner";

export default function VisitorsPage() {
  const [visitors, setVisitors] = useState<Visitor[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchVisitors = useCallback(async () => {
    try {
      const res = await fetch("/api/visitors");
      if (!res.ok) throw new Error("Gagal memuat data");
      const data = await res.json();
      setVisitors(data);
    } catch {
      toast.error("Gagal memuat data pengunjung");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchVisitors();
  }, [fetchVisitors]);

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-primary">Data Pengunjung</h1>
        <p className="text-muted-foreground">
          Kelola dan pantau data tamu yang terdaftar
        </p>
      </div>

      {visitors.length === 0 ? (
        <EmptyState
          icon={Users}
          title="Belum Ada Data"
          description="Data pengunjung akan muncul setelah tamu melakukan registrasi melalui QR Code."
        />
      ) : (
        <VisitorsTable visitors={visitors} onRefresh={fetchVisitors} />
      )}
    </div>
  );
}
