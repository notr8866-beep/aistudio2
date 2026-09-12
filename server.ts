// server.ts
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import {
  getAllCustomers,
  upsertCustomer,
  deleteCustomerById,
  getAllVendors,
  upsertVendor,
  deleteVendorById,
  getAllProducts,
  upsertProduct,
  deleteProductById,
  getAllQuotations,
  upsertQuotation,
  deleteQuotationById,
  getOrCreateUser,
  seedInitialDataIfEmpty,
} from './src/db/repository.ts';
import { optionalAuth, requireAuth, AuthRequest } from './src/middleware/auth.ts';
import { INITIAL_CUSTOMERS, INITIAL_VENDORS, INITIAL_PRODUCTS, INITIAL_QUOTATIONS } from './src/data/initialData.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: '10mb' }));

  // Seed default data if database is fresh
  seedInitialDataIfEmpty().catch((err) => {
    console.warn('Initial seeding encountered warning:', err);
  });

  // --- API Routes ---

  // Health and Database Status
  app.get('/api/health', (req, res) => {
    res.json({
      status: 'ok',
      database: 'postgresql',
      host: process.env.SQL_HOST ? 'Cloud SQL / PostgreSQL connected' : 'Local env',
      timestamp: new Date().toISOString(),
    });
  });

  app.get('/api/db/status', async (req, res) => {
    try {
      const customers = await getAllCustomers();
      const vendors = await getAllVendors();
      const products = await getAllProducts();
      const quotations = await getAllQuotations();

      res.json({
        connected: true,
        database: 'PostgreSQL',
        tables: {
          customers: customers.length,
          vendors: vendors.length,
          products: products.length,
          quotations: quotations.length,
        },
      });
    } catch (err: any) {
      res.status(500).json({
        connected: false,
        error: err.message || 'Database status check failed',
      });
    }
  });

  // Auth User Sync
  app.post('/api/auth/sync', optionalAuth, async (req: AuthRequest, res) => {
    try {
      const { uid, email } = req.body;
      if (!uid || !email) {
        return res.status(400).json({ error: 'uid and email are required' });
      }
      const user = await getOrCreateUser(uid, email);
      res.json({ success: true, user });
    } catch (err: any) {
      console.error('Failed to sync auth user:', err);
      res.status(500).json({ error: err.message || 'Failed to sync user' });
    }
  });

  // Customers
  app.get('/api/customers', async (req, res) => {
    try {
      const data = await getAllCustomers();
      res.json(data);
    } catch (err: any) {
      res.status(500).json({ error: err.message || 'Failed to fetch customers' });
    }
  });

  app.post('/api/customers', async (req, res) => {
    try {
      const customer = await upsertCustomer(req.body);
      res.json(customer);
    } catch (err: any) {
      res.status(500).json({ error: err.message || 'Failed to save customer' });
    }
  });

  app.delete('/api/customers/:id', async (req, res) => {
    try {
      await deleteCustomerById(req.params.id);
      res.json({ success: true, id: req.params.id });
    } catch (err: any) {
      res.status(500).json({ error: err.message || 'Failed to delete customer' });
    }
  });

  // Vendors
  app.get('/api/vendors', async (req, res) => {
    try {
      const data = await getAllVendors();
      res.json(data);
    } catch (err: any) {
      res.status(500).json({ error: err.message || 'Failed to fetch vendors' });
    }
  });

  app.post('/api/vendors', async (req, res) => {
    try {
      const vendor = await upsertVendor(req.body);
      res.json(vendor);
    } catch (err: any) {
      res.status(500).json({ error: err.message || 'Failed to save vendor' });
    }
  });

  app.delete('/api/vendors/:id', async (req, res) => {
    try {
      await deleteVendorById(req.params.id);
      res.json({ success: true, id: req.params.id });
    } catch (err: any) {
      res.status(500).json({ error: err.message || 'Failed to delete vendor' });
    }
  });

  // Products
  app.get('/api/products', async (req, res) => {
    try {
      const data = await getAllProducts();
      res.json(data);
    } catch (err: any) {
      res.status(500).json({ error: err.message || 'Failed to fetch products' });
    }
  });

  app.post('/api/products', async (req, res) => {
    try {
      const product = await upsertProduct(req.body);
      res.json(product);
    } catch (err: any) {
      res.status(500).json({ error: err.message || 'Failed to save product' });
    }
  });

  app.delete('/api/products/:id', async (req, res) => {
    try {
      await deleteProductById(req.params.id);
      res.json({ success: true, id: req.params.id });
    } catch (err: any) {
      res.status(500).json({ error: err.message || 'Failed to delete product' });
    }
  });

  // Quotations
  app.get('/api/quotations', async (req, res) => {
    try {
      const data = await getAllQuotations();
      res.json(data);
    } catch (err: any) {
      res.status(500).json({ error: err.message || 'Failed to fetch quotations' });
    }
  });

  app.post('/api/quotations', async (req, res) => {
    try {
      const quotation = await upsertQuotation(req.body);
      res.json(quotation);
    } catch (err: any) {
      res.status(500).json({ error: err.message || 'Failed to save quotation' });
    }
  });

  app.delete('/api/quotations/:id', async (req, res) => {
    try {
      await deleteQuotationById(req.params.id);
      res.json({ success: true, id: req.params.id });
    } catch (err: any) {
      res.status(500).json({ error: err.message || 'Failed to delete quotation' });
    }
  });

  // Reset database to initial demo values
  app.post('/api/reset', async (req, res) => {
    try {
      for (const c of INITIAL_CUSTOMERS) await upsertCustomer(c);
      for (const v of INITIAL_VENDORS) await upsertVendor(v);
      for (const p of INITIAL_PRODUCTS) await upsertProduct(p);
      for (const q of INITIAL_QUOTATIONS) await upsertQuotation(q);
      res.json({ success: true, message: 'Database reset to initial demo data' });
    } catch (err: any) {
      res.status(500).json({ error: err.message || 'Failed to reset database' });
    }
  });

  // --- Vite Middleware for Development / Static for Production ---
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://0.0.0.0:${PORT} with PostgreSQL`);
  });
}

startServer();
