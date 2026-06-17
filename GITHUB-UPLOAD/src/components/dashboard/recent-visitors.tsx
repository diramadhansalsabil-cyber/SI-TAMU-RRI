import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Visitor } from "@/types";
import { formatDate } from "@/lib/utils";

interface RecentVisitorsProps {
  visitors: Visitor[];
}

export function RecentVisitors({ visitors }: RecentVisitorsProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Pengunjung Terbaru</CardTitle>
          <CardDescription>5 kunjungan terakhir</CardDescription>
        </div>
        <Button variant="ghost" size="sm" asChild>
          <Link href="/dashboard/visitors">
            Lihat Semua
            <ArrowRight className="ml-1 h-4 w-4" />
          </Link>
        </Button>
      </CardHeader>
      <CardContent>
        {visitors.length === 0 ? (
          <p className="py-8 text-center text-sm text-muted-foreground">
            Belum ada data pengunjung
          </p>
        ) : (
          <div className="space-y-4">
            {visitors.map((visitor) => (
              <div
                key={visitor.id}
                className="flex items-center justify-between rounded-lg border p-3"
              >
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium">{visitor.nama_lengkap}</p>
                  <p className="truncate text-sm text-muted-foreground">
                    {visitor.tujuan_kunjungan}
                  </p>
                </div>
                <div className="ml-4 text-right">
                  <Badge variant="secondary" className="text-xs">
                    {formatDate(visitor.waktu_kedatangan)}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
