import { api } from '../../../shared/api';

export const createPresupuesto = async (data: any) => {
  const response = await api.post('/presupuestos', data);
  return response.data;
};

export const createPDF = async (data: any) => {
  const response = await api.post('/pdf', data, {
    responseType: 'blob'
  });
  return response.data;
};