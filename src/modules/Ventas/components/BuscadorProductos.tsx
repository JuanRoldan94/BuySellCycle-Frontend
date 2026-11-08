import { useState, useEffect, useRef } from 'react';
import { Input, List, Button, Tag, Typography, message, Space, Avatar } from 'antd';
import { SearchOutlined, PlusOutlined, PictureOutlined } from '@ant-design/icons';
import { useVentaStore } from '../store/useVentaStore';
import { getProductosParaVenta } from '../services/ventas.service';

const { Text } = Typography;

interface ProductoBackend {
    id: number;
    nombre: string;
    stockTotal: number;
    precioLista: number;
    precioContado: number;
    estado: string;
    rutaImagenStorage?: string;
}

export const BuscadorProductos = () => {
    const [productos, setProductos] = useState<ProductoBackend[]>([]);
    const [busqueda, setBusqueda] = useState('');
    const [mostrarMenu, setMostrarMenu] = useState(false);
    const contenedorRef = useRef<HTMLDivElement>(null);

    const agregarProducto = useVentaStore((state) => state.agregarProducto);
    const detalles = useVentaStore((state) => state.detalles);

    useEffect(() => {
        const fetchProductos = async () => {
            try {
                const data = await getProductosParaVenta();
                setProductos(data);
            } catch (error) {
                console.error('Error al cargar productos:', error);
            }
        };
        fetchProductos();
    }, []);

    useEffect(() => {
        const handleClickFuera = (event: MouseEvent) => {
            if (contenedorRef.current && !contenedorRef.current.contains(event.target as Node)) {
                setMostrarMenu(false);
            }
        };

        document.addEventListener('mousedown', handleClickFuera);
        return () => document.removeEventListener('mousedown', handleClickFuera);
    }, []);

    const productosFiltrados = productos
        .filter((p) => p.estado === 'DISPONIBLE' && p.stockTotal > 0)
        .filter((p) => p.nombre.toLowerCase().includes(busqueda.toLowerCase()))
        .slice(0, 6);

    const handleAgregar = (producto: ProductoBackend) => {
        const itemEnCarrito = detalles.find((d) => d.productoId === producto.id);
        const cantidadReservada = itemEnCarrito ? itemEnCarrito.cantidad : 0;

        if (cantidadReservada >= producto.stockTotal) {
            message.warning(`¡Límite de stock! Solo hay ${producto.stockTotal} unidades disponibles de ${producto.nombre}.`);
            return;
        }

        agregarProducto({
            productoId: producto.id,
            nombre: producto.nombre,
            precio: Number(producto.precioLista),
            cantidad: 1,
            stockMaximo: producto.stockTotal,
        });

        message.success(`"${producto.nombre}" agregado al carrito`);
        setMostrarMenu(false);
        setBusqueda('');
    };

    return (
        <div style={{ position: 'relative', marginBottom: 16 }} ref={contenedorRef}>
            <Input
                size="large"
                prefix={<SearchOutlined style={{ color: '#1890ff' }} />}
                placeholder="Buscar bicicleta o repuesto por nombre para agregar..."
                value={busqueda}
                onChange={(e) => {
                    setBusqueda(e.target.value);
                    setMostrarMenu(true);
                }}
                onClick={() => setMostrarMenu(true)}
                onFocus={() => setMostrarMenu(true)}
                allowClear
            />

            {mostrarMenu && busqueda.trim() !== '' && (
                <div
                    style={{
                        position: 'absolute',
                        top: '100%',
                        left: 0,
                        right: 0,
                        zIndex: 1050,
                        backgroundColor: '#fff',
                        borderRadius: 8,
                        boxShadow: '0 6px 16px rgba(0, 0, 0, 0.12)',
                        marginTop: 4,
                        border: '1px solid #f0f0f0',
                        overflow: 'hidden',
                        maxHeight: 320,
                        overflowY: 'auto'
                    }}
                >
                    {productosFiltrados.length === 0 ? (
                        <div style={{ padding: 16, textAlign: 'center', color: '#8c8c8c' }}>
                            No se encontraron productos disponibles con stock.
                        </div>
                    ) : (
                        <List
                            dataSource={productosFiltrados}
                            renderItem={(prod) => (
                                <List.Item
                                    style={{
                                        padding: '12px 16px',
                                        cursor: 'pointer',
                                        transition: 'background-color 0.2s',
                                    }}
                                    actions={[
                                        <Button
                                            key="add"
                                            type="primary"
                                            size="small"
                                            icon={<PlusOutlined />}
                                            onClick={() => handleAgregar(prod)}
                                        >
                                            Agregar
                                        </Button>
                                    ]}
                                >
                                    <List.Item.Meta
                                        avatar={
                                            prod.rutaImagenStorage ? (
                                                <Avatar shape="square" size={40} src={prod.rutaImagenStorage} style={{ objectFit: 'contain', background: '#fff', border: '1px solid #f0f0f0' }} />
                                            ) : (
                                                <Avatar shape="square" size={40} icon={<PictureOutlined />} style={{ backgroundColor: '#f5f5f5', color: '#bfbfbf' }} />
                                            )
                                        }
                                        title={<Text strong>{prod.nombre}</Text>}
                                        description={
                                            <Space size="small">
                                                <Tag color="green">Stock: {prod.stockTotal}</Tag>
                                                <Tag color="blue">Precio: ${Number(prod.precioLista).toLocaleString('es-AR')}</Tag>
                                            </Space>
                                        }
                                    />
                                </List.Item>
                            )}
                        />
                    )}
                </div>
            )}
        </div>
    );
};
