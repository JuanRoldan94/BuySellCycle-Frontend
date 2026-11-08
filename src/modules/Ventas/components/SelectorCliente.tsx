import { useState, useEffect } from 'react';
import { Input, Button, Card, Space, Typography, message } from 'antd';
import { UserOutlined, SearchOutlined, CheckCircleOutlined, CloseOutlined } from '@ant-design/icons';
import { useVentaStore } from '../store/useVentaStore';
import { getClientesParaVenta } from '../services/ventas.service';

const { Text } = Typography;

interface ClienteBackend {
    id: number;
    nombre: string;
    apellido: string;
    dni: string;
    email?: string;
}

export const SelectorCliente = () => {
    const [dniInput, setDniInput] = useState('');
    const [clienteEncontrado, setClienteEncontrado] = useState<ClienteBackend | null>(null);
    const [buscando, setBuscando] = useState(false);

    const setClienteIdStore = useVentaStore((state) => state.setCliente);
    const clienteIdActual = useVentaStore((state) => state.clienteId);

    useEffect(() => {
        if (clienteIdActual === null) {
            setClienteEncontrado(null);
            setDniInput('');
        }
    }, [clienteIdActual]);

    const handleBuscar = async () => {
        if (!dniInput.trim()) {
            message.warning('Ingrese un número de DNI para buscar.');
            return;
        }

        setBuscando(true);
        try {
            const clientes: ClienteBackend[] = await getClientesParaVenta();
            const coincidencia = clientes.find(c => c.dni.trim() === dniInput.trim());

            if (coincidencia) {
                setClienteEncontrado(coincidencia);
                setClienteIdStore(coincidencia.id);
                message.success(`Cliente seleccionado: ${coincidencia.nombre} ${coincidencia.apellido}`);
            } else {
                message.error('No se encontró ningún cliente registrado con ese DNI.');
                setClienteIdStore(null);
            }
        } catch (err) {
            console.error('Error al buscar cliente:', err);
            message.error('Error de conexión al buscar el cliente.');
        } finally {
            setBuscando(false);
        }
    };

    const handleLimpiar = () => {
        setClienteEncontrado(null);
        setDniInput('');
        setClienteIdStore(null);
    };

    return (
        <div style={{ marginBottom: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: 8 }}>
                <UserOutlined style={{ color: '#1890ff', marginRight: 6 }} />
                <Text strong>Cliente:</Text>
            </div>

            {!clienteEncontrado ? (
                <Space.Compact style={{ width: '100%' }}>
                    <Input
                        placeholder="Ingrese DNI del cliente..."
                        value={dniInput}
                        onChange={(e) => setDniInput(e.target.value)}
                        onPressEnter={handleBuscar}
                        allowClear
                    />
                    <Button
                        type="primary"
                        icon={<SearchOutlined />}
                        onClick={handleBuscar}
                        loading={buscando}
                    >
                        Buscar
                    </Button>
                </Space.Compact>
            ) : (
                <Card
                    size="small"
                    style={{
                        background: '#f6ffed',
                        borderColor: '#b7eb8f',
                        borderRadius: 6,
                    }}
                >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                            <Space align="center">
                                <CheckCircleOutlined style={{ color: '#52c41a' }} />
                                <Text strong style={{ fontSize: 14 }}>
                                    {clienteEncontrado.nombre} {clienteEncontrado.apellido}
                                </Text>
                            </Space>
                            <div style={{ fontSize: 12, color: '#595959', marginLeft: 20 }}>
                                DNI: <strong>{clienteEncontrado.dni}</strong>
                            </div>
                        </div>
                        <Button
                            size="small"
                            type="text"
                            danger
                            icon={<CloseOutlined />}
                            onClick={handleLimpiar}
                            title="Cambiar cliente"
                        >
                            Cambiar
                        </Button>
                    </div>
                </Card>
            )}
        </div>
    );
};
