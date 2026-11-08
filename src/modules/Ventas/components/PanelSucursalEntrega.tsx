import { useState, useEffect } from 'react';
import { Select, Radio, Input, Typography } from 'antd';
import { ShopOutlined, CarOutlined, EnvironmentOutlined } from '@ant-design/icons';
import { useVentaStore } from '../store/useVentaStore';
import { getSucursalesParaVenta } from '../services/ventas.service';

const { Text } = Typography;

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
                        <Input
                            prefix={<EnvironmentOutlined style={{ color: '#1890ff' }} />}
                            placeholder="Dirección exacta de entrega (ej: Bv. Santa Fe 123)..."
                            value={direccionEntregaTexto}
                            onChange={(e) => setDireccionEntregaTexto(e.target.value)}
                        />
                    </div>
                )}
            </div>
        </div>
    );
};
