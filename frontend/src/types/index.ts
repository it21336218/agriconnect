export type UserRole = 'admin' | 'delivery' | 'user';

export interface User {
  _id: User | null;
  id: string;
  name: string;
  email: string;
  role: UserRole;
  createdAt: string;
}

export interface Review {
  id: string;
  productId: string;
  userId: string;
  userName: string;
  rating: number;
  comment: string;
  createdAt: string;
}

export interface Product {
  id: string;
  _id?: string;
  name: string;
  description: string;
  price: number;
  quantity: number;
  category: string;
  farmerId: string;
  image: string;
  reviews?: Review[];
  averageRating?: number; 
  createdAt: string;
}

export interface Order {
  id: string;
  userId: string;
  products: Array<{
    productId: string;
    quantity: number;
    price: number;
  }>;
  total: number;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  deliveryPersonId?: string;
  createdAt: string;
}