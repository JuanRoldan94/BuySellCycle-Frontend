import { api } from '../../../shared/api';

export interface RegistrarVentaDto {
    clienteId: number;
    sucursalId: number;
    planId: number;
    modoPago: 'CONTADO' | 'PLAN';
    modoEntrega: 'RETIRO_SUCURSAL' | 'ENTREGA_DOMICILIO';
    direccionEntregaTexto?: string;
    detalles: {
        productoId: number;
        cantidad: number;
    }[];
}

export const getVentas = async () => (await api.get('/ventas')).data;

export const registrarVenta = async (datos: RegistrarVentaDto) => (await api.post('/ventas', datos)).data;

export const actualizarEstadoVenta = async (id: number, estado: string) => 
    (await api.patch(`/ventas/${id}/estado`, { estado })).data;

export const getProductosParaVenta = async () => (await api.get('/productos')).data;

export const getClientesParaVenta = async () => (await api.get('/clientes')).data;

export const getSucursalesParaVenta = async () => (await api.get('/sucursales')).data;

export const getPlanesParaVenta = async () => (await api.get('/planes')).data;

export const reenviarMailVenta = async (id: number) => (await api.post(`/mail/venta/${id}`)).data;


