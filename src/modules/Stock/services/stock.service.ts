import { api } from '../../../shared/api';

export const registrarIngreso = async (data: any) => {
  const response = await api.post('/stock/ingreso', data);
  return response.data;
};

export const registrarEgreso = async (data: any) => {
  const response = await api.post('/stock/egreso', data);
  return response.data;
};

export const registrarTransferencia = async (data: any) => {
  const response = await api.post('/stock/transferencia', data);
  return response.data;
};