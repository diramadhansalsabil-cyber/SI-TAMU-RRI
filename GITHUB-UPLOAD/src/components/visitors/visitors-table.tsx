"use client";

import { useState, useMemo } from "react";
import {
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  flexRender,
  type ColumnDef,
  type SortingState,
} from "@tanstack/react-table";
import {
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  Download,
  FileSpreadsheet,
  Pencil,
  Search,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Visitor } from "@/types";
import { formatDate } from "@/lib/utils";
import { exportVisitorsToExcel } from "@/lib/export/excel";
import { exportVisitorsToPDF } from "@/lib/export/pdf";
import { VisitorEditDialog } from "./visitor-edit-dialog";
import { VisitorDeleteDialog } from "./visitor-delete-dialog";

interface VisitorsTableProps {
  visitors: Visitor[];
  onRefresh: () => void;
}

export function VisitorsTable({ visitors, onRefresh }: VisitorsTableProps) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [globalFilter, setGlobalFilter] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [editVisitor, setEditVisitor] = useState<Visitor | null>(null);
  const [deleteVisitor, setDeleteVisitor] = useState<Visitor | null>(null);

  const filteredData = useMemo(() => {
    let data = visitors;
    if (dateFrom) {
      data = data.filter((v) => new Date(v.waktu_kedatangan) >= new Date(dateFrom));
    }
    if (dateTo) {
      const endDate = new Date(dateTo);
      endDate.setHours(23, 59, 59, 999);
      data = data.filter((v) => new Date(v.waktu_kedatangan) <= endDate);
    }
    return data;
  }, [visitors, dateFrom, dateTo]);

  const columns: ColumnDef<Visitor>[] = useMemo(
    () => [
      {
        accessorKey: "nama_lengkap",
        header: ({ column }) => (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Nama
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        ),
      },
      {
        accessorKey: "foto_url",
        header: "Foto",
        cell: ({ row }) => {
          const url = row.original.foto_url;
          if (!url) {
            return <span className="text-muted-foreground">-</span>;
          }
          return (
            <a href={url} target="_blank" rel="noopener noreferrer">
              <img
                src={url}
                alt={row.original.nama_lengkap}
                className="h-12 w-12 rounded-md object-cover ring-1 ring-border"
              />
            </a>
          );
        },
      },
      { accessorKey: "nomor_telepon", header: "Telepon" },
      { accessorKey: "instansi", header: "Instansi", cell: ({ row }) => row.original.instansi || "-" },
      { accessorKey: "tujuan_kunjungan", header: "Tujuan" },
      { accessorKey: "orang_yang_dituju", header: "Programe" },
      {
        accessorKey: "waktu_kedatangan",
        header: ({ column }) => (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Waktu
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        ),
        cell: ({ row }) => formatDate(row.original.waktu_kedatangan),
      },
      {
        id: "actions",
        header: "Aksi",
        cell: ({ row }) => (
          <div className="flex gap-1">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setEditVisitor(row.original)}
            >
              <Pencil className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setDeleteVisitor(row.original)}
            >
              <Trash2 className="h-4 w-4 text-destructive" />
            </Button>
          </div>
        ),
      },
    ],
    []
  );

  const table = useReactTable({
    data: filteredData,
    columns,
    state: { sorting, globalFilter },
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: { pagination: { pageSize: 10 } },
  });

  const handleExportExcel = () => {
    const data = table.getFilteredRowModel().rows.map((r) => r.original);
    if (data.length === 0) {
      toast.error("Tidak ada data untuk diekspor");
      return;
    }
    exportVisitorsToExcel(data);
    toast.success("Excel berhasil diunduh");
  };

  const handleExportPDF = () => {
    const data = table.getFilteredRowModel().rows.map((r) => r.original);
    if (data.length === 0) {
      toast.error("Tidak ada data untuk diekspor");
      return;
    }
    exportVisitorsToPDF(data);
    toast.success("PDF berhasil diunduh");
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div className="flex flex-1 flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Cari nama, telepon..."
              value={globalFilter}
              onChange={(e) => setGlobalFilter(e.target.value)}
              className="pl-9"
            />
          </div>
          <Input
            type="date"
            value={dateFrom}
            onChange={(e) => setDateFrom(e.target.value)}
            className="w-full sm:w-auto"
            placeholder="Dari"
          />
          <Input
            type="date"
            value={dateTo}
            onChange={(e) => setDateTo(e.target.value)}
            className="w-full sm:w-auto"
            placeholder="Sampai"
          />
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={handleExportExcel}>
            <FileSpreadsheet className="mr-2 h-4 w-4" />
            Excel
          </Button>
          <Button variant="outline" size="sm" onClick={handleExportPDF}>
            <Download className="mr-2 h-4 w-4" />
            PDF
          </Button>
        </div>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(header.column.columnDef.header, header.getContext())}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  Tidak ada data pengunjung
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Halaman {table.getState().pagination.pageIndex + 1} dari{" "}
          {table.getPageCount() || 1} ({table.getFilteredRowModel().rows.length} data)
        </p>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {editVisitor && (
        <VisitorEditDialog
          visitor={editVisitor}
          open={!!editVisitor}
          onOpenChange={(open) => !open && setEditVisitor(null)}
          onSuccess={() => {
            setEditVisitor(null);
            onRefresh();
          }}
        />
      )}

      {deleteVisitor && (
        <VisitorDeleteDialog
          visitor={deleteVisitor}
          open={!!deleteVisitor}
          onOpenChange={(open) => !open && setDeleteVisitor(null)}
          onSuccess={() => {
            setDeleteVisitor(null);
            onRefresh();
          }}
        />
      )}
    </div>
  );
}
