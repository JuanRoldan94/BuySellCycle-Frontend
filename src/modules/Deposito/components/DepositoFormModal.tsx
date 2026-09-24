import React, { useEffect } from 'react';
import { Modal, Form, Input, Row, Col, message, Select } from 'antd';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import { createDeposito, updateDeposito, getProvincias, getLocalidades } from '../services/deposito.service';

interface DepositoFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    depositoToEdit?: any | null;
}

export const DepositoFormModal: React.FC<DepositoFormModalProps> = ({ isOpen, onClose, depositoToEdit }) => {
    const [form] = Form.useForm();
    const queryClient = useQueryClient();

    const { data: provincias, isLoading: loadingProv } = useQuery({
        queryKey: ['provincias'],
        queryFn: getProvincias,
        enabled: isOpen
    });

    const { data: localidades, isLoading: loadingLoc } = useQuery({
        queryKey: ['localidades'],
        queryFn: getLocalidades,
        enabled: isOpen
    });

    const provinciaSeleccionada = Form.useWatch('provinciaId', form);

    useEffect(() => {
        if (depositoToEdit && isOpen) {
            form.setFieldsValue(depositoToEdit);
        } else if (!isOpen) {
            form.resetFields();
        }
    }, [depositoToEdit, isOpen, form]);

    const createMutation = useMutation({
        mutationFn: createDeposito,
        onSuccess: () => {
            message.success('Depósito creado correctamente');
            queryClient.invalidateQueries({ queryKey: ['depositos'] });
            onClose();
        },
        onError: (error: any) => message.error(error.response?.data?.message || 'Error al crear'),
    });

    const updateMutation = useMutation({
        mutationFn: ({ id, data }: { id: number; data: any }) => updateDeposito(id, data),
        onSuccess: () => {
        message.success('Depósito actualizado correctamente');
        queryClient.invalidateQueries({ queryKey: ['depositos'] });
        onClose();
        },
        onError: (error: any) => message.error(error.response?.data?.message || 'Error al actualizar'),
    });

    const handleSubmit = () => {
        form.validateFields().then((values) => {
        const payload = {
            ...values,
            provinciaId: Number(values.provinciaId),
            localidadId: Number(values.localidadId),
        };

        if (depositoToEdit) {
            updateMutation.mutate({ id: depositoToEdit.id, data: payload });
        } else {
            createMutation.mutate(payload);
        }
        });
    };

    return (
        <Modal
            title={depositoToEdit ? "Editar Depósito" : "Nuevo Depósito"}
            open={isOpen}
            onOk={handleSubmit}
            onCancel={onClose}
            confirmLoading={createMutation.isPending || updateMutation.isPending}
            okText="Guardar"
            cancelText="Cancelar"
            >
            <Form form={form} layout="vertical">
                <Row gutter={16}>
                    {/* <Form.Item name="codigo" label="Código" rules={[{ required: false, message: 'Requerido' }]}>
                        <Input placeholder="Ej: DEP-001" autoFocus />
                    </Form.Item> */}
                    <Col span={12}>
                        <Form.Item name="nombre" label="Nombre del Depósito" rules={[{ required: true, message: 'Requerido' }]}>
                        <Input placeholder="Ej: Depósito Central" />
                        </Form.Item>
                    </Col>
                </Row>

                <Row gutter={16}>
                    <Col span={12}>
                    <Form.Item name="provinciaId" label="Provincia" rules={[{ required: true, message: 'Requerido' }]}>
                        <Select loading={loadingProv} placeholder="Seleccione provincia">
                        {provincias?.map((p: any) => (
                            <Select.Option key={p.id} value={p.id}>{p.nombre}</Select.Option>
                        ))}
                        </Select>
                    </Form.Item>
                    </Col>
                    <Col span={12}>
                    <Form.Item name="localidadId" label="Localidad" rules={[{ required: true, message: 'Requerido' }]}>
                        <Select loading={loadingLoc} placeholder="Seleccione localidad" disabled={!provinciaSeleccionada}>
                        {localidades
                            ?.filter((l: any) => l.provinciaId === provinciaSeleccionada)
                            .map((l: any) => (
                            <Select.Option key={l.id} value={l.id}>{l.nombre}</Select.Option>
                            ))}
                        </Select>
                    </Form.Item>
                    </Col>
                </Row>
            </Form>
        </Modal>
    );
};