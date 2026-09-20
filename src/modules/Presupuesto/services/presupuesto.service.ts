import { api } from '../../../shared/api';

export const createPresupuesto = async (data: any) => {
  const response = await api.post('/presupuestos', data);
  return response.data;
};