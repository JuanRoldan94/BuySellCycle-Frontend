import { api } from '../../../shared/api'; 

export const getDepositos = async () => {
  const response = await api.get('/depositos');
  return response.data;
};

export const createDeposito = async (data: any) => {
  const response = await api.post('/depositos', data);
  return response.data;
};

export const updateDeposito = async (id: number, data: any) => {

  const response = await api.patch(`/depositos/${id}`, data);
  return response.data;
};

export const deleteDeposito = async (id: number) => {
  const response = await api.delete(`/depositos/${id}`);
  return response.data;
};

export const getProvincias = async () => {
  const response = await api.get('/provincias');
  return response.data;
}

export const getLocalidades = async () => {
  const response = await api.get('/localidades');
  return response.data;
}