export interface ProjekData {
  id: number;
  name: string;
  address: string;
}

// Laravel API response format
export interface ProjekResponse {
  message?: string;
  data: ProjekData[];
}

export interface ProjekApiResponse {
  message: string;
  data: ProjekData;
}

export interface CreateProjekData {
  name: string;
  alamat?: string;
  jumlah_kavling?: number;
  tipe?: Array<{
    name: string;
    luas_tanah: number;
    luas_bangunan: number;
    jumlah_unit: number;
    harga: number;
    jenis_pembayaran_ids: number[];
  }>;
  fasilitas?: Array<{
    name: string;
    luas: number;
  }>;
  gambars?: File[];
}

export interface UseProjekListParams {
  search?: string;
}
