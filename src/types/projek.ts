export interface ProjekData {
  id: number;
  name: string;
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
}

export interface UseProjekListParams {
  search?: string;
}
