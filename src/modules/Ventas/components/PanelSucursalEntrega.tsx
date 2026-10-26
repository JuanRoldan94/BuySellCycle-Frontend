import { useState, useEffect } from 'react';
import { useVentaStore } from '../store/useventaStore';

interface SucursalBackend {
    id: number;
    nombre: string;
}

export const PanelSucursalEntrega = () => {
    const [sucursales, setSucursales] = useState<SucursalBackend[]>([]);

    const sucursalId = useVentaStore((state) => state.sucursalId);
    const setSucursal = useVentaStore((state) => state.setSucursal);
    const modoEntrega = useVentaStore((state) => state.modoEntrega);
    const setModoEntrega = useVentaStore((state) => state.setModoEntrega);
    const direccionEntregaTexto = useVentaStore((state) => state.direccionEntregaTexto);
    const setDireccionEntregaTexto = useVentaStore((state) => state.setDireccionEntregaTexto);

    useEffect(() => {
        const fetchSucursales = async () => {
            try {
                const res = await fetch('http://localhost:3000/sucursales');
                if (res.ok) {
                    const data: SucursalBackend[] = await res.json();
                    setSucursales(data);

                    if (data.length > 0 && !sucursalId) {
                        setSucursal(data[0].id);
                    }
                }
            } catch (error) {
                console.error('Error al cargar sucursales:', error);
            }
        };
        fetchSucursales();
    }, [sucursalId, setSucursal]);

    return (
        <div className="mb-4">
            <label className="form-label fw-bold text-secondary">Sucursal de Origen</label>
            <select
                className="form-select mb-3"
                value={sucursalId || ''}
                onChange={(e) => setSucursal(Number(e.target.value))}
            >
                <option value="" disabled>Seleccione una sucursal...</option>
                {sucursales.map(suc => (
                    <option key={suc.id} value={suc.id}>
                        {suc.nombre}
                    </option>
                ))}
            </select>

            <label className="form-label fw-bold text-secondary">Método de Entrega</label>
            <div className="d-flex gap-3">
                <div className="form-check">
                    <input
                        className="form-check-input cursor-pointer"
                        type="radio"
                        name="entrega"
                        id="retiro"
                        checked={modoEntrega === 'RETIRO_SUCURSAL'}
                        onChange={() => setModoEntrega('RETIRO_SUCURSAL')}
                    />
                    <label className="form-check-label cursor-pointer" htmlFor="retiro">
                        🏢 Retiro en Sucursal
                    </label>
                </div>
                <div className="form-check">
                    <input
                        className="form-check-input cursor-pointer"
                        type="radio"
                        name="entrega"
                        id="envio"
                        checked={modoEntrega === 'ENTREGA_DOMICILIO'}
                        onChange={() => setModoEntrega('ENTREGA_DOMICILIO')}
                    />
                    <label className="form-check-label cursor-pointer" htmlFor="envio">
                        🚚 Envío a Domicilio
                    </label>
                </div>
            </div>
            {modoEntrega === 'ENTREGA_DOMICILIO' && (
                <div className="mt-3 p-2 bg-white border rounded shadow-sm">
                    <label className="form-label small fw-bold text-primary mb-1">
                        📍 Dirección exacta de entrega
                    </label>
                    <input
                        type="text"
                        className="form-control form-control-sm"
                        placeholder="Ej: Bv. Santa Fe 123, Rafaela"
                        value={direccionEntregaTexto}
                        onChange={(e) => setDireccionEntregaTexto(e.target.value)}
                    />
                </div>
            )}
        </div>
    );
};