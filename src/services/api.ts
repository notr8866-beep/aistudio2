// src/services/api.ts
import { Customer, Vendor, Product, Quotation } from '../types.ts';
import { storage } from '../utils/storage.ts';

export interface DbStatusResponse {
  connected: boolean;
  database: string;
  tables?: {
    customers: number;
    vendors: number;
    products: number;
    quotations: number;
  };
  error?: string;
}

export const apiService = {
  // Check Cloud SQL / Neon PostgreSQL status
  async checkStatus(): Promise<DbStatusResponse> {
    try {
      const res = await fetch('/api/db/status');
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return await res.json();
    } catch (err: any) {
      return {
        connected: false,
        database: 'LocalStorage (離線模式)',
        error: err.message,
      };
    }
  },

  // Sync Firebase authenticated user
  async syncUser(uid: string, email: string) {
    try {
      const res = await fetch('/api/auth/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ uid, email }),
      });
      return await res.json();
    } catch (err) {
      console.warn('User sync skipped or failed:', err);
    }
  },

  // Customers
  async getCustomers(): Promise<Customer[]> {
    try {
      const res = await fetch('/api/customers');
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          storage.saveCustomers(data);
          return data;
        }
      }
    } catch (err) {
      console.warn('Fetch customers from API failed, falling back to storage:', err);
    }
    return storage.getCustomers();
  },

  async saveCustomer(customer: Customer): Promise<Customer> {
    // Optimistic local update
    try {
      const res = await fetch('/api/customers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(customer),
      });
      if (res.ok) {
        return await res.json();
      }
    } catch (err) {
      console.warn('API saveCustomer failed, saved locally:', err);
    }
    return customer;
  },

  async deleteCustomer(id: string): Promise<void> {
    try {
      await fetch(`/api/customers/${id}`, { method: 'DELETE' });
    } catch (err) {
      console.warn('API deleteCustomer failed:', err);
    }
  },

  // Vendors
  async getVendors(): Promise<Vendor[]> {
    try {
      const res = await fetch('/api/vendors');
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          storage.saveVendors(data);
          return data;
        }
      }
    } catch (err) {
      console.warn('Fetch vendors from API failed, falling back to storage:', err);
    }
    return storage.getVendors();
  },

  async saveVendor(vendor: Vendor): Promise<Vendor> {
    try {
      const res = await fetch('/api/vendors', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(vendor),
      });
      if (res.ok) {
        return await res.json();
      }
    } catch (err) {
      console.warn('API saveVendor failed, saved locally:', err);
    }
    return vendor;
  },

  async deleteVendor(id: string): Promise<void> {
    try {
      await fetch(`/api/vendors/${id}`, { method: 'DELETE' });
    } catch (err) {
      console.warn('API deleteVendor failed:', err);
    }
  },

  // Products
  async getProducts(): Promise<Product[]> {
    try {
      const res = await fetch('/api/products');
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          storage.saveProducts(data);
          return data;
        }
      }
    } catch (err) {
      console.warn('Fetch products from API failed, falling back to storage:', err);
    }
    return storage.getProducts();
  },

  async saveProduct(product: Product): Promise<Product> {
    try {
      const res = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(product),
      });
      if (res.ok) {
        return await res.json();
      }
    } catch (err) {
      console.warn('API saveProduct failed, saved locally:', err);
    }
    return product;
  },

  async deleteProduct(id: string): Promise<void> {
    try {
      await fetch(`/api/products/${id}`, { method: 'DELETE' });
    } catch (err) {
      console.warn('API deleteProduct failed:', err);
    }
  },

  // Quotations
  async getQuotations(): Promise<Quotation[]> {
    try {
      const res = await fetch('/api/quotations');
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          storage.saveQuotations(data);
          return data;
        }
      }
    } catch (err) {
      console.warn('Fetch quotations from API failed, falling back to storage:', err);
    }
    return storage.getQuotations();
  },

  async saveQuotation(quotation: Quotation): Promise<Quotation> {
    try {
      const res = await fetch('/api/quotations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(quotation),
      });
      if (res.ok) {
        return await res.json();
      }
    } catch (err) {
      console.warn('API saveQuotation failed, saved locally:', err);
    }
    return quotation;
  },

  async deleteQuotation(id: string): Promise<void> {
    try {
      await fetch(`/api/quotations/${id}`, { method: 'DELETE' });
    } catch (err) {
      console.warn('API deleteQuotation failed:', err);
    }
  },

  // Reset database to initial values
  async resetAll(): Promise<void> {
    try {
      await fetch('/api/reset', { method: 'POST' });
    } catch (err) {
      console.warn('API reset failed:', err);
    }
    storage.resetAllToDefault();
  },
};
