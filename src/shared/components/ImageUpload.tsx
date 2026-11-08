import React, { useState } from 'react';
import { Upload, message, Button, Space, Image, Typography } from 'antd';
import { UploadOutlined, DeleteOutlined, LoadingOutlined } from '@ant-design/icons';
import { subirImagen } from '../services/archivos.service';

const { Text } = Typography;

interface ImageUploadProps {
  value?: string | null;
  onChange?: (url: string | null) => void;
  carpeta: 'productos' | 'tarjetas';
  label?: string;
}

export const ImageUpload: React.FC<ImageUploadProps> = ({
  value,
  onChange,
  carpeta,
  label = 'Seleccionar Imagen',
}) => {
  const [subiendo, setSubiendo] = useState(false);

  const handleCustomRequest = async (options: any) => {
    const { file, onSuccess, onError } = options;

    if (!file.type?.startsWith('image/')) {
      message.error('El archivo debe ser una imagen válida (PNG, JPG, WEBP, etc.)');
      onError?.(new Error('Tipo no permitido'));
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      message.error('La imagen no debe superar los 5MB');
      onError?.(new Error('Tamaño excedido'));
      return;
    }

    setSubiendo(true);
    try {
      const url = await subirImagen(file as File, carpeta);
      message.success('Imagen subida exitosamente a Firebase Storage');
      onChange?.(url);
      onSuccess?.(url);
    } catch (error: any) {
      console.error('Error al subir imagen:', error);
      const msg = error.response?.data?.message || 'Error al conectar con Firebase Cloud Storage';
      message.error(`Error al subir imagen: ${msg}`);
      onError?.(error);
    } finally {
      setSubiendo(false);
    }
  };

  const handleEliminar = () => {
    onChange?.(null);
  };

  return (
    <div>
      {value ? (
        <Space direction="vertical" align="start" style={{ width: '100%' }}>
          <div
            style={{
              padding: 8,
              border: '1px solid #d9d9d9',
              borderRadius: 8,
              background: '#fafafa',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 12,
            }}
          >
            <Image
              src={value}
              alt="Vista previa"
              width={90}
              height={90}
              style={{ objectFit: 'contain', borderRadius: 4, background: '#fff' }}
              fallback="https://placehold.co/90x90?text=Sin+Imagen"
            />
            <div>
              <Text strong style={{ display: 'block', marginBottom: 4 }}>
                Imagen en Firebase Storage
              </Text>
              <Text
                type="secondary"
                style={{
                  fontSize: 11,
                  display: 'block',
                  maxWidth: 260,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                  marginBottom: 8,
                }}
              >
                {value}
              </Text>
              <Button
                type="text"
                danger
                size="small"
                icon={<DeleteOutlined />}
                onClick={handleEliminar}
              >
                Quitar imagen
              </Button>
            </div>
          </div>
        </Space>
      ) : (
        <Upload
          showUploadList={false}
          customRequest={handleCustomRequest}
          accept="image/*"
          disabled={subiendo}
        >
          <Button icon={subiendo ? <LoadingOutlined /> : <UploadOutlined />} loading={subiendo}>
            {subiendo ? 'Subiendo a Firebase...' : label}
          </Button>
        </Upload>
      )}
    </div>
  );
};

