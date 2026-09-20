export interface Cliente {
    id: number;
    nombre: string;
    apellido: string;
    email?: string;
    telefono: string;
    dni: string;
    direccion?: string;
    archivado: boolean;
}