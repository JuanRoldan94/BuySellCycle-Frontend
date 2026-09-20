import React, { useEffect } from 'react';
import { Modal, Form, Input, Row, Col, message } from 'antd';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createCliente, updateCliente } from '../services/cliente.service';
import type { Cliente } from '../types/cliente.type';

interface ClienteFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  clienteToEdit?: Cliente | null;
}

export const ClienteFormModal: React.FC<ClienteFormModalProps> = ({ isOpen, onClose, clienteToEdit }) => {
  const [form] = Form.useForm();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (clienteToEdit && isOpen) {
      form.setFieldsValue(clienteToEdit);
    } else if (!isOpen) {
      form.resetFields();
    }
  }, [clienteToEdit, isOpen, form]);

  const createMutation = useMutation({
    mutationFn: createCliente,
    onSuccess: () => {
      message.success('Cliente creado correctamente');
      queryClient.invalidateQueries({ queryKey: ['clientes'] });
      onClose();
    },
    onError: (error: any) => {
      message.error(error.response?.data?.message || 'Error al crear el cliente');
    }
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) => updateCliente(id, data),
    onSuccess: () => {
      message.success('Cliente actualizado correctamente');
      queryClient.invalidateQueries({ queryKey: ['clientes'] });
      onClose();
    },
    onError: (error: any) => {
      message.error(error.response?.data?.message || 'Error al actualizar el cliente');
    }
  });

  const handleSubmit = () => {
    form.validateFields().then((values) => {
      if (clienteToEdit) {
        updateMutation.mutate({ id: clienteToEdit.id, data: values });
      } else {
        createMutation.mutate(values);
      }
    });
  };

  return (
    <Modal
      title={clienteToEdit ? "Editar Cliente" : "Nuevo Cliente"}
      open={isOpen}
      onOk={handleSubmit}
      onCancel={onClose}
      confirmLoading={createMutation.isPending || updateMutation.isPending}
      okText="Guardar"
      cancelText="Cancelar"
      width={600}
    >
      <Form form={form} layout="vertical">
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item name="nombre" label="Nombre" rules={[{ required: true, message: 'Requerido' }]}>
              <Input placeholder="Ej: Juan" autoFocus />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item name="apellido" label="Apellido" rules={[{ required: true, message: 'Requerido' }]}>
              <Input placeholder="Ej: Pérez" />
            </Form.Item>
          </Col>
        </Row>
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item name="dni" label="DNI / CUIT">
              <Input placeholder="Ej: 20345678901" />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item name="telefono" label="Teléfono">
              <Input placeholder="Ej: 3492-151234" />
            </Form.Item>
          </Col>
        </Row>
        <Form.Item name="email" label="Email" rules={[{ type: 'email', message: 'Email inválido' }]}>
          <Input placeholder="Ej: juan.perez@email.com" />
        </Form.Item>
        <Form.Item name="direccion" label="Dirección">
          <Input placeholder="Ej: Av. Santa Fe 1234" />
        </Form.Item>
      </Form>
    </Modal>
  );
};