import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

interface VentaHistorial {
    id: number;
    fechaCreacion: string;
    montoTotal: number;
    estado: string;
    modoPago: string;
    cliente: { nombre: string; apellido: string; dni: string };
    sucursal: { nombre: string };
}

export const HistorialVentas = () => {
    const navigate = useNavigate();
    const [ventas, setVentas] = useState<VentaHistorial[]>([]);
    const [busqueda, setBusqueda] = useState('');
    const [cargando, setCargando] = useState(true);

    useEffect(() => {
        const fetchVentas = async () => {
            try {
                const res = await fetch('http://localhost:3000/ventas');
                if (res.ok) {
                    const data = await res.json();
                    setVentas(data);
                }
            } catch (error) {
                console.error('Error al cargar el historial:', error);
            } finally {
                setCargando(false);
            }
        };
        fetchVentas();
    }, []);

    const ventasFiltradas = ventas.filter((v) => {
        const termino = busqueda.toLowerCase();
        const nombreCompleto = `${v.cliente.nombre} ${v.cliente.apellido}`.toLowerCase();
        return (
            v.id.toString().includes(termino) ||
            v.cliente.dni.includes(termino) ||
            nombreCompleto.includes(termino)
        );
    });

    const getBadgeEstado = (estado: string) => {
        switch (estado) {
            case 'ENTREGADO': return 'bg-success';
            case 'CANCELADO': return 'bg-danger';
            case 'EN_CAMINO': return 'bg-info text-dark';
            case 'EN_PREPARACION': return 'bg-warning text-dark';
            default: return 'bg-secondary';
        }
    };

    return (
        <div className="container mt-4">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h2>Historial de Ventas</h2>
                <button
                    className="btn btn-primary shadow-sm"
                    onClick={() => navigate('/ventas/nueva')}
                >
                    + Nueva Venta
                </button>
            </div>

            <div className="card shadow-sm">
                <div className="card-header bg-white py-3">
                    <input
                        type="text"
                        className="form-control"
                        placeholder="🔍 Buscar por Nro de Venta, DNI o Nombre de cliente..."
                        value={busqueda}
                        onChange={(e) => setBusqueda(e.target.value)}
                    />
                </div>

                <div className="card-body p-0">
                    {cargando ? (
                        <div className="text-center p-5 text-muted">Cargando ventas...</div>
                    ) : (
                        <div className="table-responsive">
                            <table className="table table-hover align-middle mb-0">
                                <thead className="table-light">
                                    <tr>
                                        <th className="px-3">#</th>
                                        <th>Fecha</th>
                                        <th>Cliente</th>
                                        <th>Sucursal</th>
                                        <th>Pago</th>
                                        <th>Total</th>
                                        <th>Estado</th>
                                        <th className="text-center">Acciones</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {ventasFiltradas.length === 0 ? (
                                        <tr>
                                            <td colSpan={8} className="text-center py-4 text-muted">
                                                No se encontraron ventas.
                                            </td>
                                        </tr>
                                    ) : (
                                        ventasFiltradas.map((v) => (
                                            <tr key={v.id}>
                                                <td className="px-3 fw-bold text-secondary">V-{v.id.toString().padStart(4, '0')}</td>
                                                <td>{new Date(v.fechaCreacion).toLocaleDateString('es-AR')}</td>
                                                <td>
                                                    <span className="d-block fw-semibold">{v.cliente.nombre} {v.cliente.apellido}</span>
                                                    <small className="text-muted">DNI: {v.cliente.dni}</small>
                                                </td>
                                                <td>{v.sucursal.nombre}</td>
                                                <td>
                                                    <span className={`badge ${v.modoPago === 'CONTADO' ? 'bg-success' : 'bg-primary'}`}>
                                                        {v.modoPago}
                                                    </span>
                                                </td>
                                                <td className="fw-bold">${v.montoTotal.toFixed(2)}</td>
                                                <td>
                                                    <span className={`badge ${getBadgeEstado(v.estado)}`}>
                                                        {v.estado.replace(/_/g, ' ')}
                                                    </span>
                                                </td>
                                                <td className="text-center">
                                                    <a
                                                        href={`http://localhost:3000/pdf/venta/${v.id}`}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="btn btn-sm btn-outline-danger"
                                                        title="Descargar Comprobante"
                                                    >
                                                        PDF
                                                    </a>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};