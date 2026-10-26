import { create } from 'zustand';

interface DetalleCarrito {
    productoId: number;
    nombre: string;
    precio: number;
    cantidad: number;
}

interface VentaState {
    clienteId: number | null;
    sucursalId: number | null;
    planId: number | null;
    modoPago: 'CONTADO' | 'PLAN';
    modoEntrega: 'RETIRO_SUCURSAL' | 'ENTREGA_DOMICILIO';
    detalles: DetalleCarrito[];
    tasaFinanciacion: number;
    direccionEntregaTexto: string,

    // Acciones
    setCliente: (id: number) => void;
    setSucursal: (id: number) => void;
    setMetodoPago: (modo: 'CONTADO' | 'PLAN', planId?: number | null, tasa?: number) => void;
    setModoEntrega: (modo: 'RETIRO_SUCURSAL' | 'ENTREGA_DOMICILIO') => void;
    setDireccionEntregaTexto: (direccion: string) => void;
    agregarProducto: (producto: DetalleCarrito) => void;
    removerProducto: (productoId: number) => void;
    vaciarCarrito: () => void;
}

export const useVentaStore = create<VentaState>((set) => ({
    clienteId: null,
    sucursalId: null,
    planId: null, 
    modoPago: 'CONTADO',
    modoEntrega: 'RETIRO_SUCURSAL',
    direccionEntregaTexto: '',
    tasaFinanciacion: 0,
    detalles: [],

    setCliente: (id) => set({ clienteId: id }),
    setSucursal: (id) => set({ sucursalId: id }),
    setMetodoPago: (modo, planId = null, tasa = 0) => set({ modoPago: modo, planId: planId, tasaFinanciacion: tasa }),
    setModoEntrega: (modo) => set({ 
        modoEntrega: modo, 
        direccionEntregaTexto: modo === 'RETIRO_SUCURSAL' ? '' : useVentaStore.getState().direccionEntregaTexto 
    }),
    setDireccionEntregaTexto: (dir) => set({ direccionEntregaTexto: dir}),
    agregarProducto: (nuevoProducto) => set((state) => {
        const existe = state.detalles.find(p => p.productoId === nuevoProducto.productoId);
        if (existe) {
            return {
                detalles: state.detalles.map(p =>
                    p.productoId === nuevoProducto.productoId
                        ? { ...p, cantidad: p.cantidad + nuevoProducto.cantidad }
                        : p
                )
            };
        }
        return { detalles: [...state.detalles, nuevoProducto] };
    }),

    removerProducto: (id) => set((state) => ({
        detalles: state.detalles.filter(p => p.productoId !== id)
    })),

    vaciarCarrito: () => set({ detalles: [], clienteId: null, planId: null, direccionEntregaTexto: '' })
}));