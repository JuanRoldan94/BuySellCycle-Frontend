import React, { useEffect } from 'react';
import { Modal, Form, Input, message } from 'antd';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createSucursal, updateSucursal } from '../services/sucursal.service';
import type { Sucursal } from '../types/sucursal.type';

interface SucursalFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  sucursalToEdit?: Sucursal | null;
}

export const SucursalFormModal: React.FC<SucursalFormModalProps> = ({ isOpen, onClose, sucursalToEdit }) => {
  const [form] = Form.useForm();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (sucursalToEdit && isOpen) {
      form.setFieldsValue(sucursalToEdit);
    } else if (!isOpen) {
      form.resetFields();
    }
  }, [sucursalToEdit, isOpen, form]);

  const createMutation = useMutation({
    mutationFn: createSucursal,
    onSuccess: () => {
      message.success('Sucursal creada correctamente');
      queryClient.invalidateQueries({ queryKey: ['sucursales'] });
      onClose();
    },
    onError: (error: any) => {
      message.error(error.response?.data?.message || 'Error al crear sucursal');
    }
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) => updateSucursal(id, data),
    onSuccess: () => {
      message.success('Sucursal actualizada correctamente');
      queryClient.invalidateQueries({ queryKey: ['sucursales'] });
      onClose();
    },
    onError: (error: any) => {
      message.error(error.response?.data?.message || 'Error al actualizar sucursal');
    }
  });

  const handleSubmit = () => {
    form.validateFields().then((values) => {
      if (sucursalToEdit) {
        updateMutation.mutate({ id: sucursalToEdit.id, data: values });
      } else {
        createMutation.mutate(values);
      }
    });
  };

  return (
    <Modal
      title={sucursalToEdit ? "Editar Sucursal" : "Nueva Sucursal"}
      open={isOpen}
      onOk={handleSubmit}
      onCancel={onClose}
      confirmLoading={createMutation.isPending || updateMutation.isPending}
      okText="Guardar"
      cancelText="Cancelar"
    >
      <Form form={form} layout="vertical">
        <Form.Item name="nombre" label="Nombre de la Sucursal" rules={[{ required: true, message: 'Requerido' }]}>
          <Input placeholder="Ej: Sucursal Centro" autoFocus />
        </Form.Item>
        <Form.Item name="direccion" label="Dirección" rules={[{ required: true, message: 'Requerido' }]}>
          <Input placeholder="Ej: Av. San Martín 123" />
        </Form.Item>
        <Form.Item name="telefono" label="Teléfono">
          <Input placeholder="Ej: 3492-123456" />
        </Form.Item>
      </Form>
    </Modal>
  );
};