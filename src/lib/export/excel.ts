import * as XLSX from "xlsx";
import { Visitor } from "@/types";
import { formatDate } from "@/lib/utils";

export function exportVisitorsToExcel(visitors: Visitor[], filename = "data-tamu") {
  const data = visitors.map((v, index) => ({
    No: index + 1,
    "Nama Lengkap": v.nama_lengkap,
    "Nomor Telepon": v.nomor_telepon,
    Instansi: v.instansi || "-",
    Alamat: v.alamat,
    "Tujuan Kunjungan": v.tujuan_kunjungan,
    Programe: v.orang_yang_dituju,
    Foto: v.foto_url || "-",
    "Waktu Kedatangan": formatDate(v.waktu_kedatangan),
  }));

  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Data Tamu");

  const colWidths = [
    { wch: 5 },
    { wch: 25 },
    { wch: 15 },
    { wch: 20 },
    { wch: 30 },
    { wch: 25 },
    { wch: 20 },
    { wch: 40 },
    { wch: 22 },
  ];
  worksheet["!cols"] = colWidths;

  XLSX.writeFile(workbook, `${filename}.xlsx`);
}
