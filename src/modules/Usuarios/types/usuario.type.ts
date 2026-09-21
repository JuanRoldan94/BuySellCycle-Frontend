export interface Usuario {
  id: number;
  nombre: string;
  apellido: string;
  rol: string;
  sucursalId: number;
  archivado: boolean;

  sucursal?: { id: number; nombre: string };
}
