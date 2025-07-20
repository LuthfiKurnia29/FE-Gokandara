export interface ReferensiData {
  id: number;
  name: string;
  code: string;
}

// Laravel API response format
export interface ReferensiResponse {
  message?: string;
  data: ReferensiData[];
}

export interface ReferensiApiResponse {
  message: string;
  data: ReferensiData;
}

export interface CreateReferensiData {
  name: string;
  code: string;
}

export interface UseReferensiListParams {
  search?: string;
}
