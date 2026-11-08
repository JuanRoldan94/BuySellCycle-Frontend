import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getVentas, actualizarEstadoVenta } from '../services/ventas.service';

interface VentaHistorial {
    id: number;
    fechaCreacion: string;
    montoTotal: number;
    estado: string;
    modoPago: string;
    cliente: { nombre: string; apellido: string; dni: string };
    sucursal: { nombre: string };
    detalles: {
        id: number;
        productoId: number;
        cantidad: number;
        precioUnitario: number;
        subtotal: number;
        producto: { nombre: string };
    }[];
}

export const HistorialVentas = () => {
    const navigate = useNavigate();
    const [ventas, setVentas] = useState<VentaHistorial[]>([]);
    const [busqueda, setBusqueda] = useState('');
    const [cargando, setCargando] = useState(true);

    const [modalAbierto, setModalAbierto] = useState(false);
    const [ventaActiva, setVentaActiva] = useState<VentaHistorial | null>(null);
    const [nuevoEstado, setNuevoEstado] = useState('');
    const [actualizando, setActualizando] = useState(false);

    const [modalDetalleAbierto, setModalDetalleAbierto] = useState(false);
    const [ventaDetalle, setVentaDetalle] = useState<VentaHistorial | null>(null);

    const cargarVentas = async () => {
        try {
            const data = await getVentas();
            setVentas(data);
        } catch (error) {
            console.error('Error al cargar el historial:', error);
        } finally {
            setCargando(false);
        }
    };

    useEffect(() => {
        cargarVentas();
    }, []);

    const abrirModal = (venta: VentaHistorial) => {
        if (venta.estado === 'CANCELADO') {
            alert('Una venta cancelada no se puede modificar');
            return;
        }
        setVentaActiva(venta);
        setNuevoEstado(venta.estado);
        setModalAbierto(true);
    };

    const cerrarModal = () => {
        setModalAbierto(false);
        setVentaActiva(null);
    };

    const abrirModalDetalle = (venta: VentaHistorial) => {
        setVentaDetalle(venta);
        setModalDetalleAbierto(true);
    };

    const cerrarModalDetalle = () => {
        setModalDetalleAbierto(false);
        setVentaDetalle(null);
    };

    const handleGuardarEstado = async () => {
        if (!ventaActiva || nuevoEstado === ventaActiva.estado) {
            cerrarModal();
            return;
        }

        if (nuevoEstado === 'CANCELADO') {
            const confirmar = window.confirm('¿Cancelar venta? Esta accion no se puede deshacer');
            if (!confirmar) return;
        }

        setActualizando(true);

        try {
            await actualizarEstadoVenta(ventaActiva.id, nuevoEstado);
            await cargarVentas();
            cerrarModal();
        } catch (error: any) {
            console.error('Error al actualizar', error);
            alert(`Error: ${error.response?.data?.message || error.message}`);
        } finally {
            setActualizando(false);
        }
    };

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
                                        <th className="px-3">Id</th>
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
                                                <td className="fw-bold">${Number(v.montoTotal || 0).toFixed(2)}</td>
                                                <td>
                                                    <span className={`badge ${getBadgeEstado(v.estado)}`}>
                                                        {v.estado ? v.estado.replace(/_/g, ' ') : 'SIN ESTADO'}
                                                    </span>
                                                </td>
                                                <td className="text-center">
                                                    <button
                                                        className='btn btn-sm btn-outline-info me-2'
                                                        onClick={() => abrirModalDetalle(v)}
                                                        title='Ver Productos'
                                                    >
                                                        Ver
                                                    </button>
                                                    <button
                                                        className='btn btn-sm btn-outline-warning me-2'
                                                        onClick={() => abrirModal(v)}
                                                        title='Cambiar Estado'
                                                        disabled={v.estado === 'CANCELADO'}
                                                    >
                                                        ✏️
                                                    </button>
                                                    <a
                                                        href={`${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/pdf/venta/${v.id}`}
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

            {modalAbierto && ventaActiva && (
                <div className="modal d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
                    <div className="modal-dialog modal-dialog-centered">
                        <div className="modal-content shadow">
                            <div className="modal-header bg-light">
                                <h5 className="modal-title">
                                    Modificar Estado - Venta #{ventaActiva.id}
                                </h5>
                                <button type="button" className="btn-close" onClick={cerrarModal}></button>
                            </div>
                            <div className="modal-body">
                                <p className="text-muted small mb-3">
                                    Cliente: <strong>{ventaActiva.cliente.nombre} {ventaActiva.cliente.apellido}</strong><br />
                                    Total: <strong>${Number(ventaActiva.montoTotal || 0).toFixed(2)}</strong>
                                </p>

                                <label className="form-label fw-bold">Nuevo Estado:</label>
                                <select
                                    className="form-select"
                                    value={nuevoEstado}
                                    onChange={(e) => setNuevoEstado(e.target.value)}
                                >
                                    <option value="EN_PREPARACION">En Preparación</option>
                                    <option value="EN_CAMINO">En Camino</option>
                                    <option value="ENTREGADO">Entregado</option>
                                    <hr />
                                    <option value="CANCELADO" className="text-danger fw-bold">Cancelar Venta (Devuelve Stock)</option>
                                </select>
                            </div>
                            <div className="modal-footer bg-light">
                                <button className="btn btn-secondary" onClick={cerrarModal} disabled={actualizando}>
                                    Cerrar
                                </button>
                                <button className="btn btn-primary" onClick={handleGuardarEstado} disabled={actualizando}>
                                    {actualizando ? 'Guardando...' : 'Guardar Cambios'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {modalDetalleAbierto && ventaDetalle && (
                <div className="modal d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
                    <div className="modal-dialog modal-dialog-centered">
                        <div className="modal-content shadow">
                            <div className="modal-header bg-light">
                                <h5 className="modal-title">
                                    Productos Comprados - Venta #{ventaDetalle.id}
                                </h5>
                                <button type="button" className="btn-close" onClick={cerrarModalDetalle}></button>
                            </div>
                            <div className="modal-body">
                                <p className="text-muted small mb-3">
                                    Cliente: <strong>{ventaDetalle.cliente.nombre} {ventaDetalle.cliente.apellido}</strong>
                                </p>

                                <table className="table table-sm table-bordered align-middle mb-0">
                                    <thead className="table-light">
                                        <tr>
                                            <th>Producto</th>
                                            <th className="text-center">Cant.</th>
                                            <th className="text-end">Precio Unit.</th>
                                            <th className="text-end">Subtotal</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {ventaDetalle.detalles?.map((item, index) => (
                                            <tr key={item.id || index}>
                                                <td>{item.producto?.nombre || `Producto #${item.productoId}`}</td>
                                                <td className="text-center">{item.cantidad}</td>
                                                <td className="text-end">${Number(item.precioUnitario || 0).toFixed(2)}</td>
                                                <td className="text-end fw-bold">${Number(item.subtotal || 0).toFixed(2)}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>

                                <div className="text-end mt-3 fw-bold fs-5 text-success">
                                    Total: ${Number(ventaDetalle.montoTotal || 0).toFixed(2)}
                                </div>
                            </div>
                            <div className="modal-footer bg-light">
                                <button className="btn btn-secondary" onClick={cerrarModalDetalle}>
                                    Cerrar
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};