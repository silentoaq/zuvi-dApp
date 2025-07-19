import { Router } from 'express';
import { PublicKey } from '@solana/web3.js';
import { TwattestVerifier } from '../../twattest-sdk/node.js';

const router = Router();
const twattestVerifier = new TwattestVerifier({
  baseUrl: process.env.TWATTEST_API_URL || 'https://twattest.ddns.net/api',
  apiSecret: process.env.TWATTEST_API_SECRET || 'your-api-secret'
});

// 檢查用戶權限
router.get('/permissions/:userDid', async (req, res) => {
  try {
    const { userDid } = req.params;
    
    // 驗證 DID 格式 (should be Solana address)
    try {
      new PublicKey(userDid);
    } catch {
      return res.status(400).json({ error: '無效的用戶 DID' });
    }

    const permissions = await twattestVerifier.checkUserPermissions(userDid);
    
    res.json({
      success: true,
      data: {
        hasCitizenCredential: permissions.hasCitizenCredential,
        hasPropertyCredential: permissions.hasPropertyCredential,
        propertyCount: permissions.propertyCount,
        canListProperty: permissions.hasPropertyCredential,
        canApplyForRental: permissions.hasCitizenCredential
      }
    });
  } catch (error) {
    console.error('權限檢查失敗:', error);
    res.status(500).json({ 
      success: false, 
      error: '權限檢查失敗' 
    });
  }
});

// 取得用戶詳細 attestation 狀態
router.get('/attestation/:userDid', async (req, res) => {
  try {
    const { userDid } = req.params;
    
    // 直接調用 twattest API 取得 attestation 狀態
    const response = await fetch(`${process.env.TWATTEST_API_URL}/attestation/status/${userDid}`);
    
    if (!response.ok) {
      throw new Error('無法取得 attestation 狀態');
    }
    
    const attestationData = await response.json();
    
    res.json({
      success: true,
      data: attestationData
    });
  } catch (error) {
    console.error('Attestation 查詢失敗:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Attestation 查詢失敗' 
    });
  }
});

// 驗證用戶身份
router.post('/verify', async (req, res) => {
  try {
    const { userDid, signature } = req.body;
    
    if (!userDid || !signature) {
      return res.status(400).json({ error: '缺少必要參數' });
    }

    // 這裡可以加入簽名驗證邏輯
    // 簡化版本直接檢查權限
    const permissions = await twattestVerifier.checkUserPermissions(userDid);
    
    res.json({
      success: true,
      data: {
        verified: true,
        userDid,
        permissions
      }
    });
  } catch (error) {
    console.error('身份驗證失敗:', error);
    res.status(500).json({ 
      success: false, 
      error: '身份驗證失敗' 
    });
  }
});

export { router as authRoutes };