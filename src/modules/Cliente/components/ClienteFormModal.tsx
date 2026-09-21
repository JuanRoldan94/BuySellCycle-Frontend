import React, { useEffect } from 'react';
import { Modal, Form, Input, Row, Col, message, Select } from 'antd';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import { createCliente, getProvincias, updateCliente, getLocalidades } from '../services/cliente.service';
import type { Cliente } from '../types/cliente.type';

interface ClienteFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  clienteToEdit?: Cliente | null;
}

export const ClienteFormModal: React.FC<ClienteFormModalProps> = ({ isOpen, onClose, clienteToEdit }) => {
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
      const payload = {
        ...values,
        provinciaId: Number(values.provinciaId),
        localidadId: Number(values.localidadId),
      };

      if (clienteToEdit) {
        updateMutation.mutate({ id: clienteToEdit.id, data: payload });
      } else {
        createMutation.mutate(payload);
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
            <Form.Item name="dni" label="DNI / CUIT" rules={[{ required: true, message: 'Requerido' }]}>
              <Input placeholder="Ej: 20345678901" />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item name="email" label="Email" rules={[{ required: true, message: 'Requerido' }, { type: 'email', message: 'Email inválido' }]}>
              <Input placeholder="Ej: juan.perez@email.com" />
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