import { useState, useEffect } from 'react';
import { useVentaStore } from '../store/useventaStore';

interface ClienteBackend {
    id: number;
    nombre: string;
    apellido: string;
    dni: string;
}

export const SelectorCliente = () => {
    const [dniInput, setDniInput] = useState('');
    const [clienteEncontrado, setClienteEncontrado] = useState<ClienteBackend | null>(null);
    const [error, setError] = useState<string | null>(null);

    const setClienteIdStore = useVentaStore((state) => state.setCliente);
    const clienteIdActual = useVentaStore((state) => state.clienteId);

    useEffect(() => {
        if (clienteIdActual === null) {
            setClienteEncontrado(null);
            setDniInput('');
        }
    }, [clienteIdActual]);

    const handleBuscar = async () => {
        if (!dniInput.trim()) return;
        setError(null);

        try {
            const res = await fetch('http://localhost:3000/clientes');
            if (res.ok) {
                const clientes: ClienteBackend[] = await res.json();
                const coincidencia = clientes.find(c => c.dni === dniInput.trim());

                if (coincidencia) {
                    setClienteEncontrado(coincidencia);
                    setClienteIdStore(coincidencia.id);
                } else {
                    setError('No se encontró ningún cliente con ese DNI.');
                    setClienteIdStore(null);
                }
            }
        } catch (err) {
            console.error('Error al buscar cliente:', err);
            setError('Error de conexión con el servidor.');
        }
    };

    const handleLimpiar = () => {
        setClienteEncontrado(null);
        setDniInput('');
        setClienteIdStore(null);
        setError(null);
    };

    return (
        <div className="mb-4">
            <label className="form-label fw-bold text-secondary">Cliente</label>

            {!clienteEncontrado ? (
                <div>
                    <div className="input-group">
                        <input
                            type="text"
                            className="form-control"
                            placeholder="Ingrese el DNI..."
                            value={dniInput}
                            onChange={(e) => setDniInput(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleBuscar()}
                        />
                        <button className="btn btn-secondary" onClick={handleBuscar}>
                            Buscar
                        </button>
                    </div>
                    {error && <small className="text-danger mt-1 d-block">{error}</small>}
                </div>
            ) : (
                <div className="p-2 border rounded bg-light d-flex justify-content-between align-items-center">
                    <div>
                        <span className="d-block fw-bold text-dark">
                            {clienteEncontrado.nombre} {clienteEncontrado.apellido}
                        </span>
                        <small className="text-muted">DNI: {clienteEncontrado.dni}</small>
                    </div>
                    <button
                        className="btn btn-sm btn-outline-danger"
                        onClick={handleLimpiar}
                        title="Cambiar de cliente"
                    >
                        ✕
                    </button>
                </div>
            )}
        </div>
    );
};