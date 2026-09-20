import { api } from '../../../shared/api';
import type { Producto } from '../types/producto.type';

export const getProductos = async (): Promise<Producto[]> => {
  const response = await api.get('/productos');
  return response.data;
};

export const deleteProducto = async (id: number) => {
  const response = await api.delete(`/productos/${id}`);
  return response.data;
};

export const createProducto = async (data: any) => {
  const response = await api.post('/productos', data);
  return response.data;
};

export const updateProducto = async (id: number, data: any) => {
  const response = await api.patch(`/productos/${id}`, data);
  return response.data;
};