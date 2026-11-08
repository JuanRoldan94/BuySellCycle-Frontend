import React, { useEffect, useRef } from 'react';
import { Button, Result } from 'antd';
import { useLocation, useNavigate } from 'react-router-dom';
import { api } from '../api';

export const NotFoundView: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const reportedPathRef = useRef<string | null>(null);

  useEffect(() => {
    const fullPath = location.pathname + (location.search || '');

    if (reportedPathRef.current === fullPath) {
      return;
    }
    reportedPathRef.current = fullPath;

    const errorPayload = {
      tipoSistema: 'Frontend',
      ruta: fullPath,
      metodo: 'GET',
      codigoEstado: 404,
      detalle: `Intento de acceso a página inexistente en frontend: ${fullPath}`,
      timestamp: new Date().toISOString(),
    };

    api.post('/errores', errorPayload).catch((err) => {
      console.error('Error al registrar 404 de frontend en Firestore:', err);
    });
  }, [location.pathname, location.search]);

  return (
    <div style={{ padding: '40px 0', textAlign: 'center' }}>
      <Result
        status="404"
        title="404"
        subTitle="Lo sentimos, la página que estás buscando no existe."
        extra={
          <Button type="primary" onClick={() => navigate('/')}>
            Volver al Inicio
          </Button>
        }
      />
    </div>
  );
};

