import { api } from '../../../shared/api';

export const getDashboardStats = async () => (await api.get('/dashboard/stats')).data;

