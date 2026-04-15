export interface Dish {
  id: string;
  name: string;
  category: string;
  price: number;
  description: string;
  available: boolean;
  ingredients: { ingredientId: string; amount: number }[];
  prepTime: number; // Время приготовления в минутах
  weight: number; // Вес блюда в граммах
}

export interface Ingredient {
  id: string;
  name: string;
  unit: string;
  quantity: number;
  minStock: number;
  costPrice: number; // Себестоимость за единицу (кг, л, шт)
}

export interface Expense {
  id: string;
  description: string;
  amount: number;
  category: 'inventory' | 'staff' | 'utility' | 'other';
  timestamp: number;
}

export interface OrderItem {
  dishId: string;
  name: string;
  quantity: number;
  price: number;
}

export interface Order {
  id: string;
  orderNumber: string; // Номер чека
  tableNumber: number;
  items: OrderItem[];
  status: 'pending' | 'cooking' | 'ready' | 'completed' | 'cancelled';
  timestamp: number;
  total: number;
  guests: number;
}

export type Role = 'admin' | 'chef' | 'waiter' | 'bartender' | 'tech' | 'other';

export interface Staff {
  id: string;
  name: string;
  position: string;
  role: Role;
  phone: string;
  login: string;
  password?: string;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'order' | 'inventory' | 'status' | 'info' | 'chat';
  timestamp: number;
  read: boolean;
  targetRoles?: Role[];
}

export interface Message {
  id: string;
  senderId: string;
  senderName: string;
  senderRole: Role;
  text: string;
  timestamp: number;
  isBot?: boolean;
}

export interface ChatSession {
  id: string; // userId
  userName: string;
  status: 'bot' | 'operator' | 'tech' | 'closed';
  lastActivity: number;
  rating?: number;
}

export type View = 'dashboard' | 'menu' | 'orders' | 'kitchen' | 'inventory' | 'staff' | 'reports' | 'changelog';
