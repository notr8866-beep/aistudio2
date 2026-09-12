import { Customer, Vendor, Product, Quotation } from '../types';
import { INITIAL_CUSTOMERS, INITIAL_VENDORS, INITIAL_PRODUCTS, INITIAL_QUOTATIONS } from '../data/initialData';

const CUSTOMERS_KEY = 'qms_customers_v1';
const VENDORS_KEY = 'qms_vendors_v1';
const PRODUCTS_KEY = 'qms_products_v1';
const QUOTATIONS_KEY = 'qms_quotations_v1';

export const storage = {
  getCustomers: (): Customer[] => {
    try {
      const data = localStorage.getItem(CUSTOMERS_KEY);
      return data ? JSON.parse(data) : INITIAL_CUSTOMERS;
    } catch (e) {
      console.error('Error reading customers from localStorage', e);
      return INITIAL_CUSTOMERS;
    }
  },
  saveCustomers: (customers: Customer[]) => {
    try {
      localStorage.setItem(CUSTOMERS_KEY, JSON.stringify(customers));
    } catch (e) {
      console.error('Error saving customers to localStorage', e);
    }
  },

  getVendors: (): Vendor[] => {
    try {
      const data = localStorage.getItem(VENDORS_KEY);
      return data ? JSON.parse(data) : INITIAL_VENDORS;
    } catch (e) {
      console.error('Error reading vendors from localStorage', e);
      return INITIAL_VENDORS;
    }
  },
  saveVendors: (vendors: Vendor[]) => {
    try {
      localStorage.setItem(VENDORS_KEY, JSON.stringify(vendors));
    } catch (e) {
      console.error('Error saving vendors to localStorage', e);
    }
  },

  getProducts: (): Product[] => {
    try {
      const data = localStorage.getItem(PRODUCTS_KEY);
      return data ? JSON.parse(data) : INITIAL_PRODUCTS;
    } catch (e) {
      console.error('Error reading products from localStorage', e);
      return INITIAL_PRODUCTS;
    }
  },
  saveProducts: (products: Product[]) => {
    try {
      localStorage.setItem(PRODUCTS_KEY, JSON.stringify(products));
    } catch (e) {
      console.error('Error saving products to localStorage', e);
    }
  },

  getQuotations: (): Quotation[] => {
    try {
      const data = localStorage.getItem(QUOTATIONS_KEY);
      return data ? JSON.parse(data) : INITIAL_QUOTATIONS;
    } catch (e) {
      console.error('Error reading quotations from localStorage', e);
      return INITIAL_QUOTATIONS;
    }
  },
  saveQuotations: (quotations: Quotation[]) => {
    try {
      localStorage.setItem(QUOTATIONS_KEY, JSON.stringify(quotations));
    } catch (e) {
      console.error('Error saving quotations to localStorage', e);
    }
  },

  resetAllToDefault: () => {
    localStorage.setItem(CUSTOMERS_KEY, JSON.stringify(INITIAL_CUSTOMERS));
    localStorage.setItem(VENDORS_KEY, JSON.stringify(INITIAL_VENDORS));
    localStorage.setItem(PRODUCTS_KEY, JSON.stringify(INITIAL_PRODUCTS));
    localStorage.setItem(QUOTATIONS_KEY, JSON.stringify(INITIAL_QUOTATIONS));
  },

  exportBackup: (): string => {
    const backup = {
      version: '1.0',
      exportedAt: new Date().toISOString(),
      customers: storage.getCustomers(),
      vendors: storage.getVendors(),
      products: storage.getProducts(),
      quotations: storage.getQuotations(),
    };
    return JSON.stringify(backup, null, 2);
  },

  importBackup: (jsonString: string): boolean => {
    try {
      const data = JSON.parse(jsonString);
      if (Array.isArray(data.customers)) {
        storage.saveCustomers(data.customers);
      }
      if (Array.isArray(data.vendors)) {
        storage.saveVendors(data.vendors);
      }
      if (Array.isArray(data.products)) {
        storage.saveProducts(data.products);
      }
      if (Array.isArray(data.quotations)) {
        storage.saveQuotations(data.quotations);
      }
      return true;
    } catch (err) {
      console.error('Failed to import backup data', err);
      return false;
    }
  }
};
