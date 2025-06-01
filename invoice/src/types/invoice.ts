import { Client } from './client';
import { Product } from './product';

export interface InvoiceItemDTO {
  productId: number;
  quantity: number;
}

export interface InvoiceItem {
  id: number;
  productId: number;
  productName: string;
  description: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export interface Invoice {
  id: number;
  invoiceNumber: string;
  totalAmount: number;
  issueDate: string;
  dueDate: string;
  status: 'PENDING' | 'PAID' | 'OVERDUE';
  paymentTerms: 'MONTHLY' | 'WEEKLY';
  isRecurring: boolean;
  nextRecurringDate: string | null;

  clientId: number;
  clientName: string;
  clientEmail: string;
  clientPhoneNumber: string;
  clientAddress: string;

  items: InvoiceItem[];
}
