import { api } from '../api';

export const subirImagen = async (file: File, carpeta: 'productos' | 'tarjetas'): Promise<string> => {
  const formData = new FormData();
  formData.append('imagen', file);

  const response = await api.post(`/archivos/subir/${carpeta}`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });

  return response.data.url;
};

