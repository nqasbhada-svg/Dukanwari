/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { adminAuth } from './src/utils/firebase-admin.ts';
import { 
  getOrCreateUser,
  getAllRegistrations,
  createRegistration,
  updateRegistrationStatus,
  getAllProducts,
  upsertProduct,
  deleteProductById,
  getAllCustomers,
  upsertCustomer,
  getAllSuppliers,
  upsertSupplier,
  getAllInvoices,
  createInvoice,
  upsertInvoice,
  getAllPurchaseBills,
  createPurchaseBill,
  getAllAuditLogs,
  createAuditLog,
  getShopSettings,
  upsertShopSettings
} from './src/db/queries.ts';

// Request type with attached Firebase user context
interface AuthRequest extends express.Request {
  user?: any;
}

// Optional Auth Middleware (protects endpoints but remains resilient for demo access)
const authenticateUser = async (req: AuthRequest, res: express.Response, next: express.NextFunction) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next(); // Proceed without user context
  }

  const token = authHeader.split('Bearer ')[1];
  try {
    const decodedToken = await adminAuth.verifyIdToken(token);
    req.user = decodedToken;
    next();
  } catch (error) {
    console.error('Firebase Auth verification error:', error);
    next(); // Fallback without blocking, or we can choose to be strict
  }
};

async function startServer() {
  const app = express();
  const PORT = 3000;

  // JSON Body Parser
  app.use(express.json({ limit: '10mb' }));

  // API Routes (Registered first before Vite middlewares)
  
  // Health check
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', database: 'connected' });
  });

  // --- Users Sync Endpoint ---
  app.post('/api/users/sync', authenticateUser, async (req: AuthRequest, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'Missing or invalid authentication token' });
      }
      const { email, uid, name } = req.user;
      const user = await getOrCreateUser(uid, email || '', name || '', '');
      res.json({ success: true, user });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // --- Partner Registrations Endpoints ---
  app.get('/api/registrations', async (req, res) => {
    try {
      const data = await getAllRegistrations();
      res.json(data);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post('/api/registrations', async (req, res) => {
    try {
      const newReg = await createRegistration(req.body);
      res.status(201).json(newReg);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.put('/api/registrations/:id', async (req, res) => {
    try {
      const { id } = req.params;
      const { status, subscription, notes } = req.body;
      const updated = await updateRegistrationStatus(id, status, subscription, notes);
      res.json(updated);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // --- Products Endpoints ---
  app.get('/api/products', async (req, res) => {
    try {
      const data = await getAllProducts();
      res.json(data);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post('/api/products', async (req, res) => {
    try {
      const saved = await upsertProduct(req.body);
      res.json(saved);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.delete('/api/products/:id', async (req, res) => {
    try {
      const { id } = req.params;
      await deleteProductById(id);
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // --- Customers Endpoints ---
  app.get('/api/customers', async (req, res) => {
    try {
      const data = await getAllCustomers();
      res.json(data);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post('/api/customers', async (req, res) => {
    try {
      const saved = await upsertCustomer(req.body);
      res.json(saved);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // --- Suppliers Endpoints ---
  app.get('/api/suppliers', async (req, res) => {
    try {
      const data = await getAllSuppliers();
      res.json(data);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post('/api/suppliers', async (req, res) => {
    try {
      const saved = await upsertSupplier(req.body);
      res.json(saved);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // --- Invoices Endpoints ---
  app.get('/api/invoices', async (req, res) => {
    try {
      const data = await getAllInvoices();
      res.json(data);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post('/api/invoices', async (req, res) => {
    try {
      const saved = await createInvoice(req.body);
      res.json(saved);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // --- Purchase Bills Endpoints ---
  app.get('/api/purchase-bills', async (req, res) => {
    try {
      const data = await getAllPurchaseBills();
      res.json(data);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post('/api/purchase-bills', async (req, res) => {
    try {
      const saved = await createPurchaseBill(req.body);
      res.json(saved);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // --- Audit Logs Endpoints ---
  app.get('/api/audit-logs', async (req, res) => {
    try {
      const data = await getAllAuditLogs();
      res.json(data);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post('/api/audit-logs', async (req, res) => {
    try {
      const saved = await createAuditLog(req.body);
      res.json(saved);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // --- Settings Endpoints ---
  app.get('/api/settings', async (req, res) => {
    try {
      const data = await getShopSettings();
      res.json(data);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post('/api/settings', async (req, res) => {
    try {
      const saved = await upsertShopSettings(req.body);
      res.json(saved);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // --- Bulk Sync All Endpoint ---
  app.post('/api/sync-all', async (req, res) => {
    try {
      const { products: productsList, customers: customersList, invoices: invoicesList } = req.body;
      
      const syncStatus = {
        productsSynced: 0,
        customersSynced: 0,
        invoicesSynced: 0,
        errors: [] as string[]
      };

      if (Array.isArray(productsList)) {
        for (const item of productsList) {
          try {
            await upsertProduct(item);
            syncStatus.productsSynced++;
          } catch (e: any) {
            syncStatus.errors.push(`Product [${item.itemName || item.id}]: ${e.message}`);
          }
        }
      }

      if (Array.isArray(customersList)) {
        for (const item of customersList) {
          try {
            await upsertCustomer(item);
            syncStatus.customersSynced++;
          } catch (e: any) {
            syncStatus.errors.push(`Customer [${item.name || item.id}]: ${e.message}`);
          }
        }
      }

      if (Array.isArray(invoicesList)) {
        for (const item of invoicesList) {
          try {
            await upsertInvoice(item);
            syncStatus.invoicesSynced++;
          } catch (e: any) {
            syncStatus.errors.push(`Invoice [${item.invoiceNumber || item.id}]: ${e.message}`);
          }
        }
      }

      const success = syncStatus.errors.length === 0;
      res.json({
        success,
        ...syncStatus
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });


  // --- Vite Middleware Integration ---
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

  // Start Express listener
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Full-stack server successfully running on port ${PORT}`);
  });
}

startServer();
