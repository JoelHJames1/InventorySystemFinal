export interface Client {
  id?: string;
  name: string;
  phone: string;
  email: string;
  address: string;
}

export interface Product {
  id?: string;
  name: string;
  code: string;
  description: string;
  price: number;
  quantity: number;
}

export interface Sale {
  id?: string;
  date: Date;
  clientId: string;
  products: {
    productId: string;
    quantity: number;
    pricePerUnit: number;
  }[];
  total: number;
  invoiceNumber: string;
}