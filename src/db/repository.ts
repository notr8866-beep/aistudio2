// src/db/repository.ts
import { db } from './index.ts';
import * as schema from './schema.ts';
import { eq, desc } from 'drizzle-orm';
import { Customer, Vendor, Product, Quotation } from '../types.ts';
import { INITIAL_CUSTOMERS, INITIAL_VENDORS, INITIAL_PRODUCTS, INITIAL_QUOTATIONS } from '../data/initialData.ts';

// User Registration Helper (MANDATORY per SKILL.md)
export async function getOrCreateUser(uid: string, email: string) {
  try {
    const result = await db
      .insert(schema.users)
      .values({
        uid,
        email,
      })
      .onConflictDoUpdate({
        target: schema.users.uid,
        set: {
          email,
        },
      })
      .returning();
    return result[0];
  } catch (error) {
    console.error('Failed in getOrCreateUser:', error);
    throw new Error('Database operation failed for user synchronization.', { cause: error });
  }
}

// Customers Repository
export async function getAllCustomers(): Promise<Customer[]> {
  try {
    const rows = await db.select().from(schema.customers).orderBy(desc(schema.customers.createdAt));
    return rows.map((r) => ({
      id: r.id,
      companyName: r.companyName,
      contactPerson: r.contactPerson,
      englishName: r.englishName ?? undefined,
      department: r.department ?? undefined,
      phone: r.phone,
      email: r.email,
      address: r.address,
      paymentTerms: r.paymentTerms ?? undefined,
      notes: r.notes ?? undefined,
      createdAt: r.createdAt,
      updatedAt: r.updatedAt,
    }));
  } catch (error) {
    console.error('Failed to get customers from database:', error);
    throw new Error('Database query failed for customers.', { cause: error });
  }
}

export async function upsertCustomer(customer: Customer): Promise<Customer> {
  try {
    const values = {
      id: customer.id,
      companyName: customer.companyName,
      contactPerson: customer.contactPerson,
      englishName: customer.englishName ?? null,
      department: customer.department ?? null,
      phone: customer.phone,
      email: customer.email,
      address: customer.address,
      paymentTerms: customer.paymentTerms ?? null,
      notes: customer.notes ?? null,
      createdAt: customer.createdAt,
      updatedAt: customer.updatedAt,
    };

    await db
      .insert(schema.customers)
      .values(values)
      .onConflictDoUpdate({
        target: schema.customers.id,
        set: values,
      });

    return customer;
  } catch (error) {
    console.error('Failed to upsert customer:', error);
    throw new Error('Database write failed for customer.', { cause: error });
  }
}

export async function deleteCustomerById(id: string): Promise<boolean> {
  try {
    await db.delete(schema.customers).where(eq(schema.customers.id, id));
    return true;
  } catch (error) {
    console.error('Failed to delete customer:', error);
    throw new Error('Database delete failed for customer.', { cause: error });
  }
}

// Vendors Repository
export async function getAllVendors(): Promise<Vendor[]> {
  try {
    const rows = await db.select().from(schema.vendors).orderBy(desc(schema.vendors.createdAt));
    return rows.map((r) => ({
      id: r.id,
      companyName: r.companyName,
      contactPerson: r.contactPerson,
      englishName: r.englishName ?? undefined,
      department: r.department ?? undefined,
      phone: r.phone,
      email: r.email,
      address: r.address,
      taxId: r.taxId ?? undefined,
      paymentTerms: r.paymentTerms ?? undefined,
      notes: r.notes ?? undefined,
      createdAt: r.createdAt,
      updatedAt: r.updatedAt,
    }));
  } catch (error) {
    console.error('Failed to get vendors from database:', error);
    throw new Error('Database query failed for vendors.', { cause: error });
  }
}

export async function upsertVendor(vendor: Vendor): Promise<Vendor> {
  try {
    const values = {
      id: vendor.id,
      companyName: vendor.companyName,
      contactPerson: vendor.contactPerson,
      englishName: vendor.englishName ?? null,
      department: vendor.department ?? null,
      phone: vendor.phone,
      email: vendor.email,
      address: vendor.address,
      taxId: vendor.taxId ?? null,
      paymentTerms: vendor.paymentTerms ?? null,
      notes: vendor.notes ?? null,
      createdAt: vendor.createdAt,
      updatedAt: vendor.updatedAt,
    };

    await db
      .insert(schema.vendors)
      .values(values)
      .onConflictDoUpdate({
        target: schema.vendors.id,
        set: values,
      });

    return vendor;
  } catch (error) {
    console.error('Failed to upsert vendor:', error);
    throw new Error('Database write failed for vendor.', { cause: error });
  }
}

export async function deleteVendorById(id: string): Promise<boolean> {
  try {
    await db.delete(schema.vendors).where(eq(schema.vendors.id, id));
    return true;
  } catch (error) {
    console.error('Failed to delete vendor:', error);
    throw new Error('Database delete failed for vendor.', { cause: error });
  }
}

