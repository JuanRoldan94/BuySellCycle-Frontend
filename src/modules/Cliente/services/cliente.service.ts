import { api } from '../../../shared/api';
import type { Cliente, DireccionEntrega } from '../types/cliente.type';

export const getClientes = async (): Promise<Cliente[]> => {
  const response = await api.get('/clientes');
  return response.data;
};

export const createCliente = async (data: Omit<Cliente, 'id' | 'archivado'>) => {
  const response = await api.post('/clientes', data);
  return response.data;
};

export const updateCliente = async (id: number, data: Partial<Cliente>) => {
  const response = await api.patch(`/clientes/${id}`, data);
  return response.data;
};

export const deleteCliente = async (id: number) => {
  const response = await api.delete(`/clientes/${id}`);
  return response.data;
};

export const getProvincias = async () => {
  const response = await api.get('/provincias');
  return response.data;
};

export const getLocalidades = async () => {
  const response = await api.get('/localidades');
  return response.data;
};

// ==========================================
// DIRECCIONES DE ENTREGA
// ==========================================

export const getDireccionesCliente = async (clienteId: number): Promise<DireccionEntrega[]> => {
  const response = await api.get(`/clientes/${clienteId}/direcciones`);
  return response.data;
};

export const createDireccionCliente = async (
  clienteId: number, 
  data: { direccion: string; principal?: boolean }
): Promise<DireccionEntrega> => {
  const response = await api.post(`/clientes/${clienteId}/direcciones`, data);
  return response.data;
};

export const updateDireccionCliente = async (
  clienteId: number, 
  direccionId: number, 
  data: { direccion?: string; principal?: boolean }
): Promise<DireccionEntrega> => {
  const response = await api.patch(`/clientes/${clienteId}/direcciones/${direccionId}`, data);
  return response.data;
};

export const deleteDireccionCliente = async (
  clienteId: number, 
  direccionId: number
): Promise<any> => {
  const response = await api.delete(`/clientes/${clienteId}/direcciones/${direccionId}`);
  return response.data;
};
