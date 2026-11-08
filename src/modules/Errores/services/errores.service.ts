import { api } from '../../../shared/api';

export interface ErrorLogItem {
  id: string;
  tipoSistema: 'Frontend' | 'Backend';
  timestamp: string;
  ruta: string;
  metodo: string;
  codigoEstado: number;
  detalle: string;
}

export const getErrores = async (tipoSistema?: string): Promise<ErrorLogItem[]> => {
  const params = tipoSistema && tipoSistema !== 'TODOS' ? { tipoSistema } : {};
  const response = await api.get('/errores', { params });
  return response.data;
};

