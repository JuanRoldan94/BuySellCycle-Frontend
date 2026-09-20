import { api } from '../../../shared/api';
import type { Sucursal } from '../types/sucursal.type';

export const getSucursales = async (): Promise<Sucursal[]> => {
  const response = await api.get('/sucursales');
  return response.data;
};

export const createSucursal = async (data: any) => {
  const response = await api.post('/sucursales', data);
  return response.data;
};

export const updateSucursal = async (id: number, data: any) => {
  const response = await api.patch(`/sucursales/${id}`, data);
  return response.data;
};

export const deleteSucursal = async (id: number) => {
  const response = await api.delete(`/sucursales/${id}`);
  return response.data;
};
