import axios from '@/lib/axios';
import { CreateProspekData, ProspekApiResponse, ProspekData, ProspekResponse } from '@/types/prospek';

export const getAllProspek = async (): Promise<ProspekData[]> => {
  const response = await axios.get<ProspekResponse>('/prospek');
  return response.data.data;
};

export const createProspek = async (payload: CreateProspekData): Promise<ProspekData> => {
  const response = await axios.post<ProspekApiResponse>('/prospek', payload);
  return response.data.data;
};

export const updateProspek = async (id: number, payload: CreateProspekData): Promise<ProspekData> => {
  const response = await axios.put<ProspekApiResponse>(`/prospek/${id}`, payload);
  return response.data.data;
};

export const deleteProspek = async (id: number): Promise<void> => {
  await axios.delete(`/prospek/${id}`);
};
