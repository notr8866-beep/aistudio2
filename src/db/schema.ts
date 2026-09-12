import { integer, jsonb, numeric, pgTable, serial, text, timestamp } from 'drizzle-orm/pg-core';
import { QuoteItem } from '../types.ts';

// Users table (mandatory for Cloud SQL + Firebase Auth mapping)
export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  uid: text('uid').notNull().unique(), // Firebase Auth UID
  email: text('email').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
});

// Customers table (客戶管理)
export const customers = pgTable('customers', {
  id: text('id').primaryKey(),
  companyName: text('company_name').notNull(),
  contactPerson: text('contact_person').notNull(),
  englishName: text('english_name'),
  department: text('department'),
  phone: text('phone').notNull(),
  email: text('email').notNull(),
  address: text('address').notNull(),
  paymentTerms: text('payment_terms'),
  notes: text('notes'),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
});

// Vendors table (廠商管理)
export const vendors = pgTable('vendors', {
  id: text('id').primaryKey(),
  companyName: text('company_name').notNull(),
  contactPerson: text('contact_person').notNull(),
  englishName: text('english_name'),
  department: text('department'),
  phone: text('phone').notNull(),
  email: text('email').notNull(),
  address: text('address').notNull(),
  taxId: text('tax_id'),
  paymentTerms: text('payment_terms'),
  notes: text('notes'),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
});

// Products table (產品管理)
export const products = pgTable('products', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  cost: integer('cost').notNull(),
  price: integer('price').notNull(),
  image: text('image'),
  spec: text('spec'),
  stock: integer('stock').notNull().default(0),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
});

// Quotations table (報價單管理)
export const quotations = pgTable('quotations', {
  id: text('id').primaryKey(),
  quoteNumber: text('quote_number').notNull(),
  customerId: text('customer_id').notNull(),
  customerName: text('customer_name').notNull(),
  contactPerson: text('contact_person').notNull(),
  contactPhone: text('contact_phone').notNull(),
  email: text('email'),
  address: text('address'),
  date: text('date').notNull(),
  validUntil: text('valid_until').notNull(),
  items: jsonb('items').$type<QuoteItem[]>().notNull(),
  subtotal: integer('subtotal').notNull(),
  taxRate: numeric('tax_rate').notNull().default('0.05'),
  taxAmount: integer('tax_amount').notNull(),
  totalAmount: integer('total_amount').notNull(),
  paymentTerms: text('payment_terms'),
  notes: text('notes'),
  status: text('status').notNull().default('draft'),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
});
