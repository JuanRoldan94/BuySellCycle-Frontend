import { api } from '../../../shared/api';
import type { CategoriaNivel1 } from '../types/categoria.type';

export const getJerarquiaCategorias = async (): Promise<CategoriaNivel1[]> => {
  const response = await api.get('/categorias/jerarquia');
  
  return response.data.map((cat: any) => ({
    ...cat,
    children: cat.categoriasNivel2?.length > 0 
      ? cat.categoriasNivel2.map((sub: any) => ({ ...sub, isNivel2: true })) 
      : undefined
  }));
};

// Crear Categoria Nivel 1
export const createCategoriaNivel1 = async (data: { nombre: string }) => {
  const response = await api.post('/categorias/nivel-1', data);
  return response.data;
};

// Actualizar Categoria Nivel 1
export const updateCategoriaNivel1 = async (id: number, data: { nombre: string }) => {
  const response = await api.patch(`/categorias/nivel-1/${id}`, data);
  return response.data;
};

// Crear Nivel 2
export const createCategoriaNivel2 = async (data: { nombre: string; categoriaNivel1Id: number }) => {
  const response = await api.post('/categorias/nivel-2', data);
  return response.data;
};

// Actualizar Nivel 2
export const updateCategoriaNivel2 = async (id: number, data: { nombre: string; categoriaNivel1Id: number }) => {
  const response = await api.patch(`/categorias/nivel-2/${id}`, data);
  return response.data;
};

// Eliminar Nivel 1 (Borrado lógico)
export const deleteCategoriaNivel1 = async (id: number) => {
  const response = await api.delete(`/categorias/nivel-1/${id}`);
  return response.data;
};

// Eliminar Nivel 2 (Borrado lógico)
export const deleteCategoriaNivel2 = async (id: number) => {
  const response = await api.delete(`/categorias/nivel-2/${id}`);
  return response.data;
};