import { useState, useEffect } from 'react';
import { Radio, Select, Card, Typography } from 'antd';
import { CreditCardOutlined } from '@ant-design/icons';
import { useVentaStore } from '../store/useVentaStore';
import { getPlanesParaVenta } from '../services/ventas.service';

const { Text } = Typography;

interface PlanBackend {
    id: number;
    tasaFinanciacion: number;
    cantidadCuotas: number;
    tarjeta: { id: number; nombre: string };
    banco: { id: number; nombre: string };
}

export const PanelFinanciacion = () => {
    const [planes, setPlanes] = useState<PlanBackend[]>([]);

    const [tarjetaIdLoc, setTarjetaIdLoc] = useState<number | undefined>(undefined);
    const [bancoIdLoc, setBancoIdLoc] = useState<number | undefined>(undefined);

    const modoPago = useVentaStore((state) => state.modoPago);
    const planId = useVentaStore((state) => state.planId);
    const setMetodoPago = useVentaStore((state) => state.setMetodoPago);

    useEffect(() => {
        const fetchPlanes = async () => {
            try {
                const data: PlanBackend[] = await getPlanesParaVenta();
                setPlanes(data);
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
            setTarjetaIdLoc(undefined);
            setBancoIdLoc(undefined);
        }
    };

    return (
        <div style={{ marginBottom: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: 8 }}>
                <CreditCardOutlined style={{ color: '#1890ff', marginRight: 6 }} />
                <Text strong>Modalidad de Pago:</Text>
            </div>

            <Radio.Group
                style={{ width: '100%', marginBottom: 12 }}
                value={modoPago}
                onChange={(e) => handleCambioModo(e.target.value)}
            >
                <Radio.Button value="CONTADO" style={{ width: '50%', textAlign: 'center' }}>
                    💵 Contado
                </Radio.Button>
                <Radio.Button value="PLAN" style={{ width: '50%', textAlign: 'center' }}>
                    💳 Financiado
                </Radio.Button>
            </Radio.Group>

            {modoPago === 'PLAN' && (
                <Card
                    size="small"
                    style={{
                        background: '#fafafa',
                        borderColor: '#d9d9d9',
                        borderRadius: 6,
                    }}
                >
                    <div style={{ marginBottom: 10 }}>
                        <Text type="secondary" style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>
                            1. Tarjeta:
                        </Text>
                        <Select
                            style={{ width: '100%' }}
                            placeholder="Seleccione tarjeta..."
                            value={tarjetaIdLoc}
                            onChange={(val) => {
                                setTarjetaIdLoc(val);
                                setBancoIdLoc(undefined);
                                setMetodoPago('PLAN', null);
                            }}
                            options={tarjetasUnicas.map(t => ({ value: t.id, label: t.nombre }))}
                        />
                    </div>

                    <div style={{ marginBottom: 10 }}>
                        <Text type="secondary" style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>
                            2. Banco Emisor:
                        </Text>
                        <Select
                            style={{ width: '100%' }}
                            placeholder="Seleccione banco..."
                            value={bancoIdLoc}
                            disabled={!tarjetaIdLoc}
                            onChange={(val) => {
                                setBancoIdLoc(val);
                                setMetodoPago('PLAN', null);
                            }}
                            options={bancosDisponibles.map(b => ({ value: b.id, label: b.nombre }))}
                        />
                    </div>

                    <div>
                        <Text type="secondary" style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>
                            3. Plan de Cuotas:
                        </Text>
                        <Select
                            style={{ width: '100%' }}
                            placeholder="Seleccione cantidad de cuotas..."
                            value={planId || undefined}
                            disabled={!bancoIdLoc}
                            onChange={(idSeleccionado) => {
                                const planElegido = cuotasDisponibles.find(p => p.id === idSeleccionado);
                                const tasa = planElegido ? Number(planElegido.tasaFinanciacion) : 0;
                                setMetodoPago('PLAN', idSeleccionado, tasa);
                            }}
                            options={cuotasDisponibles.map(p => ({
                                value: p.id,
                                label: `${p.cantidadCuotas} cuotas fijas (${Number(p.tasaFinanciacion) > 0 ? `+${p.tasaFinanciacion}% interés` : 'Sin interés'})`
                            }))}
                        />
                    </div>
                </Card>
            )}
        </div>
    );
};
