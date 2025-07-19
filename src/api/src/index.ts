import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { authRoutes } from './routes/auth';
import { listingsRoutes } from './routes/listings';
import { applicationsRoutes } from './routes/applications';
import { contractsRoutes } from './routes/contracts';
import { ipfsRoutes } from './routes/ipfs';
import { transactionRoutes } from './routes/transactions';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// 中間件
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// 路由
app.use('/api/auth', authRoutes);
app.use('/api/listings', listingsRoutes);
app.use('/api/applications', applicationsRoutes);
app.use('/api/contracts', contractsRoutes);
app.use('/api/ipfs', ipfsRoutes);
app.use('/api/transactions', transactionRoutes);

// 健康檢查
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// API 路由列表
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

// 錯誤處理
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('API 錯誤:', err);
  res.status(500).json({
    success: false,
    error: '內部伺服器錯誤'
  });
});

// 404 處理
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