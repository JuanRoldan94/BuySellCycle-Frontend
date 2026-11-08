import { useState, useEffect } from 'react';
import { Select, Radio, Input, Typography, Space, Tag } from 'antd';
import { ShopOutlined, CarOutlined, EnvironmentOutlined } from '@ant-design/icons';
import { useVentaStore } from '../store/useVentaStore';
import { getSucursalesParaVenta } from '../services/ventas.service';
import { getDireccionesCliente } from '../../Cliente/services/cliente.service';
import type { DireccionEntrega } from '../../Cliente/types/cliente.type';

const { Text } = Typography;

interface SucursalBackend {
    id: number;
    nombre: string;
}

export const PanelSucursalEntrega = () => {
    const [sucursales, setSucursales] = useState<SucursalBackend[]>([]);
    const [direccionesCliente, setDireccionesCliente] = useState<DireccionEntrega[]>([]);
    const [cargandoDirecciones, setCargandoDirecciones] = useState(false);
    const [direccionSeleccionadaId, setDireccionSeleccionadaId] = useState<number | 'OTRA' | null>(null);

    const clienteId = useVentaStore((state) => state.clienteId);
    const sucursalId = useVentaStore((state) => state.sucursalId);
    const setSucursal = useVentaStore((state) => state.setSucursal);
    const modoEntrega = useVentaStore((state) => state.modoEntrega);
    const setModoEntrega = useVentaStore((state) => state.setModoEntrega);
    const direccionEntregaTexto = useVentaStore((state) => state.direccionEntregaTexto);
    const setDireccionEntregaTexto = useVentaStore((state) => state.setDireccionEntregaTexto);

    useEffect(() => {
        const fetchSucursales = async () => {
            try {
                const data: SucursalBackend[] = await getSucursalesParaVenta();
                setSucursales(data);

                if (data.length > 0 && !sucursalId) {
                    setSucursal(data[0].id);
                }
            } catch (error) {
                console.error('Error al cargar sucursales:', error);
            }
        };
        fetchSucursales();
    }, [sucursalId, setSucursal]);

    useEffect(() => {
        if (!clienteId) {
            setDireccionesCliente([]);
            setDireccionSeleccionadaId(null);
            return;
        }

        const fetchDirecciones = async () => {
            setCargandoDirecciones(true);
            try {
                const dirs = await getDireccionesCliente(clienteId);
                setDireccionesCliente(dirs);

                if (dirs.length > 0) {
                    const principal = dirs.find(d => d.principal) || dirs[0];
                    setDireccionSeleccionadaId(principal.id);
                    setDireccionEntregaTexto(principal.direccion);
                } else {
                    setDireccionSeleccionadaId('OTRA');
                }
            } catch (err) {
                console.error('Error al cargar direcciones del cliente:', err);
            } finally {
                setCargandoDirecciones(false);
            }
        };

        fetchDirecciones();
    }, [clienteId, setDireccionEntregaTexto]);

    return (
        <div style={{ marginBottom: 16 }}>
            <div style={{ marginBottom: 12 }}>
                <div style={{ display: 'flex', alignItems: 'center', marginBottom: 6 }}>
                    <ShopOutlined style={{ color: '#1890ff', marginRight: 6 }} />
                    <Text strong>Sucursal de Origen:</Text>
                </div>
                <Select
                    style={{ width: '100%' }}
                    placeholder="Seleccione sucursal..."
                    value={sucursalId || undefined}
                    onChange={(val) => setSucursal(val)}
                    options={sucursales.map(s => ({ value: s.id, label: s.nombre }))}
                />
            </div>

            <div>
                <div style={{ display: 'flex', alignItems: 'center', marginBottom: 6 }}>
                    <CarOutlined style={{ color: '#1890ff', marginRight: 6 }} />
                    <Text strong>Método de Entrega:</Text>
                </div>
                <Radio.Group
                    style={{ width: '100%', marginBottom: 8 }}
                    value={modoEntrega}
                    onChange={(e) => setModoEntrega(e.target.value)}
                >
                    <Radio.Button value="RETIRO_SUCURSAL" style={{ width: '50%', textAlign: 'center' }}>
                        🏢 Retiro Sucursal
                    </Radio.Button>
                    <Radio.Button value="ENTREGA_DOMICILIO" style={{ width: '50%', textAlign: 'center' }}>
                        🚚 Domicilio
                    </Radio.Button>
                </Radio.Group>

                {modoEntrega === 'ENTREGA_DOMICILIO' && (
                    <div style={{ marginTop: 8 }}>
                        {direccionesCliente.length > 0 ? (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                                <Text type="secondary" style={{ fontSize: 12 }}>
                                    Dirección de entrega del cliente:
                                </Text>
                                <Select
                                    style={{ width: '100%' }}
                                    loading={cargandoDirecciones}
                                    value={direccionSeleccionadaId || undefined}
                                    onChange={(val) => {
                                        setDireccionSeleccionadaId(val);
                                        if (val === 'OTRA') {
                                            setDireccionEntregaTexto('');
                                        } else {
                                            const dir = direccionesCliente.find(d => d.id === val);
                                            if (dir) {
                                                setDireccionEntregaTexto(dir.direccion);
                                            }
                                        }
                                    }}
                                    options={[
                                        ...direccionesCliente.map(d => ({
                                            value: d.id,
                                            label: (
                                                <Space>
                                                    <span>{d.direccion}</span>
                                                    {d.principal && <Tag color="success">Principal</Tag>}
                                                </Space>
                                            )
                                        })),
                                        {
                                            value: 'OTRA',
                                            label: '✏️ Otra dirección personalizada...'
                                        }
                                    ]}
                                />

                                {direccionSeleccionadaId === 'OTRA' && (
                                    <Input
                                        prefix={<EnvironmentOutlined style={{ color: '#1890ff' }} />}
                                        placeholder="Ingrese la dirección exacta de entrega..."
                                        value={direccionEntregaTexto}
                                        onChange={(e) => setDireccionEntregaTexto(e.target.value)}
                                        autoFocus
                                    />
                                )}
                            </div>
                        ) : (
                            <div>
                                <Input
                                    prefix={<EnvironmentOutlined style={{ color: '#1890ff' }} />}
                                    placeholder="Dirección exacta de entrega (ej: Bv. Santa Fe 123)..."
                                    value={direccionEntregaTexto}
                                    onChange={(e) => setDireccionEntregaTexto(e.target.value)}
                                />
                                {!clienteId && (
                                    <Text type="secondary" style={{ fontSize: 11, display: 'block', marginTop: 4 }}>
                                        * Seleccione un cliente para ver sus direcciones registradas
                                    </Text>
                                )}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};
