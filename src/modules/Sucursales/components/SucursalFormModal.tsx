import React, { useEffect } from 'react';
import { Modal, Form, Input, Select, Row, Col, message } from 'antd';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import { createSucursal, updateSucursal, getProvincias, getLocalidades } from '../services/sucursal.service';

interface SucursalFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  sucursalToEdit?: any | null;
}

export const SucursalFormModal: React.FC<SucursalFormModalProps> = ({ isOpen, onClose, sucursalToEdit }) => {
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
      const msj = error.response?.data?.message;
      const errorText = Array.isArray(msj) ? msj.join(' - ') : (msj || 'Error al crear');
      message.error(errorText);
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
      const msj = error.response?.data?.message;
      message.error(Array.isArray(msj) ? msj[0] : (msj || 'Error al actualizar'));
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