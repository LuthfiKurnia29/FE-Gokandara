export type JenisPembayaran = {
  id: number;
  harga: string;
};

export type TipeData = {
  id: number;
  name: string;
  luas_tanah?: number;
  luas_bangunan?: number;
  jumlah_unit?: number;
  harga?: string | null;
  jenis_pembayaran?: JenisPembayaran[];
  created_at?: string;
  updated_at?: string;
};

export type CreateTipeData = {
  name: string;
};
