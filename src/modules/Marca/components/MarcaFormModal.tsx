import React, { useEffect } from 'react';
import {Modal, Form, Input, message} from 'antd';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createMarca, updateMarca } from '../services/marca.service';
import type { Marca } from '../types/marca.type';

interface MarcaFormModalProps {
    isOpen: boolean;
    onClose: () => void;

    marcaToEdit?: Marca | null;
}

export const MarcaFormModal: React.FC<MarcaFormModalProps> = ({ isOpen, onClose, marcaToEdit }) => {
    const [form] = Form.useForm();
    const queryClient = useQueryClient();

    useEffect(() => {
        if (marcaToEdit && isOpen) {
            form.setFieldsValue({ nombre: marcaToEdit.nombre });
        } else if (!isOpen) {
            form.resetFields(); // Limpiamos al cerrar
        }
    }, [marcaToEdit, isOpen, form]);


    const createMutation = useMutation({
        mutationFn: createMarca,
        onSuccess: () => {
            message.success('Marca creada correctamente');
            form.resetFields();
            queryClient.invalidateQueries({ queryKey: ['marcas']});
            onClose();
        },
        onError: (error: any) => {
            const msj = error.response?.data?.message || 'Error al crear la marca';
            message.error(msj);
        },
    });

    const updateMutation = useMutation({
        mutationFn: ({ id, data }: { id: number; data: { nombre: string } }) => updateMarca(id, data),
        onSuccess: () => {
            message.success('Marca creada correctamente');
            queryClient.invalidateQueries({ queryKey: ['marcas'] });
            onClose();
        },
        onError: ( error: any ) => {
            message.error(error.response?.data?.message || 'Error al actualizar la marca');
        },
    });

    const handleSubmit = () => {
        form.validateFields().then((values) => {
            if (marcaToEdit) {
                updateMutation.mutate({ id: marcaToEdit.id, data: values });
            } else {
                createMutation.mutate(values);
            }
        });
    };

    return (
    <Modal
      title={marcaToEdit ? "Editar Marca" : "Nueva Marca"}
      open={isOpen}
      onOk={handleSubmit}
      onCancel={onClose}
      confirmLoading={createMutation.isPending}
      okText="Guardar"
      cancelText="Cancelar"
    >
      <Form form={form} layout="vertical">
        <Form.Item
          name="nombre"
          label="Nombre de la marca"
          rules={[
            { required: true, message: 'El nombre es obligatorio' },
            { min: 2, message: 'Debe tener al menos 2 caracteres' }
          ]}
        >
          <Input placeholder="Ej: Shimano, Trek, Venzo..." autoFocus />
        </Form.Item>
      </Form>
    </Modal>
  );
}