export interface ProspekData {
  id: number;
  name: string;
  color: string;
}

export interface ProspekResponse {
  message?: string;
  data: ProspekData[];
}

export interface ProspekApiResponse {
  message: string;
  data: ProspekData;
}

export interface CreateProspekData {
  name: string;
  color: string;
}

export interface UseProspekListParams {
  search?: string;
}
