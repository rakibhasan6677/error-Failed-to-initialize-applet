export interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  location: string;
  status: string;
  username?: string;
}

export interface Product {
  id: number;
  name: string;
  sku: string;
  category: string;
  price: number;
  purchasePrice: number;
  stock: number;
  location: string;
  status: string;
  supplier: string;
  company: string;
}
