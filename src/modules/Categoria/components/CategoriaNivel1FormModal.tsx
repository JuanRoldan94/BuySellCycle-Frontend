import React, { useEffect } from 'react';
import { Modal, Form, Input, message } from 'antd';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createCategoriaNivel1, updateCategoriaNivel1 } from '../services/categoria.service';
import type { CategoriaNivel1 } from '../types/categoria.type';

interface CategoriaNivel1FormModalProps {
  isOpen: boolean;
  onClose: () => void;
  categoriaToEdit?: CategoriaNivel1 | null;
}

export const CategoriaNivel1FormModal: React.FC<CategoriaNivel1FormModalProps> = ({ 
  isOpen, 
  onClose, 
  categoriaToEdit 
}) => {
  const [form] = Form.useForm();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (categoriaToEdit && isOpen) {
      form.setFieldsValue({ nombre: categoriaToEdit.nombre });
    } else if (!isOpen) {
      form.resetFields();
    }
  }, [categoriaToEdit, isOpen, form]);

  const createMutation = useMutation({
    mutationFn: createCategoriaNivel1,
    onSuccess: () => {
      message.success('Categoría Nivel 1 creada correctamente');
      queryClient.invalidateQueries({ queryKey: ['categorias-jerarquia'] });
      onClose();
    },
    onError: (error: any) => {
      message.error(error.response?.data?.message || 'Error al crear la categoría');
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: { nombre: string } }) => updateCategoriaNivel1(id, data),
    onSuccess: () => {
      message.success('Categoría Nivel 1 actualizada correctamente');
      queryClient.invalidateQueries({ queryKey: ['categorias-jerarquia'] });
      onClose();
    },
    onError: (error: any) => {
      message.error(error.response?.data?.message || 'Error al actualizar la categoría');
    },
  });

  const handleSubmit = () => {
    form.validateFields().then((values) => {
      if (categoriaToEdit) {
        updateMutation.mutate({ id: categoriaToEdit.id, data: values });
      } else {
        createMutation.mutate(values);
      }
    });
  };

  const isPending = createMutation.isPending || updateMutation.isPending;

  return (
    <Modal
      title={categoriaToEdit ? "Editar Categoría Principal" : "Nueva Categoría Principal"}
      open={isOpen}
      onOk={handleSubmit}
      onCancel={onClose}
      confirmLoading={isPending}
      okText="Guardar"
      cancelText="Cancelar"
    >
      <Form form={form} layout="vertical">
        <Form.Item
          name="nombre"
          label="Nombre de la categoría"
          rules={[
            { required: true, message: 'El nombre es obligatorio' },
            { min: 3, message: 'Debe tener al menos 3 caracteres' }
          ]}
        >
          <Input placeholder="Ej: Bicicletas, Accesorios, Repuestos..." autoFocus />
        </Form.Item>
      </Form>
    </Modal>
  );
};