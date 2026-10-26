import { useState, useEffect } from 'react';
import { useVentaStore } from '../store/useventaStore';

interface PlanBackend {
    id: number;
    tasaFinanciacion: number;
    cantidadCuotas: number;
    tarjeta: { id: number; nombre: string };
    banco: { id: number; nombre: string };
}

export const PanelFinanciacion = () => {
    const [planes, setPlanes] = useState<PlanBackend[]>([]);

    const [tarjetaIdLoc, setTarjetaIdLoc] = useState<number | ''>('');
    const [bancoIdLoc, setBancoIdLoc] = useState<number | ''>('');

    const modoPago = useVentaStore((state) => state.modoPago);
    const planId = useVentaStore((state) => state.planId);
    const setMetodoPago = useVentaStore((state) => state.setMetodoPago);

    useEffect(() => {
        const fetchPlanes = async () => {
            try {
                const res = await fetch('http://localhost:3000/planes');
                if (res.ok) {
                    const data: PlanBackend[] = await res.json();
                    setPlanes(data);
                }
            } catch (error) {
                console.error('Error al cargar planes:', error);
            }
        };
        fetchPlanes();
    }, []);

    const tarjetasUnicas = Array.from(new Map(planes.map(p => [p.tarjeta.id, p.tarjeta])).values());
    const bancosDisponibles = Array.from(new Map(planes.filter(p => p.tarjeta.id === tarjetaIdLoc).map(p => [p.banco.id, p.banco])).values());
    const cuotasDisponibles = planes.filter(p => p.tarjeta.id === tarjetaIdLoc && p.banco.id === bancoIdLoc);

    const handleCambioModo = (modo: 'CONTADO' | 'PLAN') => {
        setMetodoPago(modo, null);
        if (modo === 'CONTADO') {
            setTarjetaIdLoc('');
            setBancoIdLoc('');
        }
    };

    return (
        <div className="mb-4">
            <label className="form-label fw-bold text-secondary">Método de Pago</label>
            <div className="d-flex gap-3 mb-3">
                <div className="form-check">
                    <input
                        className="form-check-input cursor-pointer"
                        type="radio"
                        name="pago"
                        id="contado"
                        checked={modoPago === 'CONTADO'}
                        onChange={() => handleCambioModo('CONTADO')}
                    />
                    <label className="form-check-label cursor-pointer" htmlFor="contado">
                        💵 Contado / Débito
                    </label>
                </div>
                <div className="form-check">
                    <input
                        className="form-check-input cursor-pointer"
                        type="radio"
                        name="pago"
                        id="plan"
                        checked={modoPago === 'PLAN'}
                        onChange={() => handleCambioModo('PLAN')}
                    />
                    <label className="form-check-label cursor-pointer" htmlFor="plan">
                        💳 Tarjeta de Crédito (Plan)
                    </label>
                </div>
            </div>


            {modoPago === 'PLAN' && (
                <div className="p-3 bg-light border rounded">
                    <div className="mb-2">
                        <label className="form-label small">Tarjeta</label>
                        <select
                            className="form-select form-select-sm"
                            value={tarjetaIdLoc}
                            onChange={(e) => {
                                setTarjetaIdLoc(Number(e.target.value));
                                setBancoIdLoc('');
                                setMetodoPago('PLAN', null);
                            }}
                        >
                            <option value="" disabled>1. Seleccione Tarjeta...</option>
                            {tarjetasUnicas.map(t => <option key={t.id} value={t.id}>{t.nombre}</option>)}
                        </select>
                    </div>

                    <div className="mb-2">
                        <label className="form-label small">Banco</label>
                        <select
                            className="form-select form-select-sm"
                            value={bancoIdLoc}
                            onChange={(e) => {
                                setBancoIdLoc(Number(e.target.value));
                                setMetodoPago('PLAN', null);
                            }}
                            disabled={!tarjetaIdLoc}
                        >
                            <option value="" disabled>2. Seleccione Banco...</option>
                            {bancosDisponibles.map(b => <option key={b.id} value={b.id}>{b.nombre}</option>)}
                        </select>
                    </div>

                    <div>
                        <label className="form-label small">Cuotas y Recargo</label>
                        <select
                            className="form-select form-select-sm border-primary"
                            value={planId || ''}
                            onChange={(e) => {
                                const idSeleccionado = Number(e.target.value);
                                const planElegido = cuotasDisponibles.find(p => p.id === idSeleccionado);
                                const tasa = planElegido ? Number(planElegido.tasaFinanciacion) : 0;

                                setMetodoPago('PLAN', idSeleccionado, tasa);
                            }}
                            disabled={!bancoIdLoc}
                        >
                            <option value="" disabled>3. Seleccione Plan...</option>
                            {cuotasDisponibles.map(p => (
                                <option key={p.id} value={p.id}>
                                    {p.cantidadCuotas} cuotas (Interés: {p.tasaFinanciacion}%)
                                </option>
                            ))}
                        </select>
                    </div>
                </div>
            )}
        </div>
    );
};