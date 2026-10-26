import { useVentaStore } from '../store/useventaStore';
import { useNavigate } from 'react-router-dom';
import { BuscadorProductos } from '../components/BuscadorProductos';
import { SelectorCliente } from '../components/SelectorCliente';
import { PanelSucursalEntrega } from '../components/PanelSucursalEntrega';
import { PanelFinanciacion } from '../components/PanelFinanciacion';

export const NuevaVenta = () => {
    const navigate = useNavigate();

    const {
        detalles, clienteId, sucursalId, modoPago, planId, modoEntrega, tasaFinanciacion, direccionEntregaTexto,
        removerProducto, vaciarCarrito,
    } = useVentaStore();

    const subtotal = detalles.reduce((acc, item) => acc + (item.precio * item.cantidad), 0);
    const recargoCalculado = modoPago === 'PLAN' ? subtotal * (tasaFinanciacion / 100) : 0;
    const totalCalculado = subtotal + recargoCalculado;

    const handleConfirmarVenta = async () => {
        if (!clienteId || !sucursalId || detalles.length === 0) {
            alert('Faltan datos para procesar la venta');
            return;
        }

        if (modoEntrega === 'ENTREGA_DOMICILIO' && !direccionEntregaTexto.trim()) {
            alert('Debe ingresar la direccion de domicilio para "Entrega a domicilio".');
            return;
        }

        const payload = {
            clienteId,
            sucursalId,
            planId: modoPago === 'CONTADO' ? 6 : planId,
            modoPago,
            modoEntrega,
            direccionEntregatexto: modoEntrega === 'ENTREGA_DOMICILIO' ? direccionEntregaTexto : null,
            detalles: detalles.map(d => ({
                productoId: d.productoId,
                cantidad: d.cantidad
            }))
        };

        try {
            const response = await fetch('http://localhost:3000/ventas', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (response.ok) {
                const data = await response.json();
                alert(`¡Venta #${data.id} registrada con éxito!`);
                vaciarCarrito();
                // Acá podríamos disparar la descarga del PDF:
                // window.open(`http://localhost:3000/pdf/venta/${data.id}`, '_blank');
                navigate('/ventas/historial');

            } else {
                const error = await response.json();
                alert(`Error: ${error.message}`);
            }
        } catch (error) {
            console.error('Error al registrar venta:', error);
        }
    };

    return (
        <div className="container mt-4">
            <h2 className="mb-4">Registrar Nueva Venta</h2>
            <div className="row">

                <div className="col-md-8">
                    <div className="card shadow-sm mb-4">
                        <div className="card-header bg-primary text-white">
                            <h5 className="mb-0">Productos en el Carrito</h5>
                        </div>
                        <div className="card-body">
                            <BuscadorProductos />
                            <table className="table table-hover mt-3">
                                <thead>
                                    <tr>
                                        <th>Producto</th>
                                        <th>Precio</th>
                                        <th>Cantidad</th>
                                        <th>Subtotal</th>
                                        <th></th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {detalles.map(item => (
                                        <tr key={item.productoId}>
                                            <td>{item.nombre}</td>
                                            <td>${item.precio}</td>
                                            <td>{item.cantidad}</td>
                                            <td>${item.precio * item.cantidad}</td>
                                            <td>
                                                <button
                                                    className="btn btn-sm btn-danger"
                                                    onClick={() => removerProducto(item.productoId)}
                                                >
                                                    Quitar
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            {detalles.length === 0 && <p className="text-muted text-center">El carrito está vacío</p>}
                        </div>
                    </div>
                </div>

                <div className="col-md-4">
                    <div className="card shadow-sm">
                        <div className="card-header bg-success text-white">
                            <h5 className="mb-0">Resumen y Facturación</h5>
                        </div>
                        <div className="card-body">

                            <SelectorCliente />
                            <hr className="text-muted" />
                            <PanelSucursalEntrega />
                            <hr className="text-muted" />
                            <PanelFinanciacion />

                            <div className="bg-light p-3 rounded mb-3 border">
                                <div className="d-flex justify-content-between text-muted mb-1">
                                    <span>Subtotal:</span>
                                    <span>${subtotal.toFixed(2)}</span>
                                </div>

                                {modoPago === 'PLAN' && tasaFinanciacion > 0 && (
                                    <div className="d-flex justify-content-between text-danger mb-1">
                                        <span>Recargo ({tasaFinanciacion}%):</span>
                                        <span>+ ${recargoCalculado.toFixed(2)}</span>
                                    </div>
                                )}

                                <hr className="my-2" />

                                <div className="d-flex justify-content-between fs-4 fw-bold text-success">
                                    <span>Total:</span>
                                    <span>${totalCalculado.toFixed(2)}</span>
                                </div>
                            </div>

                            <button
                                className="btn btn-success w-100 btn-lg shadow-sm"
                                onClick={handleConfirmarVenta}
                                disabled={detalles.length === 0}
                            >
                                <i className="bi bi-check-circle me-2"></i> Confirmar Venta
                            </button>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
};