// Products Repository
export async function getAllProducts(): Promise<Product[]> {
  try {
    const rows = await db.select().from(schema.products).orderBy(desc(schema.products.createdAt));
    return rows.map((r) => ({
      id: r.id,
      name: r.name,
      cost: Number(r.cost),
      price: Number(r.price),
      image: r.image ?? undefined,
      spec: r.spec ?? undefined,
      stock: Number(r.stock),
      createdAt: r.createdAt,
      updatedAt: r.updatedAt,
    }));
  } catch (error) {
    console.error('Failed to get products from database:', error);
    throw new Error('Database query failed for products.', { cause: error });
  }
}

export async function upsertProduct(product: Product): Promise<Product> {
  try {
    const values = {
      id: product.id,
      name: product.name,
      cost: Math.round(product.cost),
      price: Math.round(product.price),
      image: product.image ?? null,
      spec: product.spec ?? null,
      stock: Math.round(product.stock),
      createdAt: product.createdAt,
      updatedAt: product.updatedAt,
    };

    await db
      .insert(schema.products)
      .values(values)
      .onConflictDoUpdate({
        target: schema.products.id,
        set: values,
      });

    return product;
  } catch (error) {
    console.error('Failed to upsert product:', error);
    throw new Error('Database write failed for product.', { cause: error });
  }
}

export async function deleteProductById(id: string): Promise<boolean> {
  try {
    await db.delete(schema.products).where(eq(schema.products.id, id));
    return true;
  } catch (error) {
    console.error('Failed to delete product:', error);
    throw new Error('Database delete failed for product.', { cause: error });
  }
}

// Quotations Repository
export async function getAllQuotations(): Promise<Quotation[]> {
  try {
    const rows = await db.select().from(schema.quotations).orderBy(desc(schema.quotations.createdAt));
    return rows.map((r) => ({
      id: r.id,
      quoteNumber: r.quoteNumber,
      customerId: r.customerId,
      customerName: r.customerName,
      contactPerson: r.contactPerson,
      contactPhone: r.contactPhone,
      email: r.email ?? undefined,
      address: r.address ?? undefined,
      date: r.date,
      validUntil: r.validUntil,
      items: (r.items as any) ?? [],
      subtotal: Number(r.subtotal),
      taxRate: Number(r.taxRate),
      taxAmount: Number(r.taxAmount),
      totalAmount: Number(r.totalAmount),
      paymentTerms: r.paymentTerms ?? undefined,
      notes: r.notes ?? undefined,
      status: r.status as Quotation['status'],
      createdAt: r.createdAt,
      updatedAt: r.updatedAt,
    }));
  } catch (error) {
    console.error('Failed to get quotations from database:', error);
    throw new Error('Database query failed for quotations.', { cause: error });
  }
}

export async function upsertQuotation(quotation: Quotation): Promise<Quotation> {
  try {
    const values = {
      id: quotation.id,
      quoteNumber: quotation.quoteNumber,
      customerId: quotation.customerId,
      customerName: quotation.customerName,
      contactPerson: quotation.contactPerson,
      contactPhone: quotation.contactPhone,
      email: quotation.email ?? null,
      address: quotation.address ?? null,
      date: quotation.date,
      validUntil: quotation.validUntil,
      items: quotation.items,
      subtotal: Math.round(quotation.subtotal),
      taxRate: quotation.taxRate.toString(),
      taxAmount: Math.round(quotation.taxAmount),
      totalAmount: Math.round(quotation.totalAmount),
      paymentTerms: quotation.paymentTerms ?? null,
      notes: quotation.notes ?? null,
      status: quotation.status,
      createdAt: quotation.createdAt,
      updatedAt: quotation.updatedAt,
    };

    await db
      .insert(schema.quotations)
      .values(values)
      .onConflictDoUpdate({
        target: schema.quotations.id,
        set: values,
      });

    return quotation;
  } catch (error) {
    console.error('Failed to upsert quotation:', error);
    throw new Error('Database write failed for quotation.', { cause: error });
  }
}

export async function deleteQuotationById(id: string): Promise<boolean> {
  try {
    await db.delete(schema.quotations).where(eq(schema.quotations.id, id));
    return true;
  } catch (error) {
    console.error('Failed to delete quotation:', error);
    throw new Error('Database delete failed for quotation.', { cause: error });
  }
}

// Seed initial data if tables are empty
export async function seedInitialDataIfEmpty() {
  try {
    const existingCust = await db.select().from(schema.customers).limit(1);
    if (existingCust.length === 0) {
      console.log('Seeding initial customers to PostgreSQL...');
      for (const c of INITIAL_CUSTOMERS) {
        await upsertCustomer(c);
      }
    }

    const existingVend = await db.select().from(schema.vendors).limit(1);
    if (existingVend.length === 0) {
      console.log('Seeding initial vendors to PostgreSQL...');
      for (const v of INITIAL_VENDORS) {
        await upsertVendor(v);
      }
    }

    const existingProd = await db.select().from(schema.products).limit(1);
    if (existingProd.length === 0) {
      console.log('Seeding initial products to PostgreSQL...');
      for (const p of INITIAL_PRODUCTS) {
        await upsertProduct(p);
      }
    }

    const existingQuote = await db.select().from(schema.quotations).limit(1);
    if (existingQuote.length === 0) {
      console.log('Seeding initial quotations to PostgreSQL...');
      for (const q of INITIAL_QUOTATIONS) {
        await upsertQuotation(q);
      }
    }
  } catch (err) {
    console.warn('Auto-seeding skipped or failed:', err);
  }
}
