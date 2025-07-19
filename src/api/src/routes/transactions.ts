import { Router } from 'express';
import { PublicKey, Transaction } from '@solana/web3.js';
import { solanaService } from '../services/solana';

const router = Router();

// 代付執行交易
router.post('/execute', async (req, res) => {
  try {
    const { transactionData, userWallet } = req.body;

    if (!transactionData || !userWallet) {
      return res.status(400).json({ error: '缺少交易資料或用戶錢包' });
    }

    // 反序列化交易
    const transaction = Transaction.from(Buffer.from(transactionData, 'base64'));
    const userWalletPubkey = new PublicKey(userWallet);

    // 執行交易（由後端代付 SOL 手續費）
    const signature = await solanaService.executeTransaction(transaction, userWalletPubkey);

    res.json({
      success: true,
      data: {
        signature,
        explorerUrl: `https://explorer.solana.com/tx/${signature}?cluster=devnet`
      }
    });
  } catch (error) {
    console.error('執行交易失敗:', error);
    res.status(500).json({ 
      success: false, 
      error: '執行交易失敗' 
    });
  }
});

// 查詢交易狀態
router.get('/status/:signature', async (req, res) => {
  try {
    const { signature } = req.params;

    // 查詢交易狀態
    const status = await solanaService.connection.getSignatureStatus(signature);

    res.json({
      success: true,
      data: {
        signature,
        status: status.value,
        explorerUrl: `https://explorer.solana.com/tx/${signature}?cluster=devnet`
      }
    });
  } catch (error) {
    console.error('查詢交易狀態失敗:', error);
    res.status(500).json({ 
      success: false, 
      error: '查詢交易狀態失敗' 
    });
  }
});

// 取得最新區塊雜湊
router.get('/latest-blockhash', async (req, res) => {
  try {
    const { blockhash, lastValidBlockHeight } = await solanaService.connection.getLatestBlockhash();

    res.json({
      success: true,
      data: {
        blockhash,
        lastValidBlockHeight
      }
    });
  } catch (error) {
    console.error('取得區塊雜湊失敗:', error);
    res.status(500).json({ 
      success: false, 
      error: '取得區塊雜湊失敗' 
    });
  }
});

// 估算交易費用
router.post('/estimate-fee', async (req, res) => {
  try {
    const { transactionData } = req.body;

    if (!transactionData) {
      return res.status(400).json({ error: '缺少交易資料' });
    }

    // 反序列化交易
    const transaction = Transaction.from(Buffer.from(transactionData, 'base64'));
    
    // 估算費用
    const fee = await solanaService.connection.getFeeForMessage(
      transaction.compileMessage(),
      'confirmed'
    );

    res.json({
      success: true,
      data: {
        fee: fee.value || 0,
        feePaidBy: 'server' // 標示由伺服器代付
      }
    });
  } catch (error) {
    console.error('估算交易費用失敗:', error);
    res.status(500).json({ 
      success: false, 
      error: '估算交易費用失敗' 
    });
  }
});

export { router as transactionRoutes };