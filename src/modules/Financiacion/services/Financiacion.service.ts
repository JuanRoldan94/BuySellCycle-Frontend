import { api } from '../../../shared/api';

// BANCOS
export const getBancos = async () => (await api.get('/bancos')).data;
export const createBanco = async (data: any) => (await api.post('/bancos', data)).data;
export const updateBanco = async ({ id, data }: { id: number; data: any }) => (await api.patch(`/bancos/${id}`, data)).data;
export const deleteBanco = async (id: number) => (await api.delete(`/bancos/${id}`)).data;

// TARJETAS
export const getTarjetas = async () => (await api.get('/tarjetas')).data;
export const createTarjeta = async (data: any) => (await api.post('/tarjetas', data)).data;
export const updateTarjeta = async ({ id, data }: { id: number; data: any }) => (await api.patch(`/tarjetas/${id}`, data)).data;
export const deleteTarjeta = async (id: number) => (await api.delete(`/tarjetas/${id}`)).data;

// PLANES
export const getPlanes = async () => (await api.get('/planes')).data;
export const createPlan = async (data: any) => (await api.post('/planes', data)).data;
export const updatePlan = async ({ id, data }: { id: number; data: any }) => (await api.patch(`/planes/${id}`, data)).data;
export const deletePlan = async (id: number) => (await api.delete(`/planes/${id}`)).data;