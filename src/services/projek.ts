import axios from '@/lib/axios';
import { CreateProjekData, ProjekApiResponse, ProjekData, ProjekResponse } from '@/types/projek';

export const getAllProjek = async (): Promise<ProjekData[]> => {
  const response = await axios.get<ProjekResponse>('/projek');
  return response.data.data;
};

export const createProjek = async (payload: CreateProjekData): Promise<ProjekData> => {
  const response = await axios.post<ProjekApiResponse>('/projek', payload);
  return response.data.data;
};

export const updateProjek = async (id: number, payload: CreateProjekData): Promise<ProjekData> => {
  const response = await axios.put<ProjekApiResponse>(`/projek/${id}`, payload);
  return response.data.data;
};

export const deleteProjek = async (id: number): Promise<void> => {
  await axios.delete(`/projek/${id}`);
};
