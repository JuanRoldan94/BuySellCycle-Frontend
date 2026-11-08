import { api } from './api';

let isLogging = false;

export const reportFrontendError = async (data: {
  ruta?: string;
  metodo?: string;
  codigoEstado?: number;
  detalle: string;
}) => {
  if (isLogging) return; 
  try {
    isLogging = true;
    await api.post('/errores', {
      tipoSistema: 'Frontend',
      ruta: data.ruta || (window.location.pathname + window.location.search),
      metodo: data.metodo || 'CLIENT',
      codigoEstado: data.codigoEstado || 500,
      detalle: data.detalle,
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    console.error('No se pudo registrar error de frontend en backend:', err);
  } finally {
    isLogging = false;
  }
};

export const initFrontendErrorLogging = () => {
  window.addEventListener('error', (event) => {
    if (!event.error && !event.message) return;
    if (event.message?.includes('ResizeObserver')) return;

    reportFrontendError({
      ruta: window.location.pathname,
      metodo: 'CLIENT_ERROR',
      codigoEstado: 500,
      detalle: `[Runtime Error] ${event.message || 'Error no especificado'} en ${event.filename || 'script'}:${event.lineno || 0}:${event.colno || 0} - Stack: ${event.error?.stack || 'N/A'}`
    });
  });

  window.addEventListener('unhandledrejection', (event) => {
    const reason = event.reason;
    const msg = typeof reason === 'object' && reason !== null
      ? reason.message || JSON.stringify(reason)
      : String(reason);

    if (msg.includes('/errores')) return;

    reportFrontendError({
      ruta: window.location.pathname,
      metodo: 'UNHANDLED_PROMISE',
      codigoEstado: 500,
      detalle: `[Unhandled Promise Rejection] ${msg}`
    });
  });
};

