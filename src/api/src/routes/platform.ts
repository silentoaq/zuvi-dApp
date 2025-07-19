import { Router } from 'express';
import { PublicKey } from '@solana/web3.js';
import { getSolanaService } from '../services/solana.js';

const router = Router();

// 平台初始化
router.post('/initialize', async (req, res) => {
  try {
    const {
      authorityDid,
      feeReceiverDid,
      listingFee,
      contractFee,
      paymentFee
    } = req.body;

    if (!authorityDid || !feeReceiverDid || !listingFee || !contractFee || !paymentFee) {
      return res.status(400).json({ error: '缺少必要欄位' });
    }

    const solanaService = getSolanaService();
    const [platformPDA] = solanaService.getPlatformPDA();

    res.json({
      success: true,
      data: {
        platformPDA: platformPDA.toString(),
        transactionData: {
          listingFee: parseInt(listingFee),
          contractFee: parseInt(contractFee),
          paymentFee: parseInt(paymentFee)
        }
      }
    });
  } catch (error) {
    console.error('準備平台初始化失敗:', error);
    res.status(500).json({ 
      success: false, 
      error: '準備平台初始化失敗' 
    });
  }
});

// 取得平台資訊
router.get('/info', async (req, res) => {
  try {
    const solanaService = getSolanaService();
    const [platformPDA] = solanaService.getPlatformPDA();
    const platformData = await solanaService.getAccountData(platformPDA);

    if (!platformData) {
      return res.status(404).json({ 
        success: false, 
        error: '平台尚未初始化' 
      });
    }

    res.json({
      success: true,
      data: {
        pubkey: platformPDA.toString(),
        ...platformData,
        listingFee: platformData.listingFee.toString(),
        contractFee: platformData.contractFee.toString(),
        paymentFee: platformData.paymentFee.toString()
      }
    });
  } catch (error) {
    console.error('取得平台資訊失敗:', error);
    res.status(500).json({ 
      success: false, 
      error: '取得平台資訊失敗' 
    });
  }
});

// 提取平台費用
router.post('/withdraw-fees', async (req, res) => {
  try {
    const { authorityDid, amount } = req.body;

    if (!authorityDid || !amount) {
      return res.status(400).json({ error: '缺少必要欄位' });
    }

    const solanaService = getSolanaService();
    const [platformPDA] = solanaService.getPlatformPDA();

    res.json({
      success: true,
      data: {
        platformPDA: platformPDA.toString(),
        transactionData: {
          amount: parseInt(amount)
        }
      }
    });
  } catch (error) {
    console.error('準備提取費用失敗:', error);
    res.status(500).json({ 
      success: false, 
      error: '準備提取費用失敗' 
    });
  }
});

export { router as platformRoutes };