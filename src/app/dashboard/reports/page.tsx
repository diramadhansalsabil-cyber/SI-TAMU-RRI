"use client";

import { useEffect, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import { FileText, Download, FileSpreadsheet } from "lucide-react";
import { toast } from "sonner";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Visitor } from "@/types";
import { computeVisitorStats } from "@/lib/stats";
import { exportVisitorsToExcel } from "@/lib/export/excel";
import { exportVisitorsToPDF } from "@/lib/export/pdf";
import { format, startOfMonth, subMonths } from "date-fns";
import { id as localeId } from "date-fns/locale";

const COLORS = ["#1e40af", "#2563eb", "#3b82f6", "#60a5fa", "#93c5fd"];

export default function ReportsPage() {
  const [visitors, setVisitors] = useState<Visitor[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/visitors")
      .then((res) => res.json())
      .then((data) => setVisitors(data))
      .catch(() => toast.error("Gagal memuat laporan"))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <div className="grid gap-6 md:grid-cols-2">
          <Skeleton className="h-80" />
          <Skeleton className="h-80" />
        </div>
      </div>
    );
  }

  const stats = computeVisitorStats(visitors);

  const monthlyData = Array.from({ length: 6 }, (_, i) => {
    const date = subMonths(new Date(), 5 - i);
    const monthStart = startOfMonth(date);
    const monthEnd = new Date(monthStart);
    monthEnd.setMonth(monthEnd.getMonth() + 1);

    const count = visitors.filter((v) => {
      const d = new Date(v.waktu_kedatangan);
      return d >= monthStart && d < monthEnd;
    }).length;

    return {
      month: format(date, "MMM yyyy", { locale: localeId }),
      count,
    };
  });

  const purposeMap = new Map<string, number>();
  visitors.forEach((v) => {
    const key = v.tujuan_kunjungan.length > 30
      ? v.tujuan_kunjungan.slice(0, 30) + "..."
      : v.tujuan_kunjungan;
    purposeMap.set(key, (purposeMap.get(key) || 0) + 1);
  });

  const purposeData = Array.from(purposeMap.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([name, value]) => ({ name, value }));

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-primary">Laporan</h1>
          <p className="text-muted-foreground">
            Statistik dan analisis data kunjungan
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              exportVisitorsToExcel(visitors, "laporan-tamu");
              toast.success("Excel berhasil diunduh");
            }}
          >
            <FileSpreadsheet className="mr-2 h-4 w-4" />
            Export Excel
          </Button>
          <Button
            size="sm"
            onClick={() => {
              exportVisitorsToPDF(visitors, "laporan-tamu");
              toast.success("PDF berhasil diunduh");
            }}
          >
            <Download className="mr-2 h-4 w-4" />
            Export PDF
          </Button>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: "Hari Ini", value: stats.today },
          { label: "Minggu Ini", value: stats.week },
          { label: "Bulan Ini", value: stats.month },
          { label: "Total", value: stats.total },
        ].map((item) => (
          <Card key={item.label}>
            <CardHeader className="pb-2">
              <CardDescription>{item.label}</CardDescription>
              <CardTitle className="text-3xl text-primary">{item.value}</CardTitle>
            </CardHeader>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Kunjungan per Bulan
            </CardTitle>
            <CardDescription>6 bulan terakhir</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                  <YAxis allowDecimals={false} />
                  <Tooltip />
                  <Bar dataKey="count" fill="#1e40af" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Tujuan Kunjungan Teratas</CardTitle>
            <CardDescription>5 tujuan paling sering</CardDescription>
          </CardHeader>
          <CardContent>
            {purposeData.length > 0 ? (
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={purposeData}
                      cx="50%"
                      cy="50%"
                      outerRadius={100}
                      dataKey="value"
                      label={({ name, percent }) =>
                        `${name} (${(percent * 100).toFixed(0)}%)`
                      }
                      labelLine={false}
                    >
                      {purposeData.map((_, index) => (
                        <Cell key={index} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Legend />
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <p className="py-16 text-center text-muted-foreground">
                Belum ada data
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
