import { Router } from 'express';
import { PublicKey } from '@solana/web3.js';
import { getSolanaService } from '../services/solana.js';

const router = Router();

router.get('/user/:userDid', async (req, res) => {
  try {
    const { userDid } = req.params;
    
    const userPubkey = new PublicKey(userDid);
    const solanaService = getSolanaService();
    const applications = await solanaService.getUserApplications(userPubkey);

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

    const solanaService = getSolanaService();
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

router.post('/:applicationId/accept/prepare', async (req, res) => {
  try {
    const { applicationId } = req.params;
    const { ownerDid } = req.body;

    if (!ownerDid) {
      return res.status(400).json({ error: '缺少擁有者 DID' });
    }

    const applicationPubkey = new PublicKey(applicationId);
    const solanaService = getSolanaService();
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

router.post('/:applicationId/reject/prepare', async (req, res) => {
  try {
    const { applicationId } = req.params;
    const { ownerDid } = req.body;

    if (!ownerDid) {
      return res.status(400).json({ error: '缺少擁有者 DID' });
    }

    const applicationPubkey = new PublicKey(applicationId);
    const solanaService = getSolanaService();
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

router.get('/listing/:propertyId', async (req, res) => {
  try {
    const { propertyId } = req.params;
    
    const solanaService = getSolanaService();
    const [listingPDA] = solanaService.getListingPDA(propertyId);
    
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