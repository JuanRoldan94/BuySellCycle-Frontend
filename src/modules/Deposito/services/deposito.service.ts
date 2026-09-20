import { api } from '../../../shared/api';

export const getDepositos = async () => {
    const response = await api.get('/depositos');
    return response.data
};