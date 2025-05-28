import { Client } from './client';
import { Product } from './product';

export interface InvoiceItemDTO {
  productId: number;
  quantity: number;
}

export interface InvoiceItem {
  id: number;
  product: Product;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export interface Invoice {
  id: number;
  invoiceNumber: string;
  issueDate: string;
  dueDate: string;
  status: 'PENDING' | 'PAID' | 'OVERDUE';
  paymentTerms: 'MONTHLY' | 'WEEKLY';
  isRecurring: boolean;
  totalAmount: number;
  client: Client;
  items: InvoiceItem[];
}
