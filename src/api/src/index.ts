import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import { authRoutes } from './routes/auth';
import { listingsRoutes } from './routes/listings';
import { applicationsRoutes } from './routes/applications';
import { contractsRoutes } from './routes/contracts';
import { ipfsRoutes } from './routes/ipfs';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// 中間件
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// 路由
app.use('/api/auth', authRoutes);
app.use('/api/listings', listingsRoutes);
app.use('/api/applications', applicationsRoutes);
app.use('/api/contracts', contractsRoutes);
app.use('/api/ipfs', ipfsRoutes);

// 健康檢查
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`Zuvi API 服務器運行在 http://localhost:${PORT}`);
});