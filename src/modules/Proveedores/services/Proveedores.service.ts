import { api } from '../../../shared/api';
import type { Proveedor } from '../types/proveedores.type';

export const getProveedores = async (): Promise<Proveedor[]> => {
    const response = await api.get('/proveedores');
    return response.data;
};

export const createProveedor = async (data: any) => {
    const response = await api.post('/proveedores', data);
    return response.data;
};

export const updateProveedor = async (id: number, data: any) => {
    const response = await api.patch(`/proveedores/${id}`, data);
    return response.data;
};

export const deleteProveedor = async (id: number) => {
    const response = await api.delete(`/proveedores/${id}`);
    return response.data;
};