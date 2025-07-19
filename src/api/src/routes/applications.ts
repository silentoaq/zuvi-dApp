import { Router } from 'express';
import { PublicKey } from '@solana/web3.js';
import { connection, getApplicationPDA, getListingPDA, ZUVI_PROGRAM_ID } from '../config/solana';

const router = Router();

// 取得房源的所有申請
router.get('/listing/:propertyId', async (req, res) => {
  try {
    const { propertyId } = req.params;
    
    const [listingPDA] = getListingPDA(propertyId);
    
    // 取得所有申請帳戶
    const accounts = await connection.getProgramAccounts(ZUVI_PROGRAM_ID, {
      filters: [
        {
          memcmp: {
            offset: 0,
            bytes: 'T8bTEiLmlqIW' // RentalApplication discriminator
          }
        },
        {
          memcmp: {
            offset: 8, // 跳過 discriminator
            bytes: listingPDA.toBase58()
          }
        }
      ]
    });

    const applications = accounts.map(account => ({
      pubkey: account.pubkey.toString(),
      ...JSON.parse(account.account.data.toString())
    }));

    res.json({
      success: true,
      data: applications
    });
  } catch (error) {
    console.error('取得申請列表失敗:', error);
    res.status(500).json({ 
      success: false, 
      error: '取得申請列表失敗' 
    });
  }
});

// 取得用戶的所有申請
router.get('/user/:userDid', async (req, res) => {
  try {
    const { userDid } = req.params;
    
    const userPubkey = new PublicKey(userDid);
    
    // 取得用戶的所有申請
    const accounts = await connection.getProgramAccounts(ZUVI_PROGRAM_ID, {
      filters: [
        {
          memcmp: {
            offset: 0,
            bytes: 'T8bTEiLmlqIW' // RentalApplication discriminator
          }
        },
        {
          memcmp: {
            offset: 40, // discriminator(8) + listing(32)
            bytes: userPubkey.toBase58()
          }
        }
      ]
    });

    const applications = [];
    
    for (const account of accounts) {
      try {
        const appData = JSON.parse(account.account.data.toString());
        
        // 取得對應的房源資料
        const listingAccount = await connection.getAccountInfo(new PublicKey(appData.listing));
        let listingData = null;
        
        if (listingAccount) {
          listingData = JSON.parse(listingAccount.data.toString());
        }

        applications.push({
          pubkey: account.pubkey.toString(),
          ...appData,
          listingData
        });
      } catch (error) {
        console.warn('解析申請資料失敗:', error);
      }
    }

    res.json({
      success: true,
      data: applications
    });
  } catch (error) {
    console.error('取得用戶申請失敗:', error);
    res.status(500).json({ 
      success: false, 
      error: '取得用戶申請失敗' 
    });
  }
});

// 提交租房申請
router.post('/', async (req, res) => {
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

    const [listingPDA] = getListingPDA(propertyId);
    const applicantPubkey = new PublicKey(applicantDid);
    const [applicationPDA] = getApplicationPDA(listingPDA, applicantPubkey);

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

// 房東接受申請
router.post('/:applicationId/accept', async (req, res) => {
  try {
    const { applicationId } = req.params;
    const { ownerDid } = req.body;

    if (!ownerDid) {
      return res.status(400).json({ error: '缺少擁有者 DID' });
    }

    const applicationPubkey = new PublicKey(applicationId);
    
    // 取得申請資料以獲取房源地址
    const applicationAccount = await connection.getAccountInfo(applicationPubkey);
    if (!applicationAccount) {
      return res.status(404).json({ error: '申請不存在' });
    }

    const applicationData = JSON.parse(applicationAccount.data.toString());
    const listingPubkey = new PublicKey(applicationData.listing);

    res.json({
      success: true,
      data: {
        listingPDA: listingPubkey.toString(),
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

// 房東拒絕申請
router.post('/:applicationId/reject', async (req, res) => {
  try {
    const { applicationId } = req.params;
    const { ownerDid } = req.body;

    if (!ownerDid) {
      return res.status(400).json({ error: '缺少擁有者 DID' });
    }

    const applicationPubkey = new PublicKey(applicationId);
    
    // 取得申請資料以獲取房源地址
    const applicationAccount = await connection.getAccountInfo(applicationPubkey);
    if (!applicationAccount) {
      return res.status(404).json({ error: '申請不存在' });
    }

    const applicationData = JSON.parse(applicationAccount.data.toString());
    const listingPubkey = new PublicKey(applicationData.listing);

    res.json({
      success: true,
      data: {
        listingPDA: listingPubkey.toString(),
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

export { router as applicationsRoutes };