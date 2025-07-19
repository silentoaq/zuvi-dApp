import { Router } from 'express';
import { PublicKey } from '@solana/web3.js';
import { connection, getListingPDA, ZUVI_PROGRAM_ID } from '../config/solana';
import { ipfsService, PropertyDetailsData } from '../services/ipfs';

const router = Router();

// 取得所有房源
router.get('/', async (req, res) => {
  try {
    const { status = 'Available' } = req.query;
    
    // 從區塊鏈取得所有房源帳戶
    const accounts = await connection.getProgramAccounts(ZUVI_PROGRAM_ID, {
      filters: [
        {
          memcmp: {
            offset: 0,
            bytes: 'AhkZIQwFswtr' // PropertyListing discriminator
          }
        }
      ]
    });

    const listings = [];
    
    for (const account of accounts) {
      try {
        // 這裡會用到 zuvi.ts types 來解析資料
        const listingData = JSON.parse(account.account.data.toString());
        
        // 如果指定狀態，過濾結果
        if (status && listingData.status !== status) {
          continue;
        }

        // 從 IPFS 取得詳細資料
        let propertyDetails = null;
        if (listingData.propertyDetailsHash) {
          try {
            propertyDetails = await ipfsService.getData(listingData.propertyDetailsHash);
          } catch (error) {
            console.warn('無法取得房源詳細資料:', listingData.propertyDetailsHash);
          }
        }

        listings.push({
          pubkey: account.pubkey.toString(),
          ...listingData,
          propertyDetails
        });
      } catch (error) {
        console.warn('解析房源資料失敗:', error);
      }
    }

    res.json({
      success: true,
      data: listings
    });
  } catch (error) {
    console.error('取得房源列表失敗:', error);
    res.status(500).json({ 
      success: false, 
      error: '取得房源列表失敗' 
    });
  }
});

// 取得單一房源
router.get('/:propertyId', async (req, res) => {
  try {
    const { propertyId } = req.params;
    
    const [listingPDA] = getListingPDA(propertyId);
    const accountInfo = await connection.getAccountInfo(listingPDA);
    
    if (!accountInfo) {
      return res.status(404).json({ 
        success: false, 
        error: '房源不存在' 
      });
    }

    // 解析房源資料
    const listingData = JSON.parse(accountInfo.data.toString());
    
    // 從 IPFS 取得詳細資料
    let propertyDetails = null;
    if (listingData.propertyDetailsHash) {
      try {
        propertyDetails = await ipfsService.getData(listingData.propertyDetailsHash);
      } catch (error) {
        console.warn('無法取得房源詳細資料:', listingData.propertyDetailsHash);
      }
    }

    res.json({
      success: true,
      data: {
        pubkey: listingPDA.toString(),
        ...listingData,
        propertyDetails
      }
    });
  } catch (error) {
    console.error('取得房源失敗:', error);
    res.status(500).json({ 
      success: false, 
      error: '取得房源失敗' 
    });
  }
});

// 發布房源 (需要前端簽名)
router.post('/', async (req, res) => {
  try {
    const {
      propertyId,
      ownerDid,
      ownerAttestation,
      monthlyRent,
      depositMonths,
      propertyDetails
    } = req.body;

    // 驗證必要欄位
    if (!propertyId || !ownerDid || !ownerAttestation || !monthlyRent || !depositMonths || !propertyDetails) {
      return res.status(400).json({ error: '缺少必要欄位' });
    }

    // 上傳房源詳細資料到 IPFS
    const propertyDetailsHash = await ipfsService.uploadPropertyDetails(propertyDetails as PropertyDetailsData);

    // 準備交易資料
    const [listingPDA] = getListingPDA(propertyId);
    
    res.json({
      success: true,
      data: {
        propertyDetailsHash,
        listingPDA: listingPDA.toString(),
        transactionData: {
          propertyId,
          ownerAttestation,
          monthlyRent: parseInt(monthlyRent),
          depositMonths: parseInt(depositMonths),
          propertyDetailsHash
        }
      }
    });
  } catch (error) {
    console.error('準備房源發布失敗:', error);
    res.status(500).json({ 
      success: false, 
      error: '準備房源發布失敗' 
    });
  }
});

// 下架房源
router.delete('/:propertyId', async (req, res) => {
  try {
    const { propertyId } = req.params;
    const { ownerDid } = req.body;

    if (!ownerDid) {
      return res.status(400).json({ error: '缺少擁有者 DID' });
    }

    const [listingPDA] = getListingPDA(propertyId);
    
    res.json({
      success: true,
      data: {
        listingPDA: listingPDA.toString(),
        transactionData: {
          propertyId
        }
      }
    });
  } catch (error) {
    console.error('準備下架房源失敗:', error);
    res.status(500).json({ 
      success: false, 
      error: '準備下架房源失敗' 
    });
  }
});

export { router as listingsRoutes };