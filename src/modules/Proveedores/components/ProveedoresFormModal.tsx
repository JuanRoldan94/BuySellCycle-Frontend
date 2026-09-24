import React, { useEffect } from 'react';
import { Modal, Form, Input, message } from 'antd';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createProveedor, updateProveedor } from '../services/Proveedores.service';
import type { Proveedor } from '../types/proveedores.type';

interface ProveedoresFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    proveedorToEdit?: Proveedor | null;
}

export const ProveedoresFormModal: React.FC<ProveedoresFormModalProps> = ({
    isOpen,
    onClose,
    proveedorToEdit
}) => {
    const [form] = Form.useForm();
    const queryClient = useQueryClient();

    useEffect(() => {
        if (proveedorToEdit && isOpen) {
            form.setFieldsValue(proveedorToEdit);
        } else if (!isOpen) {
            form.resetFields();
        }
    }, [proveedorToEdit, isOpen, form]);

    const createMutation = useMutation({
        mutationFn: createProveedor,
        onSuccess: () => {
            message.success('Proveedor creado correctamente');
            queryClient.invalidateQueries({ queryKey: ['proveedores'] });
            onClose();
        },
        onError: (error: any) => {
            message.error(error.response?.data?.message || 'Error al crear el proveedor');
        },
    });

    const updateMutation = useMutation({
        mutationFn: ({ id, data }: { id: number; data: any }) => updateProveedor(id, data),
        onSuccess: () => {
            message.success('Proveedor actualizado correctamente');
            queryClient.invalidateQueries({ queryKey: ['proveedores'] });
            onClose();
        },
        onError: (error: any) => {
            message.error(error.response?.data?.message || 'Error al actualizar el proveedor');
        },
    });

    const handleSubmit = () => {
        form.validateFields().then((values) => {
            const payload = { ...values };

            if (proveedorToEdit) {
                updateMutation.mutate({ id: proveedorToEdit.id, data: payload });
            } else {
                createMutation.mutate(payload);
            }
        });
    };

    return (
        <Modal
            title={proveedorToEdit ? "Editar Proveedor" : "Nuevo Proveedor"}
            open={isOpen}
            onOk={handleSubmit}
            onCancel={onClose}
            confirmLoading={createMutation.isPending || updateMutation.isPending}
            okText="Guardar"
            cancelText="Cancelar"
        >
            <Form form={form} layout="vertical">
                <Form.Item
                    name="razonSocial"
                    label="Razón Social"
                    rules={[{ required: true, message: 'La razón social es obligatoria' }]}
                >
                    <Input placeholder="Ej: Distribuidora del Centro S.A." autoFocus />
                </Form.Item>

                <Form.Item
                    name="cuit"
                    label="CUIT"
                    rules={[
                        { required: true, message: 'El CUIT es obligatorio' },
                        { len: 11, message: 'El CUIT debe tener exactamente 11 caracteres numéricos sin guiones' },
                        { pattern: /^[0-9]+$/, message: 'El CUIT solo debe contener números' }
                    ]}
                >
                    <Input
                        placeholder="Ej: 30112233445"
                        maxLength={11}
                        showCount
                    />
                </Form.Item>
            </Form>
        </Modal>
    );
};