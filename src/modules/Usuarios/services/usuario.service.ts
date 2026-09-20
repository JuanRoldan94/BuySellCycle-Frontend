import { api } from '../../../shared/api';
import type { Usuario } from '../types/usuario.type';

export const getUsuarios = async (): Promise<Usuario[]> => {
  const response = await api.get('/usuarios');
  return response.data;
};

export const createUsuario = async (data: any) => {
  const response = await api.post('/usuarios', data);
  return response.data;
};

export const updateUsuario = async (id: number, data: any) => {
  const response = await api.patch(`/usuarios/${id}`, data);
  return response.data;
};

export const deleteUsuario = async (id: number) => {
  const response = await api.delete(`/usuarios/${id}`);
  return response.data;
};