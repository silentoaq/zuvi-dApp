import { Router } from 'express';
import { PublicKey } from '@solana/web3.js';
import { getSolanaService } from '../services/solana.js';
import { ipfsService } from '../services/ipfs.js';

const router = Router();

// 準備發起爭議
router.post('/prepare', async (req, res) => {
  try {
    const { contractId, reason, evidenceHash } = req.body;

    if (!contractId || !reason || !evidenceHash) {
      return res.status(400).json({ 
        success: false,
        error: '缺少必要參數' 
      });
    }

    // 驗證 reason 長度
    if (reason.length > 256) {
      return res.status(400).json({ 
        success: false,
        error: '原因描述超過長度限制（256字）' 
      });
    }

    // 驗證 evidenceHash 長度
    if (evidenceHash.length > 64) {
      return res.status(400).json({ 
        success: false,
        error: '證據雜湊超過長度限制（64字）' 
      });
    }

    const contractPubkey = new PublicKey(contractId);
    const solanaService = getSolanaService();
    
    // 驗證合約存在
    const contractData = await solanaService.getAccountData(contractPubkey);
    if (!contractData) {
      return res.status(404).json({ 
        success: false,
        error: '合約不存在' 
      });
    }

    res.json({
      success: true,
      data: {
        contractPDA: contractId,
        transactionData: {
          reason,
          evidenceHash
        }
      }
    });
  } catch (error) {
    console.error('準備發起爭議失敗:', error);
    res.status(500).json({ 
      success: false, 
      error: '準備發起爭議失敗' 
    });
  }
});

// 準備回應爭議
router.post('/:disputeId/respond/prepare', async (req, res) => {
  try {
    const { disputeId } = req.params;
    const { responseEvidenceHash } = req.body;

    if (!responseEvidenceHash) {
      return res.status(400).json({ 
        success: false,
        error: '缺少回應證據雜湊' 
      });
    }

    // 驗證 responseEvidenceHash 長度
    if (responseEvidenceHash.length > 64) {
      return res.status(400).json({ 
        success: false,
        error: '證據雜湊超過長度限制（64字）' 
      });
    }

    const disputePubkey = new PublicKey(disputeId);
    const solanaService = getSolanaService();
    
    // 驗證爭議存在
    const disputeData = await solanaService.getAccountData(disputePubkey);
    if (!disputeData) {
      return res.status(404).json({ 
        success: false,
        error: '爭議不存在' 
      });
    }

    res.json({
      success: true,
      data: {
        disputePDA: disputeId,
        transactionData: {
          responseEvidenceHash
        }
      }
    });
  } catch (error) {
    console.error('準備回應爭議失敗:', error);
    res.status(500).json({ 
      success: false, 
      error: '準備回應爭議失敗' 
    });
  }
});

// 取得合約的爭議列表
router.get('/contract/:contractId', async (req, res) => {
  try {
    const { contractId } = req.params;
    const contractPubkey = new PublicKey(contractId);
    
    const solanaService = getSolanaService();
    
    // 驗證合約存在
    const contractData = await solanaService.getAccountData(contractPubkey);
    if (!contractData) {
      return res.status(404).json({ 
        success: false,
        error: '合約不存在' 
      });
    }

    // TODO: 實作取得爭議列表邏輯
    // 目前先返回空陣列
    res.json({
      success: true,
      data: []
    });
  } catch (error) {
    console.error('取得合約爭議列表失敗:', error);
    res.status(500).json({ 
      success: false, 
      error: '取得合約爭議列表失敗' 
    });
  }
});

// 取得單一爭議詳情
router.get('/:disputeId', async (req, res) => {
  try {
    const { disputeId } = req.params;
    const disputePubkey = new PublicKey(disputeId);
    
    const solanaService = getSolanaService();
    const disputeData = await solanaService.getAccountData(disputePubkey);
    
    if (!disputeData) {
      return res.status(404).json({ 
        success: false,
        error: '爭議不存在' 
      });
    }

    // 嘗試取得證據資料
    let evidenceData = null;
    if (disputeData.evidenceHash) {
      try {
        evidenceData = await ipfsService.getData(disputeData.evidenceHash);
      } catch (error) {
        console.warn('無法取得證據資料:', disputeData.evidenceHash);
      }
    }

    res.json({
      success: true,
      data: {
        ...disputeData,
        evidenceData,
        createdAt: new Date(disputeData.createdAt * 1000).toISOString(),
        updatedAt: new Date(disputeData.updatedAt * 1000).toISOString()
      }
    });
  } catch (error) {
    console.error('取得爭議詳情失敗:', error);
    res.status(500).json({ 
      success: false, 
      error: '取得爭議詳情失敗' 
    });
  }
});

// 取得用戶相關的所有爭議
router.get('/user/:userDid', async (req, res) => {
  try {
    const { userDid } = req.params;
    const userPubkey = new PublicKey(userDid);
    
    // TODO: 實作取得用戶爭議列表邏輯
    // 需要過濾 initiated_by 或 respondent 為該用戶的爭議
    
    res.json({
      success: true,
      data: []
    });
  } catch (error) {
    console.error('取得用戶爭議列表失敗:', error);
    res.status(500).json({ 
      success: false, 
      error: '取得用戶爭議列表失敗' 
    });
  }
});

export { router as disputesRoutes };