import { Router } from 'express';
import { PublicKey } from '@solana/web3.js';
import { solanaService } from '../services/solana';

const router = Router();

// 取得用戶的所有申請
router.get('/user/:userDid', async (req, res) => {
  try {
    const { userDid } = req.params;
    
    const userPubkey = new PublicKey(userDid);
    const applications = await solanaService.getUserApplications(userPubkey);

    // 取得每個申請對應的房源資料
    const applicationsWithListings = await Promise.all(
      applications.map(async (app) => {
        try {
          const listingData = await solanaService.getAccountData(app.listing);
          return {
            ...app,
            listingData,
            createdAt: new Date(app.createdAt * 1000).toISOString(),
            updatedAt: new Date(app.updatedAt * 1000).toISOString()
          };
        } catch (error) {
          console.warn('無法取得房源資料:', app.listing);
          return {
            ...app,
            listingData: null,
            createdAt: new Date(app.createdAt * 1000).toISOString(),
            updatedAt: new Date(app.updatedAt * 1000).toISOString()
          };
        }
      })
    );

    res.json({
      success: true,
      data: applicationsWithListings
    });
  } catch (error) {
    console.error('取得用戶申請失敗:', error);
    res.status(500).json({ 
      success: false, 
      error: '取得用戶申請失敗' 
    });
  }
});

// 準備提交租房申請
router.post('/prepare', async (req, res) => {
  try {
    const {
      propertyId,
      applicantDid,
      applicantAttestation,
      proposedTerms
    } = req.body;

    if (!propertyId || !applicantDid || !applicantAttestation || !proposedTerms) {
      return res.status(400).json({ error: '缺少必要欄位' });
    }

    const [listingPDA] = solanaService.getListingPDA(propertyId);
    const applicantPubkey = new PublicKey(applicantDid);
    const [applicationPDA] = solanaService.getApplicationPDA(listingPDA, applicantPubkey);

    res.json({
      success: true,
      data: {
        listingPDA: listingPDA.toString(),
        applicationPDA: applicationPDA.toString(),
        transactionData: {
          applicantAttestation,
          proposedTerms: JSON.stringify(proposedTerms)
        }
      }
    });
  } catch (error) {
    console.error('準備申請失敗:', error);
    res.status(500).json({ 
      success: false, 
      error: '準備申請失敗' 
    });
  }
});

// 準備接受申請
router.post('/:applicationId/accept/prepare', async (req, res) => {
  try {
    const { applicationId } = req.params;
    const { ownerDid } = req.body;

    if (!ownerDid) {
      return res.status(400).json({ error: '缺少擁有者 DID' });
    }

    const applicationPubkey = new PublicKey(applicationId);
    const applicationData = await solanaService.getAccountData(applicationPubkey);
    
    if (!applicationData) {
      return res.status(404).json({ error: '申請不存在' });
    }

    res.json({
      success: true,
      data: {
        listingPDA: applicationData.listing.toString(),
        applicationPDA: applicationId,
        transactionData: {}
      }
    });
  } catch (error) {
    console.error('準備接受申請失敗:', error);
    res.status(500).json({ 
      success: false, 
      error: '準備接受申請失敗' 
    });
  }
});

// 準備拒絕申請
router.post('/:applicationId/reject/prepare', async (req, res) => {
  try {
    const { applicationId } = req.params;
    const { ownerDid } = req.body;

    if (!ownerDid) {
      return res.status(400).json({ error: '缺少擁有者 DID' });
    }

    const applicationPubkey = new PublicKey(applicationId);
    const applicationData = await solanaService.getAccountData(applicationPubkey);
    
    if (!applicationData) {
      return res.status(404).json({ error: '申請不存在' });
    }

    res.json({
      success: true,
      data: {
        listingPDA: applicationData.listing.toString(),
        applicationPDA: applicationId,
        transactionData: {}
      }
    });
  } catch (error) {
    console.error('準備拒絕申請失敗:', error);
    res.status(500).json({ 
      success: false, 
      error: '準備拒絕申請失敗' 
    });
  }
});

// 取得房源的所有申請（房東用）
router.get('/listing/:propertyId', async (req, res) => {
  try {
    const { propertyId } = req.params;
    
    const [listingPDA] = solanaService.getListingPDA(propertyId);
    
    // 簡化實現：返回空陣列
    // 完整實現需要掃描所有申請帳戶
    res.json({
      success: true,
      data: []
    });
  } catch (error) {
    console.error('取得申請列表失敗:', error);
    res.status(500).json({ 
      success: false, 
      error: '取得申請列表失敗' 
    });
  }
});

export { router as applicationsRoutes };