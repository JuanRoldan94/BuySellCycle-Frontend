import { api } from '../../../shared/api';
import type { Marca } from '../types/marca.type';

export const getMarcas = async (): Promise<Marca[]> => {
    const response = await api.get('/marcas');
    return response.data;
};

export const createMarca = async (data: { nombre: string }) => {
    const response = await api.post( '/marcas', data );
    return response.data;
};

export const deleteMarca = async (id: number) => {
    const response = await api.delete(`/marcas/id${id}`);
    return response.data;
}

export const updateMarca = async (id: number, data: { nombre: string}) => {
    const response = await api.patch(`/marcas/id${id}`, data);
    return response.data;
}