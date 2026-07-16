export interface Visitor {
  id: string;
  nama_lengkap: string;
  nik: string;
  nomor_telepon: string;
  email: string | null;
  pekerjaan: string | null;
  instansi: string | null;
  alamat: string;
  tujuan_kunjungan: string;
  orang_yang_dituju: string;
  foto_url: string | null;
  waktu_kedatangan: string;
  created_at: string;
  updated_at: string;
}

export interface Admin {
  id: string;
  nama: string;
  email: string;
  role: string;
  created_at: string;
}

export interface VisitorStats {
  today: number;
  week: number;
  month: number;
  chartData: { date: string; count: number }[];
}
