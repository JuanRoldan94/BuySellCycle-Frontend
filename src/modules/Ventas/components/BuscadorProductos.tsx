import { useState, useEffect } from 'react';
import { useVentaStore } from '../store/useventaStore';

interface ProductoBackend {
    id: number;
    nombre: string;
    stockTotal: number;
    precioLista: number;
    precioContado: number;
    estado: string;
}

export const BuscadorProductos = () => {
    const [productos, setProductos] = useState<ProductoBackend[]>([]);
    const [busqueda, setBusqueda] = useState('');

    const agregarProducto = useVentaStore((state) => state.agregarProducto);
    const detalles = useVentaStore((state) => state.detalles);

    useEffect(() => {
        const fetchProductos = async () => {
            try {
                const res = await fetch('http://localhost:3000/productos');
                if (res.ok) {
                    const data = await res.json();
                    setProductos(data);
                }
            } catch (error) {
                console.error('Error al cargar productos:', error);
            }
        };
        fetchProductos();
    }, []);

    const productosFiltrados = productos
        .filter((p) => p.estado === 'DISPONIBLE' && p.stockTotal > 0)
        .filter((p) => p.nombre.toLowerCase().includes(busqueda.toLowerCase()))
        .slice(0, 5);

    const handleAgregar = (producto: ProductoBackend) => {
        const itemEnCarrito = detalles.find((d) => d.productoId === producto.id);
        const cantidadReservada = itemEnCarrito ? itemEnCarrito.cantidad : 0;

        if (cantidadReservada >= producto.stockTotal) {
            alert(`¡Límite de stock! Solo hay ${producto.stockTotal} unidades disponibles de ${producto.nombre}.`);
            return;
        }

        agregarProducto({
            productoId: producto.id,
            nombre: producto.nombre,
            precio: Number(producto.precioLista),
            cantidad: 1,
        });
    };

    return (
        <div className="mb-4">
            <div className="input-group mb-3">
                <span className="input-group-text bg-light">🔍</span>
                <input
                    type="text"
                    className="form-control"
                    placeholder="Buscar bicicleta o repuesto por nombre..."
                    value={busqueda}
                    onChange={(e) => setBusqueda(e.target.value)}
                />
            </div>

            {busqueda.trim() !== '' && (
                <ul className="list-group shadow-sm position-absolute z-3 w-100" style={{ maxWidth: '95%' }}>
                    {productosFiltrados.length === 0 ? (
                        <li className="list-group-item text-muted">No se encontraron productos con stock.</li>
                    ) : (
                        productosFiltrados.map((prod) => (
                            <li key={prod.id} className="list-group-item d-flex justify-content-between align-items-center">
                                <div>
                                    <span className="fw-bold d-block">{prod.nombre}</span>
                                    <small className="text-muted">
                                        Stock disponible: {prod.stockTotal} | Precio Lista: ${prod.precioLista}
                                    </small>
                                </div>
                                <button
                                    className="btn btn-primary btn-sm px-3 rounded-pill"
                                    onClick={() => handleAgregar(prod)}
                                >
                                    + Agregar
                                </button>
                            </li>
                        ))
                    )}
                </ul>
            )}
        </div>
    );
};