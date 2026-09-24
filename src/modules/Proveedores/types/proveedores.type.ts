export interface Proveedor {
    id: number;
    razonSocial: string;
    cuit: string;
    archivado?: boolean;
    fecha_creacion?: string;
    fecha_actualizacion?: string;
}