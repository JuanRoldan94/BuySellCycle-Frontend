export interface DireccionEntrega {
    id: number;
    direccion: string;
    principal: boolean;
    clienteId: number;
    archivado?: boolean;
}

export interface Cliente {
    id: number;
    nombre: string;
    apellido: string;
    email?: string;
    dni: string;
    telefono?: string;
    direccion?: string;
    provinciaId?: number;
    localidadId?: number;
    archivado: boolean;
    direccionEntregas?: DireccionEntrega[];
}
