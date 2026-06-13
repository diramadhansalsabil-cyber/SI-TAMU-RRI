import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { Visitor } from "@/types";
import { formatDate } from "@/lib/utils";

export function exportVisitorsToPDF(visitors: Visitor[], filename = "data-tamu") {
  const doc = new jsPDF({ orientation: "landscape" });

  doc.setFontSize(16);
  doc.text("Laporan Data Tamu - LPP RRI Kendari", 14, 15);
  doc.setFontSize(10);
  doc.text(`Dicetak: ${formatDate(new Date())}`, 14, 22);
  doc.text(`Total: ${visitors.length} pengunjung`, 14, 28);

  autoTable(doc, {
    startY: 35,
    head: [
      [
        "No",
        "Nama",
        "NIK",
        "Telepon",
        "Instansi",
        "Tujuan",
        "Dituju",
        "Waktu",
      ],
    ],
    body: visitors.map((v, i) => [
      i + 1,
      v.nama_lengkap,
      v.nik,
      v.nomor_telepon,
      v.instansi || "-",
      v.tujuan_kunjungan,
      v.orang_yang_dituju,
      formatDate(v.waktu_kedatangan),
    ]),
    styles: { fontSize: 8, cellPadding: 2 },
    headStyles: { fillColor: [30, 64, 175] },
    alternateRowStyles: { fillColor: [239, 246, 255] },
  });

  doc.save(`${filename}.pdf`);
}
