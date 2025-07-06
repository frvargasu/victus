export interface Producto {
  id?: number;
  nombre: string;
  precio: number;
  imagen?: string;
  cantidad?: number;
  descripcion?: string;
  categoria?: string;
  rating?: number;
  isFavorite?: boolean;
  disponible?: boolean;
  fechaCreacion?: Date;
}

export interface ProductoAPI {
  id: number;
  title: string;
  price: number;
  description: string;
  category: string;
  image: string;
  rating: {
    rate: number;
    count: number;
  };
}