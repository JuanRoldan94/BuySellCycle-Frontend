export interface Sucursal {
  id: number;
  nombre: string;
  direccion: string;
  telefono?: string;
  archivado: boolean;

  provincia?: { id: number; nombre: string };
  localidad?: { id: number; nombre: string };
}
