import React, { useEffect } from 'react';
import { Modal, Form, Input, Select, message } from 'antd';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import { createUsuario, updateUsuario } from '../services/usuario.service';
import { getSucursales } from '../../Sucursales/services/sucursal.service';
import type { Usuario } from '../types/usuario.type';

interface UsuarioFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  usuarioToEdit?: Usuario | null;
}

export const UsuarioFormModal: React.FC<UsuarioFormModalProps> = ({ isOpen, onClose, usuarioToEdit }) => {
  const [form] = Form.useForm();
  const queryClient = useQueryClient();

  const { data: sucursales, isLoading: isLoadingSucursales } = useQuery({
    queryKey: ['sucursales'],
    queryFn: getSucursales,
    enabled: isOpen,
  });

  useEffect(() => {
    if (usuarioToEdit && isOpen) {
      form.setFieldsValue(usuarioToEdit);
    } else if (!isOpen) {
      form.resetFields();
    }
  }, [usuarioToEdit, isOpen, form]);

  const createMutation = useMutation({
    mutationFn: createUsuario,
    onSuccess: () => {
      message.success('Usuario creado correctamente');
      queryClient.invalidateQueries({ queryKey: ['usuarios'] });
      onClose();
    },
    onError: (error: any) => {
      message.error(error.response?.data?.message || 'Error al crear usuario');
    }
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) => updateUsuario(id, data),
    onSuccess: () => {
      message.success('Usuario actualizado correctamente');
      queryClient.invalidateQueries({ queryKey: ['usuarios'] });
      onClose();
    },
    onError: (error: any) => {
      message.error(error.response?.data?.message || 'Error al actualizar usuario');
    }
  });

  const handleSubmit = () => {
    form.validateFields().then((values) => {
      const payload = { ...values };

      if (payload.rol) {
        payload.rol = payload.rol.charAt(0).toUpperCase() + payload.rol.slice(1).toLowerCase();
      }

      if (payload.sucursalId) {
        payload.sucursalId = Number(payload.sucursalId);
      }

      if (usuarioToEdit) {
        updateMutation.mutate({ id: usuarioToEdit.id, data: payload })
      } else {
        createMutation.mutate(payload);
      }
    })
  };

  return (
    <Modal
      title={usuarioToEdit ? "Editar Usuario" : "Nuevo Usuario"}
      open={isOpen}
      onOk={handleSubmit}
      onCancel={onClose}
      confirmLoading={createMutation.isPending || updateMutation.isPending}
      okText="Guardar"
      cancelText="Cancelar"
    >
      <Form form={form} layout="vertical">
        <Form.Item name="nombre" label="Nombre" rules={[{ required: true, message: 'Nombre Requerido' }]}>
          <Input placeholder="Ej: Juan" autoFocus />
        </Form.Item>

        <Form.Item name="apellido" label="Apellido" rules={[{ required: true, message: 'Apellido Reqerido' }]}>
          <Input placeholder="Ej: Pérez" />
        </Form.Item>

        <Form.Item name="nombreUsuario" label="Nombre de Usuario" rules={[{ required: true, message: 'Nombre de Usuario Requerido' }]}>
          <Input placeholder="Ej: JuanPerez" />
        </Form.Item>

        <Form.Item name="dni" label="DNI" rules={[{ required: true, message: 'DNI Requerido' }]}>
          <Input placeholder="Ej: 12345678" />
        </Form.Item>

        {/* <Form.Item 
          name="password" 
          label={usuarioToEdit ? "Nueva Contraseña (dejar en blanco para mantener actual)" : "Contraseña"} 
          rules={[{ required: !usuarioToEdit, message: 'Requerido' }]}
        >
          <Input.Password placeholder="******" />
        </Form.Item> */}

        <Form.Item name="rol" label="Rol del Usuario" rules={[{ required: true, message: 'Requerido' }]}>
          <Select placeholder="Seleccione un rol">
            <Select.Option value="Administracion">Administracion</Select.Option>
            <Select.Option value="Vendedor">Vendedor</Select.Option>
          </Select>
        </Form.Item>

        <Form.Item name="sucursalId" label="Sucursal" rules={[{ required: true, message: 'Requerido' }]}>
          <Select placeholder="Seleccione la sucursal" loading={isLoadingSucursales}>
            {sucursales?.map(suc => (
              <Select.Option key={suc.id} value={suc.id}>{suc.nombre}</Select.Option>
            ))}
          </Select>
        </Form.Item>
      </Form>
    </Modal>
  );
};