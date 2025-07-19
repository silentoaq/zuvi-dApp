import dotenv from 'dotenv';
import { existsSync } from 'fs';
import path from 'path';

const envPath = path.resolve(process.cwd(), '.env');

const result = dotenv.config({ path: envPath });
if (result.error) {
  console.error('Environment variables loading failed:', result.error);
  process.exit(1);
}

if (!existsSync(envPath)) {
  console.error('.env file not found');
  process.exit(1);
}

import express from 'express';
import cors from 'cors';
import { authRoutes } from './routes/auth.js';
import { listingsRoutes } from './routes/listings.js';
import { applicationsRoutes } from './routes/applications.js';
import { contractsRoutes } from './routes/contracts.js';
import { ipfsRoutes } from './routes/ipfs.js';
import { transactionRoutes } from './routes/transactions.js';

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

app.use('/api/auth', authRoutes);
app.use('/api/listings', listingsRoutes);
app.use('/api/applications', applicationsRoutes);
app.use('/api/contracts', contractsRoutes);
app.use('/api/ipfs', ipfsRoutes);
app.use('/api/transactions', transactionRoutes);

app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

app.get('/api', (req, res) => {
  res.json({
    message: 'Zuvi API Server',
    version: '1.0.0',
    routes: {
      auth: '/api/auth',
      listings: '/api/listings',
      applications: '/api/applications',
      contracts: '/api/contracts',
      ipfs: '/api/ipfs',
      transactions: '/api/transactions'
    }
  });
});

app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('API 錯誤:', err);
  res.status(500).json({
    success: false,
    error: '內部伺服器錯誤'
  });
});

app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    error: '路由不存在'
  });
});

app.listen(PORT, () => {
  console.log(`Zuvi API 服務器運行在 http://localhost:${PORT}`);
  console.log(`API 文檔: http://localhost:${PORT}/api`);
});